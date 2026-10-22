import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { isProductSlug, isSameOriginRequest } from "@/lib/validation";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const nameEn = String(body.nameEn ?? body.name ?? "").trim();
    const nameCn = String(body.nameCn ?? nameEn).trim();
    const slug = String(body.slug ?? "").trim().toLowerCase();
    const categoryId = Number(body.categoryId);
    const shortDescriptionEn = String(body.shortDescriptionEn ?? body.shortDescription ?? "").trim();
    const shortDescriptionCn = String(body.shortDescriptionCn ?? shortDescriptionEn).trim();
    const descriptionEn = String(body.descriptionEn ?? shortDescriptionEn).trim();
    const descriptionCn = String(body.descriptionCn ?? shortDescriptionCn).trim();
    if (
      !nameEn ||
      !nameCn ||
      !isProductSlug(slug) ||
      !Number.isInteger(categoryId) ||
      categoryId <= 0 ||
      !shortDescriptionEn ||
      !shortDescriptionCn
    ) {
      return NextResponse.json({ error: "中英文名称、分类和中英文简述均为必填项。" }, { status: 400 });
    }

    const rawImages = JSON.parse(String(body.images ?? "[]")) as Array<{
      imageUrl?: string;
      base64?: string;
      mimeType?: string;
      altText?: string;
    }>;
    const images = rawImages
      .filter((image) => Boolean(image.imageUrl?.trim() || image.base64?.trim()))
      .slice(0, 12);
    const specifications = JSON.parse(String(body.specifications ?? "[]")) as Array<{
      label?: string;
      value?: string;
    }>;
    const category = await prisma.productCategory.findUnique({ where: { id: categoryId } });
    if (!category) return NextResponse.json({ error: "产品分类不存在。" }, { status: 400 });

    const product = await prisma.product.create({
      data: {
        slug,
        categoryId,
        sku: String(body.sku ?? "").trim() || null,
        moq: String(body.moq ?? "").trim() || null,
        leadTime: String(body.leadTime ?? "").trim() || null,
        seoTitle: String(body.seoTitle ?? "").trim() || null,
        seoDescription: String(body.seoDescription ?? "").trim() || null,
        // 保留旧字段，兼容历史代码；新的图片统一写入 product_images。
        imageUrl: images.find((image) => image.imageUrl)?.imageUrl?.trim() || null,
        status: body.publish === "true" ? "PUBLISHED" : "DRAFT",
        translations: {
          create: [
            {
            language: "en",
            name: nameEn,
            shortDescription: shortDescriptionEn,
            description: descriptionEn,
            },
            {
            language: "zh",
            name: nameCn,
            shortDescription: shortDescriptionCn,
            description: descriptionCn,
            },
          ],
        },
        images: {
          create: images.map((image, index) => ({
            sortOrder: index,
            isPrimary: index === 0,
            imageUrl: image.imageUrl?.trim() || null,
            imageBlob: image.base64 ? Buffer.from(image.base64, "base64") : null,
            mimeType: image.mimeType || null,
            altText: image.altText || nameCn,
          })),
        },
        specifications: {
          create: specifications
            .filter((item) => item.label?.trim() && item.value?.trim())
            .slice(0, 30)
            .map((item, index) => ({
              label: item.label!.trim(),
              value: item.value!.trim(),
              sortOrder: index,
            })),
        },
      },
    });

    await prisma.operationLog.create({
      data: {
        adminUserId: session.id,
        action: "CREATE",
        resource: "product",
        resourceId: String(product.id),
        summary: `新增产品：${nameCn}`,
      },
    });
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath(`/products/${slug}`);
    return NextResponse.json({ id: product.id });
  } catch (error) {
    const message = error instanceof Error && error.message.includes("Unique constraint")
      ? "URL 标识或 SKU 已存在，请修改后重试。"
      : "Unable to save product. Check the submitted data.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
