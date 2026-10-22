"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import styles from "../../contact/contact.module.css";

export default function EnglishContactForm({ initialProduct }: { initialProduct: string }) {
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
      setError("Each attachment must be 5 MB or smaller.");
      setPending(false);
      return;
    }
    const attachments = await Promise.all(files.slice(0, 3).map(async (file) => {
      const buffer = await file.arrayBuffer();
      let binary = "";
      for (const byte of new Uint8Array(buffer)) binary += String.fromCharCode(byte);
      return { fileName: file.name, mimeType: file.type || "application/octet-stream", fileSize: file.size, fileBase64: btoa(binary) };
    }));
    const payload = Object.fromEntries(form.entries());
    delete payload.attachments;
    const response = await fetch("/api/inquiries", {
      method: "POST",
      body: JSON.stringify({ ...payload, attachments }),
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      const result = await response.json().catch(() => null);
      setError(result?.error ?? "Something went wrong. Please try again.");
    } else {
      setSubmitted(true);
      event.currentTarget.reset();
    }
    setPending(false);
  }

  if (submitted) {
    return <div className={styles.success}><span className={styles.successMark}>✓</span><p className={styles.eyebrow}>INQUIRY SENT</p><h2>Thank you. I will review your requirements shortly.</h2><p>Your inquiry has been saved. I usually reply within 24 hours.</p><Link className={styles.cta} href="/en/products">Back to products ↗</Link></div>;
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formRow}><label>Name *<input name="name" required placeholder="Your name" /></label><label>Business email *<input name="email" type="email" required placeholder="you@company.com" /></label></div>
      <div className={styles.formRow}><label>Company<input name="company" placeholder="Company name" /></label><label>WhatsApp / phone<input name="whatsapp" placeholder="WhatsApp or phone number" /></label></div>
      <div className={styles.formRow}><label>Country<input name="country" placeholder="Country or region" /></label></div>
      <label>Product of interest *<input name="product" required defaultValue={initialProduct} placeholder="Product name or category" /></label>
      <label>Estimated quantity<input name="quantity" placeholder="For example: 500 pcs" /></label>
      <label>Specifications<textarea name="specification" rows={3} placeholder="Material, size, packaging, destination or target timing..." /></label>
      <label>Message *<textarea name="message" required rows={5} placeholder="Tell me what you need confirmed." /></label>
      <label>Attachments (optional)<input name="attachments" type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx" /><small>Up to 3 files, 5 MB each.</small></label>
      {error && <p className={styles.error}>{error}</p>}
      <button className={styles.cta} disabled={pending}>{pending ? "Sending..." : "Send inquiry ↗"}</button>
      <small className={styles.formNote}>Your information is only used to respond to this inquiry.</small>
    </form>
  );
}
