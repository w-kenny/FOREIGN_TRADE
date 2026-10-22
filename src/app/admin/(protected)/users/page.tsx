import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import UserManager from "./user-manager";
import styles from "./users.module.css";

export default async function AdminUsersPage() {
  const session = await getAdminSession();
  if (session?.role !== "OWNER") redirect("/admin");
  const admins = await prisma.adminUser.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true, name: true, role: true, isActive: true, lastLoginAt: true },
  });
  return (
    <main className={styles.page}>
      <header className={styles.header}><div><Link href="/admin" className={styles.back}>← 返回后台概览</Link><p className={styles.eyebrow}>权限管理</p><h1>管理员账号</h1></div><span className={styles.note}>仅 OWNER 可进入</span></header>
      <UserManager initialAdmins={admins.map((admin) => ({ ...admin, lastLoginAt: admin.lastLoginAt?.toISOString() ?? null }))} currentUserId={session.id} />
    </main>
  );
}
