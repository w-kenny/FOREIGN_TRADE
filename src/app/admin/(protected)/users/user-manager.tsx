"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./users.module.css";

type Admin = { id: number; email: string; name: string; role: "OWNER" | "EDITOR"; isActive: boolean; lastLoginAt: string | null };

export default function UserManager({ initialAdmins, currentUserId }: { initialAdmins: Admin[]; currentUserId: number }) {
  const router = useRouter();
  const [admins, setAdmins] = useState(initialAdmins);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ email: "", name: "", password: "", role: "EDITOR", isActive: true });
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  function edit(admin: Admin) {
    setEditingId(admin.id);
    setForm({ email: admin.email, name: admin.name, password: "", role: admin.role, isActive: admin.isActive });
  }

  function reset() {
    setEditingId(null);
    setForm({ email: "", name: "", password: "", role: "EDITOR", isActive: true });
  }

  async function save() {
    setPending(true);
    setError("");
    const response = await fetch("/api/admin/users", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, id: editingId }),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      setError(result?.error ?? "保存失败。");
    } else {
      const admin = result.admin as Admin;
      setAdmins((current) => editingId ? current.map((item) => item.id === admin.id ? { ...admin, lastLoginAt: admin.lastLoginAt ?? null } : item) : [...current, { ...admin, lastLoginAt: null }]);
      reset();
      router.refresh();
    }
    setPending(false);
  }

  async function remove(id: number) {
    if (!window.confirm("确定删除这个管理员账号吗？")) return;
    setPending(true);
    const response = await fetch("/api/admin/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (response.ok) setAdmins((current) => current.filter((admin) => admin.id !== id));
    else {
      const result = await response.json().catch(() => null);
      setError(result?.error ?? "删除失败。");
    }
    setPending(false);
  }

  return (
    <section className={styles.content}>
      <div className={styles.form}>
        <h2>{editingId ? "编辑管理员" : "新增管理员"}</h2>
        <div className={styles.formRow}><label>姓名<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="管理员姓名" /></label><label>邮箱<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="admin@example.com" /></label></div>
        <div className={styles.formRow}><label>密码{editingId && <small>留空表示不修改</small>}<input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="至少 8 位" /></label><label>角色<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}><option value="EDITOR">EDITOR / 内容编辑</option><option value="OWNER">OWNER / 全部权限</option></select></label></div>
        {editingId && <label className={styles.checkbox}><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />允许登录</label>}
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.actions}><button type="button" onClick={save} disabled={pending}>{pending ? "保存中..." : editingId ? "保存修改" : "新增账号"} ↗</button>{editingId && <button type="button" className={styles.cancel} onClick={reset}>取消</button>}</div>
      </div>
      <div className={styles.table}><div className={styles.tableHead}><span>管理员</span><span>角色</span><span>状态</span><span>最后登录</span><span>操作</span></div>{admins.map((admin) => <div className={styles.row} key={admin.id}><div><strong>{admin.name}{admin.id === currentUserId ? "（当前账号）" : ""}</strong><small>{admin.email}</small></div><span>{admin.role}</span><span className={admin.isActive ? styles.active : styles.inactive}>{admin.isActive ? "可登录" : "已停用"}</span><span>{admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString("zh-CN") : "尚未登录"}</span><div className={styles.actions}><button type="button" onClick={() => edit(admin)}>编辑</button>{admin.id !== currentUserId && <button type="button" className={styles.deleteButton} onClick={() => remove(admin.id)}>删除</button>}</div></div>)}</div>
    </section>
  );
}
