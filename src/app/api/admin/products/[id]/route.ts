import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { isProductSlug, isSameOriginRequest } from "@/lib/validation";

type ProductImageInput = {
  id?: number;
  imageUrl?: string;
  base64?: string;
  mimeType?: string;
  altText?: string;
  sortOrder?: number;
  isPrimary?: boolean;
};

type SpecificationInput = {
  label?: string;
  value?: string;
};

async function getProductId(context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const productId = Number(id);
  return Number.isInteger(productId) && productId > 0 ? productId : null;
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const productId = await getProductId(context);
  if (!productId) return NextResponse.json({ error: "Invalid product id" }, { status: 400 });

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const existing = await prisma.product.findUnique({
      where: { id: productId },
      include: { translations: true, images: true },
    });
    if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const nameEn = String(body.nameEn ?? "").trim();
    const nameCn = String(body.nameCn ?? "").trim();
    const slug = String(body.slug ?? "").trim().toLowerCase();
    const categoryId = Number(body.categoryId);
    const shortDescriptionEn = String(body.shortDescriptionEn ?? "").trim();
    const shortDescriptionCn = String(body.shortDescriptionCn ?? "").trim();
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

    const category = await prisma.productCategory.findUnique({ where: { id: categoryId } });
    if (!category) return NextResponse.json({ error: "产品分类不存在。" }, { status: 400 });

    const slugOwner = await prisma.product.findFirst({
      where: { slug, NOT: { id: productId } },
      select: { id: true },
    });
    if (slugOwner) return NextResponse.json({ error: "URL 标识已被其他产品使用。" }, { status: 400 });

    const rawExistingImages = JSON.parse(String(body.existingImages ?? "[]")) as ProductImageInput[];
    const existingImageIds = new Set(existing.images.map((image) => image.id));
    const keepIds = new Set(
      rawExistingImages
        .map((image) => Number(image.id))
        .filter((id) => Number.isInteger(id) && id > 0 && existingImageIds.has(id)),
    );
    const newImages = JSON.parse(String(body.newImages ?? "[]")) as ProductImageInput[];
    const specifications = JSON.parse(String(body.specifications ?? "[]")) as SpecificationInput[];
    const imageSorts = rawExistingImages
      .map((image, index) => ({
        id: Number(image.id),
        sortOrder: Number.isInteger(Number(image.sortOrder)) ? Number(image.sortOrder) : index,
        isPrimary: Boolean(image.isPrimary),
        imageUrl: image.imageUrl?.trim(),
        altText: image.altText?.trim(),
      }))
      .filter((image) => keepIds.has(image.id));

    const primaryExistingImage = imageSorts.find((image) => image.isPrimary);
    const firstNewUrl = newImages.find((image) => image.imageUrl?.trim())?.imageUrl?.trim() || null;
    const legacyImageUrl = primaryExistingImage?.imageUrl || firstNewUrl || existing.imageUrl;

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId },
        data: {
          slug,
          categoryId,
          sku: String(body.sku ?? "").trim() || null,
          moq: String(body.moq ?? "").trim() || null,
          leadTime: String(body.leadTime ?? "").trim() || null,
          seoTitle: String(body.seoTitle ?? "").trim() || null,
          seoDescription: String(body.seoDescription ?? "").trim() || null,
          imageUrl: legacyImageUrl,
          status: body.status === "PUBLISHED" || body.status === "ARCHIVED" ? body.status : "DRAFT",
        },
      });

      await tx.productTranslation.upsert({
        where: { productId_language: { productId, language: "en" } },
        update: {
          name: nameEn,
          shortDescription: shortDescriptionEn,
          description: String(body.descriptionEn ?? shortDescriptionEn).trim(),
        },
        create: {
          productId,
          language: "en",
          name: nameEn,
          shortDescription: shortDescriptionEn,
          description: String(body.descriptionEn ?? shortDescriptionEn).trim(),
        },
      });
      await tx.productTranslation.upsert({
        where: { productId_language: { productId, language: "zh" } },
        update: {
          name: nameCn,
          shortDescription: shortDescriptionCn,
          description: String(body.descriptionCn ?? shortDescriptionCn).trim(),
        },
        create: {
          productId,
          language: "zh",
          name: nameCn,
          shortDescription: shortDescriptionCn,
          description: String(body.descriptionCn ?? shortDescriptionCn).trim(),
        },
      });

      await tx.productSpecification.deleteMany({ where: { productId } });
      const cleanSpecifications = specifications
        .filter((item) => item.label?.trim() && item.value?.trim())
        .slice(0, 30);
      if (cleanSpecifications.length > 0) {
        await tx.productSpecification.createMany({
          data: cleanSpecifications.map((item, index) => ({
            productId,
            label: item.label!.trim(),
            value: item.value!.trim(),
            sortOrder: index,
          })),
        });
      }

      await tx.productImage.deleteMany({
        where: { productId, ...(keepIds.size > 0 ? { id: { notIn: [...keepIds] } } : {}) },
      });

      // 先整体向后移动，避免唯一排序约束在交换顺序时短暂冲突。
      if (imageSorts.length > 0) {
        await tx.productImage.updateMany({ where: { productId }, data: { sortOrder: { increment: 1000 } } });
        for (const image of imageSorts) {
          await tx.productImage.update({
            where: { id: image.id },
            data: {
              sortOrder: image.sortOrder,
              isPrimary: image.isPrimary,
              ...(image.imageUrl !== undefined ? { imageUrl: image.imageUrl || null } : {}),
              ...(image.altText !== undefined ? { altText: image.altText || null } : {}),
            },
          });
        }
      }

      const validNewImages = newImages
        .filter((image) => image.imageUrl?.trim() || image.base64?.trim())
        .slice(0, 12);
      if (validNewImages.length > 0) {
        const currentMax = imageSorts.reduce((max, image) => Math.max(max, image.sortOrder), -1);
        await tx.productImage.createMany({
          data: validNewImages
            .map((image, index) => ({
              productId,
              sortOrder: currentMax + index + 1,
              isPrimary: imageSorts.length === 0 && index === 0,
              imageUrl: image.imageUrl?.trim() || null,
              imageBlob: image.base64 ? Buffer.from(image.base64, "base64") : null,
              mimeType: image.mimeType || null,
              altText: image.altText?.trim() || nameCn,
            })),
        });
      }

      await tx.productImage.updateMany({ where: { productId }, data: { isPrimary: false } });
      if (primaryExistingImage) {
        await tx.productImage.update({
          where: { id: primaryExistingImage.id },
          data: { isPrimary: true },
        });
      } else if (imageSorts.length > 0) {
        await tx.productImage.update({
          where: { id: imageSorts[0].id },
          data: { isPrimary: true },
        });
      } else if (validNewImages.length > 0) {
        const firstNewSortOrder = validNewImages.length > 0 ? 0 : -1;
        await tx.productImage.update({
          where: { productId_sortOrder: { productId, sortOrder: firstNewSortOrder } },
          data: { isPrimary: true },
        });
      }
    });

    await prisma.operationLog.create({
      data: {
        adminUserId: session.id,
        action: "UPDATE",
        resource: "product",
        resourceId: String(productId),
        summary: `编辑产品：${nameCn}`,
      },
    });
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath(`/products/${existing.slug}`);
    revalidatePath(`/products/${slug}`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error && error.message.includes("Unique constraint")
      ? "URL 标识或 SKU 已存在，请修改后重试。"
      : "Unable to update product.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const productId = await getProductId(context);
  if (!productId) return NextResponse.json({ error: "Invalid product id" }, { status: 400 });

  try {
    const body = (await request.json()) as { action?: string; status?: string };
    if (body.action === "duplicate") {
      const source = await prisma.product.findUnique({
        where: { id: productId },
        include: { translations: true, images: true, specifications: true },
      });
      if (!source) return NextResponse.json({ error: "Product not found" }, { status: 404 });

      const baseSlug = `${source.slug}-copy`;
      let slug = baseSlug;
      let counter = 2;
      while (await prisma.product.findUnique({ where: { slug }, select: { id: true } })) {
        slug = `${baseSlug}-${counter++}`;
      }

      const clone = await prisma.product.create({
        data: {
          slug,
          status: "DRAFT",
          sku: source.sku ? `${source.sku}-COPY` : null,
          categoryId: source.categoryId,
          moq: source.moq,
          leadTime: source.leadTime,
          imageUrl: source.imageUrl,
          seoTitle: source.seoTitle,
          seoDescription: source.seoDescription,
          translations: { create: source.translations.map(({ language, name, shortDescription, description, applications, packaging }) => ({ language, name: `${name}（复制）`, shortDescription, description, applications, packaging })) },
          images: { create: source.images.map(({ sortOrder, isPrimary, imageUrl, mimeType, imageBlob, altText }) => ({ sortOrder, isPrimary, imageUrl, mimeType, imageBlob, altText })) },
          specifications: { create: source.specifications.map(({ sortOrder, label, value }) => ({ sortOrder, label, value })) },
        },
      });
      await prisma.operationLog.create({
        data: {
          adminUserId: session.id,
          action: "DUPLICATE",
          resource: "product",
          resourceId: String(clone.id),
          summary: `复制产品：${source.slug}`,
        },
      });
      return NextResponse.json({ id: clone.id });
    }

    const nextStatus = body.status;
    if (!["DRAFT", "PUBLISHED", "ARCHIVED"].includes(String(nextStatus))) {
      return NextResponse.json({ error: "Invalid product status" }, { status: 400 });
    }
    const product = await prisma.product.update({
      where: { id: productId },
      data: { status: nextStatus as "DRAFT" | "PUBLISHED" | "ARCHIVED" },
    });
    await prisma.operationLog.create({
      data: {
        adminUserId: session.id,
        action: "STATUS",
        resource: "product",
        resourceId: String(productId),
        summary: `产品状态变更为：${nextStatus}`,
      },
    });
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath(`/products/${product.slug}`);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to update product status." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isSameOriginRequest(_request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "OWNER") return NextResponse.json({ error: "只有 OWNER 可以删除产品。" }, { status: 403 });
  const productId = await getProductId(context);
  if (!productId) return NextResponse.json({ error: "Invalid product id" }, { status: 400 });

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  await prisma.product.delete({ where: { id: productId } });
  await prisma.operationLog.create({
    data: {
      adminUserId: session.id,
      action: "DELETE",
      resource: "product",
      resourceId: String(productId),
      summary: `删除产品：${product.slug}`,
    },
  });
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath(`/products/${product.slug}`);
  return NextResponse.json({ ok: true });
}
