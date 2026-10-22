import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { isSameOriginRequest } from "@/lib/validation";

async function readId(context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const value = Number(id);
  return Number.isInteger(value) && value > 0 ? value : null;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = await readId(context);
  if (!id) return NextResponse.json({ error: "Invalid inquiry id" }, { status: 400 });
  const inquiry = await prisma.inquiry.findUnique({
    where: { id },
    include: {
      product: { include: { translations: { where: { language: "zh" } } } },
      attachments: { select: { id: true, fileName: true, mimeType: true, fileSize: true, createdAt: true } },
      notes: { orderBy: { createdAt: "asc" }, include: { adminUser: { select: { name: true, email: true } } } },
    },
  });
  if (!inquiry) return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
  return NextResponse.json(inquiry);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = await readId(context);
  if (!id) return NextResponse.json({ error: "Invalid inquiry id" }, { status: 400 });

  try {
    const body = (await request.json()) as { status?: string };
    if (!["NEW", "IN_PROGRESS", "REPLIED", "CLOSED"].includes(String(body.status))) {
      return NextResponse.json({ error: "Invalid inquiry status" }, { status: 400 });
    }
    const inquiry = await prisma.inquiry.update({
      where: { id },
      data: { status: body.status as "NEW" | "IN_PROGRESS" | "REPLIED" | "CLOSED" },
    });
    await prisma.operationLog.create({
      data: {
        adminUserId: session.id,
        action: "STATUS",
        resource: "inquiry",
        resourceId: String(id),
        summary: `询盘状态变更为：${body.status}`,
      },
    });
    revalidatePath("/admin/inquiries");
    revalidatePath(`/admin/inquiries/${id}`);
    return NextResponse.json({ ok: true, status: inquiry.status });
  } catch {
    return NextResponse.json({ error: "Unable to update inquiry." }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = await readId(context);
  if (!id) return NextResponse.json({ error: "Invalid inquiry id" }, { status: 400 });

  try {
    const body = (await request.json()) as { content?: string; type?: string };
    const content = String(body.content ?? "").trim();
    const type = body.type === "REPLY" ? "REPLY" : "NOTE";
    if (!content) return NextResponse.json({ error: "备注内容不能为空。" }, { status: 400 });
    const note = await prisma.inquiryNote.create({
      data: { inquiryId: id, adminUserId: session.id, type, content },
      include: { adminUser: { select: { name: true, email: true } } },
    });
    if (type === "REPLY") {
      await prisma.inquiry.update({ where: { id }, data: { status: "REPLIED" } });
    }
    await prisma.operationLog.create({
      data: {
        adminUserId: session.id,
        action: type === "REPLY" ? "REPLY" : "NOTE",
        resource: "inquiry",
        resourceId: String(id),
        summary: type === "REPLY" ? "记录客户回复" : "添加内部备注",
      },
    });
    revalidatePath(`/admin/inquiries/${id}`);
    revalidatePath("/admin/inquiries");
    return NextResponse.json({ note });
  } catch {
    return NextResponse.json({ error: "Unable to save inquiry note." }, { status: 500 });
  }
}
