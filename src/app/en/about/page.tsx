import Link from "next/link";
import { getSiteContent } from "@/lib/site";
import styles from "../../about/info.module.css";

export default async function EnglishAboutPage() {
  const [heroTitle, heroDescription] = await Promise.all([
    getSiteContent("about.hero.title", "en"),
    getSiteContent("about.hero.description", "en"),
  ]);
  return (
    <main className={styles.page}>
      <header className={styles.header}><Link className={styles.brand} href="/en"><span className={styles.brandMark}>PE</span><span><strong>PE SOHO</strong><small>EXPORT SUPPORT</small></span></Link><nav><Link href="/en/products">Products</Link><Link href="/en/services">Services</Link><Link className={styles.active} href="/en/about">About</Link><Link href="/en/faq">FAQ</Link><Link href="/en/contact">Contact</Link></nav><div><Link className={styles.cta} href="/about">中文</Link></div></header>
      <section className={styles.hero}><p className={styles.eyebrow}>ABOUT</p><h1>{heroTitle}</h1><p>{heroDescription}</p></section>
      <section className={styles.content}><div className={styles.contentIntro}><p className={styles.eyebrow}>HOW I WORK</p><h2>Keep communication direct and information easy to track.</h2></div><div className={styles.steps}><div className={styles.step}><span>01</span><div><h3>Direct communication</h3><p>Speak directly with the person responsible for the project, without repeating the same details across multiple teams.</p></div></div><div className={styles.step}><span>02</span><div><h3>Attention to detail</h3><p>Confirm material, size, packaging and timing before moving into quotation and production.</p></div></div><div className={styles.step}><span>03</span><div><h3>Consistent follow-up</h3><p>Keep supplier confirmation, production status and shipping arrangements visible and moving.</p></div></div></div></section>
      <section className={styles.ctaBand}><div><p className={styles.eyebrow}>START A CONVERSATION</p><h2>Send over your product requirements.</h2></div><Link className={styles.cta} href="/en/contact">Send an inquiry ↗</Link></section>
    </main>
  );
}
