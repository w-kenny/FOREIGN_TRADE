import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { isSameOriginRequest } from "@/lib/validation";

function normalizeSlug(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const slug = normalizeSlug(body.slug);
    const name = String(body.name ?? "").trim();
    const nameCn = String(body.nameCn ?? "").trim();
    if (!name || !nameCn || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return NextResponse.json({ error: "中英文名称和有效的 URL 标识均为必填项。" }, { status: 400 });
    }
    const category = await prisma.productCategory.create({ data: { slug, name, nameCn } });
    await prisma.operationLog.create({
      data: {
        adminUserId: session.id,
        action: "CREATE",
        resource: "product_category",
        resourceId: String(category.id),
        summary: `新增分类：${nameCn}`,
      },
    });
    revalidatePath("/products");
    revalidatePath("/admin/products");
    return NextResponse.json({ id: category.id });
  } catch (error) {
    const message = error instanceof Error && error.message.includes("Unique constraint")
      ? "分类 URL 标识已存在。"
      : "Unable to create category.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const id = Number(body.id);
    const slug = normalizeSlug(body.slug);
    const name = String(body.name ?? "").trim();
    const nameCn = String(body.nameCn ?? "").trim();
    if (!Number.isInteger(id) || !name || !nameCn || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return NextResponse.json({ error: "分类信息不完整。" }, { status: 400 });
    }
    const category = await prisma.productCategory.update({ where: { id }, data: { slug, name, nameCn } });
    await prisma.operationLog.create({
      data: {
        adminUserId: session.id,
        action: "UPDATE",
        resource: "product_category",
        resourceId: String(id),
        summary: `编辑分类：${nameCn}`,
      },
    });
    revalidatePath("/products");
    revalidatePath("/admin/products");
    return NextResponse.json({ ok: true, category });
  } catch {
    return NextResponse.json({ error: "Unable to update category." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "OWNER") return NextResponse.json({ error: "只有 OWNER 可以删除分类。" }, { status: 403 });
  try {
    const body = (await request.json()) as { id?: number };
    const id = Number(body.id);
    const category = await prisma.productCategory.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!category) return NextResponse.json({ error: "分类不存在。" }, { status: 404 });
    if (category._count.products > 0) {
      return NextResponse.json({ error: "该分类仍有关联产品，请先移动产品后再删除。" }, { status: 400 });
    }
    await prisma.productCategory.delete({ where: { id } });
    await prisma.operationLog.create({
      data: {
        adminUserId: session.id,
        action: "DELETE",
        resource: "product_category",
        resourceId: String(id),
        summary: `删除分类：${category.nameCn}`,
      },
    });
    revalidatePath("/products");
    revalidatePath("/admin/products");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete category." }, { status: 400 });
  }
}
