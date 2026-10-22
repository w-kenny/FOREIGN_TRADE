import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { settingDefaults } from "@/lib/site";
import SettingsEditor from "./settings-editor";
import styles from "../content/content.module.css";

export default async function AdminSettingsPage() {
  const records = await prisma.siteSetting.findMany().catch(() => []);
  const items = Object.entries(settingDefaults).map(([settingKey, fallback]) => ({
    settingKey,
    settingValue: records.find((item) => item.settingKey === settingKey)?.settingValue ?? fallback,
  }));
  return (
    <main className={styles.page}>
      <header className={styles.header}><div><Link href="/admin" className={styles.back}>← 返回后台概览</Link><p className={styles.eyebrow}>网站设置</p><h1>联系方式与站点配置</h1></div><Link className={styles.siteLink} href="/contact">查看联系页 ↗</Link></header>
      <SettingsEditor initialItems={items} />
    </main>
  );
}
