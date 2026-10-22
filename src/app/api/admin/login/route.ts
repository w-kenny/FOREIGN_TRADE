import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { setAdminSessionCookie } from "@/lib/auth";
import { isSameOriginRequest, normalizeEmail } from "@/lib/validation";

const failedLogins = new Map<string, { count: number; blockedUntil: number }>();

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const email = normalizeEmail(String(body.email ?? ""));
    const password = String(body.password ?? "");
    const key = `${request.headers.get("x-forwarded-for") ?? "local"}:${email}`;
    const attempt = failedLogins.get(key);
    if (attempt && attempt.blockedUntil > Date.now()) {
      return NextResponse.json({ error: "登录尝试过多，请 15 分钟后再试。" }, { status: 429 });
    }
    if (attempt && attempt.blockedUntil <= Date.now()) failedLogins.delete(key);

    if (!email || !password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const admin = await prisma.adminUser.findUnique({ where: { email } });
    const passwordMatches = admin ? await bcrypt.compare(password, admin.passwordHash) : false;
    if (!admin || !admin.isActive || !passwordMatches) {
      const nextCount = (failedLogins.get(key)?.count ?? 0) + 1;
      failedLogins.set(key, {
        count: nextCount,
        blockedUntil: nextCount >= 5 ? Date.now() + 15 * 60 * 1000 : Date.now(),
      });
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    failedLogins.delete(key);

    await prisma.$transaction([
      prisma.adminUser.update({
        where: { id: admin.id },
        data: { lastLoginAt: new Date() },
      }),
      prisma.operationLog.create({
        data: {
          adminUserId: admin.id,
          action: "LOGIN",
          resource: "admin_user",
          resourceId: String(admin.id),
          summary: "管理员登录",
        },
      }),
    ]);

    const response = NextResponse.json({ ok: true });
    return setAdminSessionCookie(response, {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });
  } catch {
    return NextResponse.json({ error: "Unable to sign in" }, { status: 500 });
  }
}
