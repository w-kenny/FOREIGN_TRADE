import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import InquiryDetail from "./inquiry-detail";
import styles from "../inquiries.module.css";

export default async function AdminInquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inquiryId = Number(id);
  if (!Number.isInteger(inquiryId)) notFound();

  const inquiry = await prisma.inquiry.findUnique({
    where: { id: inquiryId },
    include: {
      product: { include: { translations: { where: { language: "zh" } } } },
      attachments: { select: { id: true, fileName: true, fileSize: true, mimeType: true } },
      notes: { orderBy: { createdAt: "asc" }, include: { adminUser: { select: { name: true, email: true } } } },
    },
  });
  if (!inquiry) notFound();

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div><Link href="/admin/inquiries" className={styles.back}>← 返回询盘列表</Link><p className={styles.eyebrow}>询盘管理</p><h1>询盘详情</h1></div>
        <Link className={styles.siteLink} href={`mailto:${inquiry.email}`}>邮件联系 ↗</Link>
      </header>
      <InquiryDetail inquiry={{
        ...inquiry,
        notes: inquiry.notes.map((note) => ({ ...note, createdAt: note.createdAt.toISOString() })),
      }} />
    </main>
  );
}
