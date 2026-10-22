"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget).entries())),
    });
    if (response.ok) router.push("/admin");
    else setError("Invalid email or password.");
    setPending(false);
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <label>Email<input name="email" type="email" required placeholder="admin@example.com" /></label>
      <label>Password<input name="password" type="password" required placeholder="••••••••" /></label>
      {error && <p className={styles.error}>{error}</p>}
      <button disabled={pending}>{pending ? "Signing in..." : "Sign in ↗"}</button>
    </form>
  );
}
