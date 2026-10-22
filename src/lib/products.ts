import { prisma } from "@/lib/prisma";

export type PublicProduct = {
  id: number;
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
  imageUrl: string;
  images: { id: number; src: string; altText: string }[];
  moq: string;
  leadTime: string;
  description: string;
  seoTitle: string | null;
  seoDescription: string | null;
  specifications: { label: string; value: string }[];
};

const fallbackProducts: PublicProduct[] = [
  {
    id: 1,
    slug: "stainless-steel-cable-gland",
    name: "Stainless Steel Cable Gland",
    category: "Cable Accessories",
    shortDescription: "304 stainless steel, IP68 protection, custom sizes available.",
    imageUrl:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=85",
    images: [
      {
        id: 1,
        src: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=85",
        altText: "不锈钢电缆接头",
      },
    ],
    moq: "500 pcs",
    leadTime: "15–25 days",
    description: "304 stainless steel cable gland for industrial and outdoor enclosures.",
    seoTitle: null,
    seoDescription: null,
    specifications: [
      { label: "Material", value: "Stainless Steel 304" },
      { label: "Protection", value: "IP68" },
      { label: "MOQ", value: "500 pcs" },
    ],
  },
];

export function imageToSrc(image: {
  imageBlob: Uint8Array | null;
  mimeType: string | null;
  imageUrl: string | null;
}) {
  return image.imageBlob
    ? `data:${image.mimeType ?? "image/jpeg"};base64,${Buffer.from(image.imageBlob).toString("base64")}`
    : image.imageUrl ?? "";
}

/**
 * 只查询已发布产品，避免草稿和下架产品被公开接口读取。
 * 数据库尚未配置时使用演示数据，让前台在开发初期仍可预览。
 */
export async function getPublishedProducts(
  language = "zh",
  filters?: { query?: string; category?: string },
): Promise<PublicProduct[]> {
  try {
    const products = await prisma.product.findMany({
      where: {
        status: "PUBLISHED",
        ...(filters?.category ? { category: { slug: filters.category } } : {}),
        ...(filters?.query
          ? {
              translations: {
                some: {
                  language,
                  OR: [
                    { name: { contains: filters.query } },
                    { shortDescription: { contains: filters.query } },
                  ],
                },
              },
            }
          : {}),
      },
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
      include: {
        category: true,
        specifications: { orderBy: { sortOrder: "asc" } },
        images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
        translations: { where: { language } },
      },
    });

    return products.map((product) => {
      const translation = product.translations[0];
      return {
        id: product.id,
        slug: product.slug,
        name: translation?.name ?? product.slug,
        category: language === "zh"
          ? product.category.nameCn ?? product.category.name
          : product.category.name,
        shortDescription: translation?.shortDescription ?? "",
        description: translation?.description ?? translation?.shortDescription ?? "",
        seoTitle: product.seoTitle,
        seoDescription: product.seoDescription,
        imageUrl: product.images
          .map((image) => imageToSrc(image))
          .find(Boolean) ?? product.imageUrl ?? fallbackProducts[0].imageUrl,
        images: product.images.map((image) => ({
          id: image.id,
          // 数据库存储的 BLOB 不能直接放进 CSS 或 img src，
          // 因此转换成前台可引用的 data URL；没有 BLOB 时使用 URL。
          src: imageToSrc(image),
          altText: image.altText ?? translation?.name ?? product.slug,
        })),
        moq: product.moq ?? "On request",
        leadTime: product.leadTime ?? "On request",
        specifications: product.specifications.map((item) => ({
          label: item.label,
          value: item.value,
        })),
      };
    });
  } catch {
    return fallbackProducts;
  }
}

export async function getProductCategories() {
  try {
    return await prisma.productCategory.findMany({
      orderBy: { nameCn: "asc" },
      select: { slug: true, name: true, nameCn: true },
    });
  } catch {
    return [];
  }
}

export async function getPublishedProduct(slug: string, language = "zh") {
  const products = await getPublishedProducts(language);
  return products.find((product) => product.slug === slug) ?? null;
}
