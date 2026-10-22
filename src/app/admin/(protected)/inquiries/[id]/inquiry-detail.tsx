"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../inquiries.module.css";

type Note = {
  id: number;
  type: "NOTE" | "REPLY";
  content: string;
  createdAt: string;
  adminUser: { name: string; email: string } | null;
};

type Inquiry = {
  id: number;
  status: "NEW" | "IN_PROGRESS" | "REPLIED" | "CLOSED";
  name: string;
  company: string | null;
  email: string;
  whatsapp: string | null;
  country: string | null;
  quantity: string | null;
  specification: string | null;
  message: string;
  product: { translations: Array<{ name: string }> } | null;
  attachments: Array<{ id: number; fileName: string; fileSize: number; mimeType: string }>;
  notes: Note[];
};

const statusLabels: Record<Inquiry["status"], string> = {
  NEW: "新询盘",
  IN_PROGRESS: "处理中",
  REPLIED: "已回复",
  CLOSED: "已关闭",
};

function formatSize(size: number) {
  return size > 1024 * 1024 ? `${(size / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(size / 1024))} KB`;
}

export default function InquiryDetail({ inquiry }: { inquiry: Inquiry }) {
  const router = useRouter();
  const [status, setStatus] = useState(inquiry.status);
  const [noteType, setNoteType] = useState<"NOTE" | "REPLY">("NOTE");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function updateStatus(value: Inquiry["status"]) {
    setStatus(value);
    setPending(true);
    const response = await fetch(`/api/admin/inquiries/${inquiry.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: value }),
    });
    if (!response.ok) setError("状态更新失败，请重试。");
    router.refresh();
    setPending(false);
  }

  async function submitNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!content.trim()) return;
    setPending(true);
    setError("");
    const response = await fetch(`/api/admin/inquiries/${inquiry.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: noteType, content }),
    });
    if (!response.ok) {
      const result = await response.json().catch(() => null);
      setError(result?.error ?? "保存记录失败。");
    } else {
      setContent("");
      router.refresh();
    }
    setPending(false);
  }

  return (
    <section className={styles.detailLayout}>
      <div className={styles.detailMain}>
        <div className={styles.detailCard}>
          <div className={styles.detailHeading}>
            <div><p className={styles.eyebrow}>询盘 #{inquiry.id}</p><h2>{inquiry.name}</h2></div>
            <select value={status} disabled={pending} onChange={(event) => updateStatus(event.target.value as Inquiry["status"])} aria-label="询盘状态">
              {Object.entries(statusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
            </select>
          </div>
          <dl className={styles.contactGrid}>
            <div><dt>邮箱</dt><dd><a href={`mailto:${inquiry.email}`}>{inquiry.email}</a></dd></div>
            <div><dt>公司</dt><dd>{inquiry.company || "未填写"}</dd></div>
            <div><dt>国家 / 地区</dt><dd>{inquiry.country || "未填写"}</dd></div>
            <div><dt>WhatsApp / 电话</dt><dd>{inquiry.whatsapp || "未填写"}</dd></div>
            <div><dt>感兴趣产品</dt><dd>{inquiry.product?.translations[0]?.name || "未关联产品"}</dd></div>
            <div><dt>预计数量</dt><dd>{inquiry.quantity || "未填写"}</dd></div>
          </dl>
        </div>
        <div className={styles.detailCard}>
          <p className={styles.eyebrow}>需求内容</p>
          {inquiry.specification && <div className={styles.messageBlock}><strong>规格要求</strong><p>{inquiry.specification}</p></div>}
          <div className={styles.messageBlock}><strong>客户留言</strong><p>{inquiry.message}</p></div>
        </div>
        <div className={styles.detailCard}>
          <div className={styles.detailHeading}><div><p className={styles.eyebrow}>处理记录</p><h2>备注与回复</h2></div></div>
          <div className={styles.notes}>
            {inquiry.notes.length === 0 && <p className={styles.muted}>还没有处理记录。</p>}
            {inquiry.notes.map((note) => <article className={styles.note} key={note.id}><div><strong>{note.type === "REPLY" ? "客户回复记录" : "内部备注"}</strong><small>{note.adminUser?.name || "管理员"} · {new Date(note.createdAt).toLocaleString("zh-CN")}</small></div><p>{note.content}</p></article>)}
          </div>
          <form className={styles.noteForm} onSubmit={submitNote}>
            <div className={styles.noteFormHeader}><select value={noteType} onChange={(event) => setNoteType(event.target.value as "NOTE" | "REPLY")}><option value="NOTE">内部备注</option><option value="REPLY">客户回复记录</option></select></div>
            <textarea value={content} onChange={(event) => setContent(event.target.value)} rows={4} placeholder="记录下一步动作、报价信息或回复内容..." />
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" disabled={pending || !content.trim()}>保存记录 ↗</button>
          </form>
        </div>
      </div>
      <aside className={styles.detailAside}>
        <div className={styles.detailCard}>
          <p className={styles.eyebrow}>附件</p>
          {inquiry.attachments.length === 0 && <p className={styles.muted}>客户没有上传附件。</p>}
          <div className={styles.attachments}>{inquiry.attachments.map((attachment) => <a key={attachment.id} href={`/api/admin/inquiries/${inquiry.id}/attachments/${attachment.id}`}><span>{attachment.fileName}</span><small>{attachment.mimeType} · {formatSize(attachment.fileSize)}</small></a>)}</div>
        </div>
      </aside>
    </section>
  );
}
