import { NextResponse } from "next/server";
import { clearAdminSessionCookie, getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSameOriginRequest } from "@/lib/validation";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const session = await getAdminSession();
  if (session) {
    await prisma.operationLog.create({
      data: {
        adminUserId: session.id,
        action: "LOGOUT",
        resource: "admin_user",
        resourceId: String(session.id),
        summary: "管理员退出登录",
      },
    }).catch(() => undefined);
  }

  return clearAdminSessionCookie(NextResponse.json({ ok: true }));
}
