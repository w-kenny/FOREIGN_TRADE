import Link from "next/link";
import { getSiteContent, getSiteSetting } from "@/lib/site";
import EnglishContactForm from "./contact-form";
import styles from "../../contact/contact.module.css";

export default async function EnglishContactPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const { product } = await searchParams;
  const [email, whatsapp, replyTime, title, description] = await Promise.all([
    getSiteSetting("contact.email"),
    getSiteSetting("contact.whatsapp"),
    getSiteSetting("contact.reply_time", "Usually within 24 hours"),
    getSiteContent("contact.hero.title", "en"),
    getSiteContent("contact.hero.description", "en"),
  ]);
  const whatsappHref = whatsapp.startsWith("http") ? whatsapp : whatsapp ? `https://wa.me/${whatsapp.replace(/[^\d+]/g, "")}` : "https://wa.me/";
  return (
    <main className={styles.page}>
      <header className={styles.header}><Link className={styles.brand} href="/en"><span className={styles.brandMark}>PE</span><span><strong>PE SOHO</strong><small>EXPORT SUPPORT</small></span></Link><nav><Link href="/en/products">Products</Link><Link href="/en/services">Services</Link><Link href="/en/about">About</Link><Link href="/en/faq">FAQ</Link><Link className={styles.active} href="/en/contact">Contact</Link></nav><div><Link className={styles.cta} href="/contact">中文</Link></div></header>
      <section className={styles.layout}><div className={styles.intro}><p className={styles.eyebrow}>SEND AN INQUIRY</p><h1>{title}</h1><p>{description}</p><div className={styles.contactDetails}><div><small>EMAIL</small><a href={`mailto:${email}`}>{email}</a></div><div><small>WHATSAPP</small><a href={whatsappHref} target="_blank" rel="noreferrer">Start a chat ↗</a></div><div><small>REPLY TIME</small><strong>{replyTime}</strong></div></div></div><EnglishContactForm initialProduct={product ?? ""} /></section>
    </main>
  );
}
