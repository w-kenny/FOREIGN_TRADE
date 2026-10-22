"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./categories.module.css";

type Category = { id: number; slug: string; name: string; nameCn: string; productCount: number };

export default function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const id = Number(data.id);
    const response = await fetch("/api/admin/categories", {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, id: id || undefined }),
    });
    if (!response.ok) {
      const result = await response.json().catch(() => null);
      setError(result?.error ?? "保存失败。");
    } else {
      event.currentTarget.reset();
      setEditingId(null);
      const result = await response.json().catch(() => null);
      if (id) {
        setCategories((current) => current.map((category) => category.id === id ? { ...category, ...data, id, productCount: category.productCount } : category));
      } else if (result?.id) {
        setCategories((current) => [...current, { id: result.id, slug: String(data.slug), name: String(data.name), nameCn: String(data.nameCn), productCount: 0 }]);
      }
      router.refresh();
    }
    setPending(false);
  }

  async function remove(id: number) {
    if (!window.confirm("确定删除这个分类吗？")) return;
    setPending(true);
    setError("");
    const response = await fetch("/api/admin/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!response.ok) {
      const result = await response.json().catch(() => null);
      setError(result?.error ?? "删除失败。");
    } else {
      setCategories((current) => current.filter((category) => category.id !== id));
      router.refresh();
    }
    setPending(false);
  }

  const editing = categories.find((category) => category.id === editingId);

  return (
    <section className={styles.content}>
      <form className={styles.form} onSubmit={submit}>
        <input type="hidden" name="id" value={editing?.id ?? ""} />
        <label>英文名称<input name="name" required defaultValue={editing?.name ?? ""} key={`name-${editingId}`} placeholder="Cable Accessories" /></label>
        <label>中文名称<input name="nameCn" required defaultValue={editing?.nameCn ?? ""} key={`nameCn-${editingId}`} placeholder="电缆配件" /></label>
        <label>URL 标识<input name="slug" required defaultValue={editing?.slug ?? ""} key={`slug-${editingId}`} placeholder="cable-accessories" /></label>
        <button type="submit" disabled={pending}>{editing ? "保存分类" : "新增分类"} ↗</button>
        {editing && <button type="button" className={styles.cancel} onClick={() => setEditingId(null)}>取消编辑</button>}
      </form>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.table}>
        <div className={styles.tableHead}><span>中文名称</span><span>英文名称</span><span>URL</span><span>产品数</span><span>操作</span></div>
        {categories.map((category) => (
          <div className={styles.row} key={category.id}>
            <strong>{category.nameCn}</strong>
            <span>{category.name}</span>
            <span>{category.slug}</span>
            <span>{category.productCount}</span>
            <div className={styles.actions}><button type="button" onClick={() => setEditingId(category.id)}>编辑</button><button type="button" className={styles.deleteButton} onClick={() => remove(category.id)}>删除</button></div>
          </div>
        ))}
      </div>
    </section>
  );
}
