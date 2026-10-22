import Link from "next/link";
import { prisma } from "@/lib/prisma";
import styles from "./inquiries.module.css";

const statusLabels: Record<string, string> = {
  NEW: "新询盘",
  IN_PROGRESS: "处理中",
  REPLIED: "已回复",
  CLOSED: "已关闭",
};

export default async function AdminInquiriesPage() {
  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
    include: { product: { include: { translations: { where: { language: "zh" } } } } },
  }).catch(() => []);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <Link href="/admin" className={styles.back}>← 返回仪表盘</Link>
          <p className={styles.eyebrow}>询盘管理</p>
          <h1>客户询盘</h1>
        </div>
        <div className={styles.headerActions}><Link className={styles.exportLink} href="/api/admin/inquiries/export">导出 Excel ↓</Link><Link className={styles.siteLink} href="/">查看前台 ↗</Link></div>
      </header>
      <section className={styles.table}>
        <div className={styles.tableHead}><span>客户</span><span>公司 / 国家</span><span>感兴趣产品</span><span>状态</span><span>提交时间</span></div>
        {inquiries.length === 0 && <div className={styles.empty}>暂时没有客户询盘。</div>}
        {inquiries.map((inquiry) => (
            <Link className={styles.row} key={inquiry.id} href={`/admin/inquiries/${inquiry.id}`}>
            <div><strong>{inquiry.name}</strong><small>{inquiry.email}</small></div>
            <span>{[inquiry.company, inquiry.country].filter(Boolean).join(" / ") || "未填写"}</span>
            <span>{inquiry.product?.translations[0]?.name ?? "未关联产品"}</span>
            <span className={`${styles.status} ${styles[inquiry.status.toLowerCase()]}`}>{statusLabels[inquiry.status] ?? inquiry.status}</span>
            <time dateTime={inquiry.createdAt.toISOString()}>{inquiry.createdAt.toLocaleDateString("zh-CN")}</time>
            </Link>
        ))}
      </section>
    </main>
  );
}
