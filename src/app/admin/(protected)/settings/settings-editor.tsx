"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../content/content.module.css";

type Item = { settingKey: string; settingValue: string };
const labels: Record<string, string> = {
  "site.name": "站点名称",
  "site.url": "站点 URL",
  "contact.email": "联系邮箱",
  "contact.whatsapp": "WhatsApp 链接或号码",
  "contact.reply_time": "预计回复时间",
};

export default function SettingsEditor({ initialItems }: { initialItems: Item[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  async function save() {
    setPending(true);
    setMessage("");
    const response = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items }) });
    setMessage(response.ok ? "设置已保存。" : "保存失败，请重试。");
    if (response.ok) router.refresh();
    setPending(false);
  }
  return <section className={styles.content}><p className={styles.help}>联系页会优先使用这里的邮箱、WhatsApp 和回复时间。生产环境请把站点 URL 修改为实际域名。</p><div className={styles.cards}>{items.map((item) => <label className={styles.card} key={item.settingKey}><code>{labels[item.settingKey] ?? item.settingKey}</code><input className={styles.settingInput} value={item.settingValue} onChange={(event) => setItems((current) => current.map((value) => value.settingKey === item.settingKey ? { ...value, settingValue: event.target.value } : value))} /></label>)}</div>{message && <p className={styles.message}>{message}</p>}<button className={styles.save} type="button" onClick={save} disabled={pending}>{pending ? "保存中..." : "保存设置 ↗"}</button></section>;
}
