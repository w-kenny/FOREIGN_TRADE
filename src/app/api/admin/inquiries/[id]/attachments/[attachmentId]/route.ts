import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string; attachmentId: string }> },
) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, attachmentId } = await context.params;
  const inquiryId = Number(id);
  const fileId = Number(attachmentId);
  if (!Number.isInteger(inquiryId) || !Number.isInteger(fileId)) {
    return NextResponse.json({ error: "Invalid attachment id" }, { status: 400 });
  }

  const attachment = await prisma.inquiryAttachment.findFirst({
    where: { id: fileId, inquiryId },
  });
  if (!attachment) return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
  if (attachment.fileBlob) {
    return new Response(attachment.fileBlob, {
      headers: {
        "Content-Type": attachment.mimeType,
        "Content-Length": String(attachment.fileSize),
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(attachment.fileName)}`,
        "Cache-Control": "private, no-store",
      },
    });
  }
  if (attachment.fileUrl) return NextResponse.redirect(attachment.fileUrl);
  return NextResponse.json({ error: "Attachment content is unavailable" }, { status: 404 });
}
