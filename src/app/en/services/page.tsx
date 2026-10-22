import Link from "next/link";
import { getSiteContent } from "@/lib/site";
import styles from "../../services/info.module.css";

const steps = [
  ["01", "Share your requirements", "Tell me the product, quantity, specifications, destination and target timing."],
  ["02", "Confirm products and pricing", "Shortlist suppliers and check specifications, packaging and trade terms."],
  ["03", "Samples and quality follow-up", "Coordinate samples, production updates and pre-shipment checks."],
  ["04", "Export and shipping support", "Confirm documents, packaging, shipping method and delivery milestones."],
];

export default async function EnglishServicesPage() {
  const [heroTitle, heroDescription] = await Promise.all([
    getSiteContent("services.hero.title", "en"),
    getSiteContent("services.hero.description", "en"),
  ]);
  return (
    <main className={styles.page}>
      <header className={styles.header}><Link className={styles.brand} href="/en"><span className={styles.brandMark}>PE</span><span><strong>PE SOHO</strong><small>EXPORT SUPPORT</small></span></Link><nav><Link href="/en/products">Products</Link><Link className={styles.active} href="/en/services">Services</Link><Link href="/en/about">About</Link><Link href="/en/faq">FAQ</Link><Link href="/en/contact">Contact</Link></nav><div><Link className={styles.cta} href="/services">中文</Link></div></header>
      <section className={styles.hero}><p className={styles.eyebrow}>SERVICES</p><h1>{heroTitle}</h1><p>{heroDescription}</p></section>
      <section className={styles.content}><div className={styles.contentIntro}><p className={styles.eyebrow}>WHAT I CAN HELP WITH</p><h2>Break complex supplier communication into clear steps.</h2></div><div className={styles.steps}>{steps.map(([number, title, detail]) => <div className={styles.step} key={number}><span>{number}</span><div><h3>{title}</h3><p>{detail}</p></div></div>)}</div></section>
      <section className={styles.ctaBand}><div><p className={styles.eyebrow}>HAVE A SPECIFIC NEED?</p><h2>Start with one clear message.</h2></div><Link className={styles.cta} href="/en/contact">Share requirements ↗</Link></section>
    </main>
  );
}
