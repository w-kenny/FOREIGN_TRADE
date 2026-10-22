import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { isSameOriginRequest } from "@/lib/validation";

async function ownerOnly() {
  const session = await getAdminSession();
  return session?.role === "OWNER" ? session : null;
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const session = await ownerOnly();
  if (!session) return NextResponse.json({ error: "只有 OWNER 可以管理管理员账号。" }, { status: 403 });
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const email = String(body.email ?? "").trim().toLowerCase();
    const name = String(body.name ?? "").trim();
    const password = String(body.password ?? "");
    const role = body.role === "EDITOR" ? "EDITOR" : "OWNER";
    if (!email || !email.includes("@") || !name || password.length < 8) {
      return NextResponse.json({ error: "邮箱、姓名和至少 8 位密码均为必填项。" }, { status: 400 });
    }
    const admin = await prisma.adminUser.create({
      data: { email, name, role, passwordHash: await bcrypt.hash(password, 12), isActive: true },
      select: { id: true, email: true, name: true, role: true, isActive: true, lastLoginAt: true },
    });
    await prisma.operationLog.create({
      data: { adminUserId: session.id, action: "CREATE", resource: "admin_user", resourceId: String(admin.id), summary: `新增管理员：${email}` },
    });
    return NextResponse.json({ admin });
  } catch (error) {
    const message = error instanceof Error && error.message.includes("Unique constraint") ? "这个邮箱已经存在。" : "Unable to create admin.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const session = await ownerOnly();
  if (!session) return NextResponse.json({ error: "只有 OWNER 可以管理管理员账号。" }, { status: 403 });
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const id = Number(body.id);
    const email = String(body.email ?? "").trim().toLowerCase();
    const name = String(body.name ?? "").trim();
    const password = String(body.password ?? "");
    const role = body.role === "EDITOR" ? "EDITOR" : "OWNER";
    const isActive = body.isActive !== false;
    if (!Number.isInteger(id) || !email || !name || (password && password.length < 8)) {
      return NextResponse.json({ error: "管理员信息不完整。" }, { status: 400 });
    }
    if (id === session.id && !isActive) {
      return NextResponse.json({ error: "不能停用当前登录账号。" }, { status: 400 });
    }
    const admin = await prisma.adminUser.update({
      where: { id },
      data: {
        email,
        name,
        role,
        isActive,
        ...(password ? { passwordHash: await bcrypt.hash(password, 12) } : {}),
      },
      select: { id: true, email: true, name: true, role: true, isActive: true, lastLoginAt: true },
    });
    await prisma.operationLog.create({
      data: { adminUserId: session.id, action: "UPDATE", resource: "admin_user", resourceId: String(id), summary: `编辑管理员：${email}` },
    });
    return NextResponse.json({ admin });
  } catch {
    return NextResponse.json({ error: "Unable to update admin." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const session = await ownerOnly();
  if (!session) return NextResponse.json({ error: "只有 OWNER 可以管理管理员账号。" }, { status: 403 });
  const body = (await request.json()) as { id?: number };
  const id = Number(body.id);
  if (!Number.isInteger(id) || id === session.id) {
    return NextResponse.json({ error: "不能删除当前登录账号。" }, { status: 400 });
  }
  const admin = await prisma.adminUser.findUnique({ where: { id } });
  if (!admin) return NextResponse.json({ error: "管理员不存在。" }, { status: 404 });
  await prisma.adminUser.delete({ where: { id } });
  await prisma.operationLog.create({
    data: { adminUserId: session.id, action: "DELETE", resource: "admin_user", resourceId: String(id), summary: `删除管理员：${admin.email}` },
  });
  return NextResponse.json({ ok: true });
}
