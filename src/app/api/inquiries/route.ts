import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAllowedAttachmentSize, isSameOriginRequest, isValidEmail, normalizeEmail } from "@/lib/validation";
import { sendInquiryEmails } from "@/lib/email";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const name = String(body.name ?? "").trim();
    const email = normalizeEmail(String(body.email ?? ""));
    const whatsapp = String(body.whatsapp ?? "").trim();
    const productName = String(body.product ?? "").trim();
    const specification = String(body.specification ?? "").trim();
    const message = String(body.message ?? "").trim();

    if (!name || !isValidEmail(email) || !productName || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const product = await prisma.product.findFirst({
      where: {
        status: "PUBLISHED",
        OR: [
          { slug: productName },
          { translations: { some: { name: productName } } },
        ],
      },
      select: { id: true },
    }).catch(() => null);

    const rawAttachments = Array.isArray(body.attachments) ? body.attachments : [];
    const attachments = rawAttachments
      .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
      .map((item) => ({
        fileName: String(item.fileName ?? "attachment").slice(0, 255),
        mimeType: String(item.mimeType ?? "application/octet-stream").slice(0, 120),
        fileSize: Number(item.fileSize ?? 0),
        fileBase64: String(item.fileBase64 ?? ""),
      }))
      .filter((item) => item.fileBase64 && item.fileSize > 0)
      .slice(0, 3);
    if (attachments.some((item) => !isAllowedAttachmentSize(item.fileSize))) {
      return NextResponse.json({ error: "单个附件不能超过 5 MB" }, { status: 400 });
    }
    const attachmentBuffers = attachments.map((item) => ({
      ...item,
      buffer: Buffer.from(item.fileBase64, "base64"),
    }));
    if (attachmentBuffers.some((item) => !isAllowedAttachmentSize(item.buffer.length) || item.buffer.length !== item.fileSize)) {
      return NextResponse.json({ error: "附件内容无效或超过 5 MB" }, { status: 400 });
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        name,
        email,
        company: String(body.company ?? "").trim() || null,
        whatsapp: whatsapp || null,
        country: String(body.country ?? "").trim() || null,
        quantity: String(body.quantity ?? "").trim() || null,
        specification: specification || null,
        message,
        productId: product?.id ?? null,
        attachments: {
          create: attachmentBuffers.map((item) => ({
            fileName: item.fileName,
            mimeType: item.mimeType,
            fileSize: item.fileSize,
            fileBlob: item.buffer,
          })),
        },
      },
      include: { product: { include: { translations: { where: { language: "en" } } } } },
    });
    await sendInquiryEmails({
      id: inquiry.id,
      name: inquiry.name,
      email: inquiry.email,
      company: inquiry.company,
      whatsapp: inquiry.whatsapp,
      country: inquiry.country,
      quantity: inquiry.quantity,
      specification: inquiry.specification,
      message: inquiry.message,
      productName: inquiry.product?.translations[0]?.name ?? null,
    }).catch((error) => {
      // SMTP 故障不应让已经保存成功的询盘返回失败。
      console.error("Inquiry email notification failed", error instanceof Error ? error.message : "unknown error");
    });

    return NextResponse.json({ ok: true });
  } catch {
    // 首版不把数据库错误细节返回给访客，避免泄露连接或表结构信息。
    return NextResponse.json({ error: "Unable to save inquiry" }, { status: 500 });
  }
}
