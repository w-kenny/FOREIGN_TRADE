import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import LogoutButton from "./logout-button";
import styles from "./admin.module.css";

export default async function AdminDashboard() {
  const [published, drafts, inquiries, archived, session] = await Promise.all([
    prisma.product.count({ where: { status: "PUBLISHED" } }).catch(() => 0),
    prisma.product.count({ where: { status: "DRAFT" } }).catch(() => 0),
    prisma.inquiry.count({ where: { status: "NEW" } }).catch(() => 0),
    prisma.product.count({ where: { status: "ARCHIVED" } }).catch(() => 0),
    getAdminSession(),
  ]);

  return (
    <main className={styles.admin}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}><span>PE</span><strong>PE SOHO</strong></div>
        <nav><Link className={styles.active} href="/admin">概览</Link><Link href="/admin/products">产品管理</Link><Link href="/admin/categories">产品分类</Link><Link href="/admin/inquiries">客户询盘</Link><Link href="/admin/content">网站内容</Link><Link href="/admin/settings">网站设置</Link>{session?.role === "OWNER" && <Link href="/admin/users">管理员账号</Link>}</nav>
        <Link className={styles.viewSite} href="/">查看前台 ↗</Link>
      </aside>
      <section className={styles.content}>
        <header className={styles.topbar}><div><p className={styles.eyebrow}>后台管理</p><h1>欢迎回来。</h1></div><span className={styles.account}>{session?.name ?? "管理员"} · {session?.email ?? ""}<LogoutButton /></span></header>
        <div className={styles.stats}>
          <div><small>已发布产品</small><strong>{published}</strong><Link href="/admin/products">管理产品 ↗</Link></div>
          <div><small>草稿产品</small><strong>{drafts}</strong><Link href="/admin/products">继续编辑 ↗</Link></div>
          <div><small>新询盘</small><strong>{inquiries}</strong><Link href="/admin/inquiries">查看询盘 ↗</Link></div>
          <div><small>已归档产品</small><strong>{archived}</strong><Link href="/admin/products">查看产品 ↗</Link></div>
        </div>
        <section className={styles.nextStep}><p className={styles.eyebrow}>下一步</p><h2>让公开产品目录保持准确、清晰、值得信任。</h2><p>新增产品，补充中英文内容，只发布已经确认完成的产品信息。</p><Link className={styles.button} href="/admin/products/new">新增产品 ↗</Link></section>
      </section>
    </main>
  );
}
