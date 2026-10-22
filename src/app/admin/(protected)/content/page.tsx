import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { contentDefaults } from "@/lib/site";
import ContentEditor from "./content-editor";
import styles from "./content.module.css";

export default async function AdminContentPage() {
  const records = await prisma.siteContent.findMany().catch(() => []);
  const items = Object.entries(contentDefaults).flatMap(([contentKey, languages]) =>
    (["zh", "en"] as const).map((language) => ({
      contentKey,
      language,
      content: records.find((item) => item.contentKey === contentKey && item.language === language)?.content ?? languages[language],
    })),
  );
  return (
    <main className={styles.page}>
      <header className={styles.header}><div><Link href="/admin" className={styles.back}>← 返回后台概览</Link><p className={styles.eyebrow}>网站内容管理</p><h1>页面内容</h1></div><Link className={styles.siteLink} href="/">查看前台 ↗</Link></header>
      <ContentEditor initialItems={items} />
    </main>
  );
}
