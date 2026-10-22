"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./content.module.css";

type Item = { contentKey: string; language: "zh" | "en"; content: string };

export default function ContentEditor({ initialItems }: { initialItems: Item[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  function update(contentKey: string, language: "zh" | "en", content: string) {
    setItems((current) => current.map((item) => item.contentKey === contentKey && item.language === language ? { ...item, content } : item));
  }

  async function save() {
    setPending(true);
    setMessage("");
    const response = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items }) });
    setMessage(response.ok ? "内容已保存。" : "保存失败，请重试。");
    if (response.ok) router.refresh();
    setPending(false);
  }

  const grouped = items.reduce<Record<string, Item[]>>((result, item) => {
    (result[item.contentKey] ??= []).push(item);
    return result;
  }, {});

  return (
    <section className={styles.content}>
      <p className={styles.help}>这里维护首页、关于、服务、FAQ 和联系页的核心中英文文案。产品名称和规格请在产品管理中编辑。</p>
      <div className={styles.cards}>{Object.entries(grouped).map(([key, values]) => <article className={styles.card} key={key}><code>{key}</code>{values.map((item) => <label key={item.language}>{item.language === "zh" ? "中文" : "English"}<textarea value={item.content} onChange={(event) => update(item.contentKey, item.language, event.target.value)} rows={3} /></label>)}</article>)}</div>
      {message && <p className={styles.message}>{message}</p>}
      <button className={styles.save} type="button" onClick={save} disabled={pending}>{pending ? "保存中..." : "保存所有内容 ↗"}</button>
    </section>
  );
}
