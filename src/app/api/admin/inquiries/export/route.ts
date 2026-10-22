import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
    include: { product: { include: { translations: { where: { language: "zh" } } } } },
  });
  const rows = inquiries.map((item) => ({
    ID: item.id,
    客户姓名: item.name,
    公司: item.company ?? "",
    邮箱: item.email,
    WhatsApp: item.whatsapp ?? "",
    国家: item.country ?? "",
    产品: item.product?.translations[0]?.name ?? "",
    数量: item.quantity ?? "",
    规格: item.specification ?? "",
    留言: item.message,
    状态: item.status,
    提交时间: item.createdAt.toISOString(),
  }));
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = [
    { wch: 8 }, { wch: 16 }, { wch: 20 }, { wch: 28 }, { wch: 18 }, { wch: 14 },
    { wch: 28 }, { wch: 14 }, { wch: 30 }, { wch: 50 }, { wch: 14 }, { wch: 24 },
  ];
  XLSX.utils.book_append_sheet(workbook, worksheet, "询盘");
  const content = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
  await prisma.operationLog.create({
    data: {
      adminUserId: session.id,
      action: "EXPORT",
      resource: "inquiry",
      summary: "导出询盘 Excel",
    },
  });
  return new Response(content as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=\"inquiries.xlsx\"",
      "Cache-Control": "private, no-store",
    },
  });
}
