"use client";

import { FormEvent, useState } from "react";
import styles from "./contact.module.css";
import Link from "next/link";

export default function ContactForm({ initialProduct }: { initialProduct: string }) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const files = form.getAll("attachments").filter(
      (value): value is File => value instanceof File && value.size > 0,
    );
    if (files.some((file) => file.size > 5 * 1024 * 1024)) {
      setError("单个附件不能超过 5 MB。");
      setPending(false);
      return;
    }
    const attachments = await Promise.all(files.slice(0, 3).map(async (file) => {
      const buffer = await file.arrayBuffer();
      let binary = "";
      for (const byte of new Uint8Array(buffer)) binary += String.fromCharCode(byte);
      return {
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        fileSize: file.size,
        fileBase64: btoa(binary),
      };
    }));
    const payload = Object.fromEntries(form.entries());
    delete payload.attachments;
    const response = await fetch("/api/inquiries", {
      method: "POST",
      body: JSON.stringify({ ...payload, attachments }),
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      setError("Something went wrong. Please try again or email me directly.");
    } else {
      setSubmitted(true);
      event.currentTarget.reset();
    }
    setPending(false);
  }

  if (submitted) {
    return (
      <div className={styles.success}>
        <span className={styles.successMark}>✓</span>
        <p className={styles.eyebrow}>提交成功</p>
        <h2>感谢你的需求，我会尽快确认。</h2>
        <p>你的询盘已经保存，我通常会在 24 小时内回复。</p>
        <Link className={styles.cta} href="/products">返回产品目录 ↗</Link>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formRow}>
        <label>姓名 *<input name="name" required placeholder="请输入姓名" /></label>
        <label>商务邮箱 *<input name="email" type="email" required placeholder="you@company.com" /></label>
      </div>
      <div className={styles.formRow}>
        <label>公司名称<input name="company" placeholder="请输入公司名称" /></label>
        <label>WhatsApp / 电话<input name="whatsapp" placeholder="方便联系的 WhatsApp 或电话" /></label>
      </div>
      <div className={styles.formRow}>
        <label>所在国家<input name="country" placeholder="请输入国家或地区" /></label>
      </div>
      <label>感兴趣的产品 *<input name="product" required defaultValue={initialProduct} placeholder="产品名称或产品类别" /></label>
      <label>预计采购数量<input name="quantity" placeholder="例如：500 件" /></label>
      <label>规格要求<textarea name="specification" rows={3} placeholder="材质、尺寸、包装、目的地、预计交期等..." /></label>
      <label>留言 *<textarea name="message" required rows={5} placeholder="请告诉我你希望确认的内容。" /></label>
      <label>附件（可选）<input name="attachments" type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx" /><small>最多 3 个文件，单个不超过 5 MB。</small></label>
      {error && <p className={styles.error}>{error}</p>}
      <button className={styles.cta} disabled={pending}>{pending ? "提交中..." : "提交询盘 ↗"}</button>
      <small className={styles.formNote}>你的信息仅用于回复本次询盘。</small>
    </form>
  );
}
