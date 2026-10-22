import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { isSameOriginRequest } from "@/lib/validation";

export async function PUT(request: Request) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = (await request.json()) as { items?: Array<{ settingKey?: string; settingValue?: string }> };
    const items = (body.items ?? []).filter((item) => item.settingKey);
    await prisma.$transaction(items.map((item) => prisma.siteSetting.upsert({
      where: { settingKey: item.settingKey! },
      update: { settingValue: String(item.settingValue ?? "").trim() },
      create: { settingKey: item.settingKey!, settingValue: String(item.settingValue ?? "").trim() },
    })));
    await prisma.operationLog.create({
      data: { adminUserId: session.id, action: "UPDATE", resource: "site_setting", summary: `更新网站设置 ${items.length} 项` },
    });
    revalidatePath("/contact");
    revalidatePath("/en/contact");
    revalidatePath("/");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to save site settings." }, { status: 500 });
  }
}
