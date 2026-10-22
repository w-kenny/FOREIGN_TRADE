import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductForm from "../new/product-form";
import styles from "../new/new.module.css";

function toDataUrl(blob: Uint8Array | null, mimeType: string | null, fallback: string) {
  return blob
    ? `data:${mimeType ?? "image/jpeg"};base64,${Buffer.from(blob).toString("base64")}`
    : fallback;
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) notFound();

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: productId },
      include: {
        translations: { orderBy: { language: "asc" } },
        images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
        specifications: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.productCategory.findMany({ orderBy: { nameCn: "asc" } }),
  ]);
  if (!product) notFound();

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <Link href="/admin/products" className={styles.back}>← 返回产品管理</Link>
          <p className={styles.eyebrow}>产品目录管理</p>
          <h1>编辑产品</h1>
        </div>
      </header>
      <ProductForm
        categories={categories.map((category) => ({ id: category.id, name: category.name, nameCn: category.nameCn }))}
        product={{
          id: product.id,
          status: product.status,
          slug: product.slug,
          sku: product.sku,
          categoryId: product.categoryId,
          moq: product.moq,
          leadTime: product.leadTime,
          seoTitle: product.seoTitle,
          seoDescription: product.seoDescription,
          translations: product.translations.map((item) => ({
            language: item.language,
            name: item.name,
            shortDescription: item.shortDescription,
            description: item.description,
          })),
          images: product.images.map((image) => ({
            id: image.id,
            src: toDataUrl(image.imageBlob, image.mimeType, image.imageUrl ?? ""),
            imageUrl: image.imageUrl,
            altText: image.altText,
            sortOrder: image.sortOrder,
            isPrimary: image.isPrimary,
          })),
          specifications: product.specifications.map((item) => ({ label: item.label, value: item.value })),
        }}
      />
    </main>
  );
}
