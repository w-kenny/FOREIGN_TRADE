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
    const body = (await request.json()) as { items?: Array<{ contentKey?: string; language?: string; content?: string }> };
    const items = (body.items ?? []).filter((item) => item.contentKey && (item.language === "zh" || item.language === "en"));
    await prisma.$transaction(items.map((item) => prisma.siteContent.upsert({
      where: { contentKey_language: { contentKey: item.contentKey!, language: item.language! } },
      update: { content: String(item.content ?? "").trim() },
      create: { contentKey: item.contentKey!, language: item.language!, content: String(item.content ?? "").trim() },
    })));
    await prisma.operationLog.create({
      data: { adminUserId: session.id, action: "UPDATE", resource: "site_content", summary: `更新网站内容 ${items.length} 项` },
    });
    revalidatePath("/");
    revalidatePath("/en");
    revalidatePath("/about");
    revalidatePath("/en/about");
    revalidatePath("/services");
    revalidatePath("/en/services");
    revalidatePath("/faq");
    revalidatePath("/en/faq");
    revalidatePath("/contact");
    revalidatePath("/en/contact");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to save site content." }, { status: 500 });
  }
}
