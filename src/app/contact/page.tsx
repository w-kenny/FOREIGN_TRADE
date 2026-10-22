import Link from "next/link";
import ContactForm from "./contact-form";
import { getSiteContent, getSiteSetting } from "@/lib/site";
import styles from "./contact.module.css";

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const { product } = await searchParams;
  const [email, whatsapp, replyTime, title, description] = await Promise.all([
    getSiteSetting("contact.email"),
    getSiteSetting("contact.whatsapp"),
    getSiteSetting("contact.reply_time"),
    getSiteContent("contact.hero.title", "zh"),
    getSiteContent("contact.hero.description", "zh"),
  ]);
  const whatsappHref = whatsapp.startsWith("http") ? whatsapp : whatsapp ? `https://wa.me/${whatsapp.replace(/[^\d+]/g, "")}` : "https://wa.me/";

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/">
          <span className={styles.brandMark}>PE</span>
          <span><strong>PE SOHO</strong><small>EXPORT SUPPORT</small></span>
        </Link>
        <nav><Link href="/products">产品目录</Link><Link href="/services">服务流程</Link><Link href="/about">关于我</Link><Link href="/faq">常见问题</Link><Link href={`/en/contact${product ? `?product=${encodeURIComponent(product)}` : ""}`}>English</Link></nav>
        <Link className={styles.cta} href="/products">查看产品 ↗</Link>
      </header>

      <section className={styles.layout}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>提交询盘</p>
          <h1>{title}</h1>
          <p>{description}</p>
          <div className={styles.contactDetails}>
            <div><small>邮箱</small><a href={`mailto:${email}`}>{email}</a></div>
            <div><small>WHATSAPP</small><a href={whatsappHref} target="_blank" rel="noreferrer">开始沟通 ↗</a></div>
            <div><small>回复时间</small><strong>{replyTime}</strong></div>
          </div>
        </div>
        <ContactForm initialProduct={product ?? ""} />
      </section>
    </main>
  );
}
