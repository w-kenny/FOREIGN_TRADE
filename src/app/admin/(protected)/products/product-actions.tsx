"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./products.module.css";

export default function ProductActions({
  id,
  status,
}: {
  id: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function update(action: "duplicate" | "status", nextStatus?: string) {
    setPending(true);
    const response = await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(action === "duplicate" ? { action } : { status: nextStatus }),
    });
    if (response.ok) router.refresh();
    setPending(false);
  }

  async function remove() {
    if (!window.confirm("确定删除这个产品吗？删除后无法恢复。")) return;
    setPending(true);
    const response = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (response.ok) router.refresh();
    setPending(false);
  }

  return (
    <div className={styles.actions}>
      <select
        aria-label="修改产品状态"
        value={status}
        disabled={pending}
        onChange={(event) => update("status", event.target.value)}
      >
        <option value="DRAFT">草稿</option>
        <option value="PUBLISHED">已发布</option>
        <option value="ARCHIVED">已归档</option>
      </select>
      <button type="button" onClick={() => update("duplicate")} disabled={pending}>复制</button>
      <button type="button" className={styles.deleteButton} onClick={remove} disabled={pending}>删除</button>
    </div>
  );
}
