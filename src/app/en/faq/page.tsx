import Link from "next/link";
import { getSiteContent } from "@/lib/site";
import styles from "../../faq/faq.module.css";

const questions = [
  ["What is the minimum order quantity?", "MOQ varies by product. Check the product detail page or send your quantity and I will confirm it against the actual supplier."],
  ["Can you arrange samples?", "Sample arrangements are possible depending on the product and supplier. Sample and shipping costs are confirmed in advance."],
  ["Do you support OEM / ODM?", "Some products support customization. Include material, size, packaging and design requirements in your inquiry."],
  ["How quickly will you reply?", "Most inquiries receive a reply within 24 hours. For complex projects, I first confirm the key specifications and then share a quotation plan."],
  ["Can you arrange quality checks?", "I can help follow up samples, production status and pre-shipment inspections. The exact approach depends on the order."],
  ["Which trade terms are available?", "EXW, FOB and CIF are common options. The practical term depends on the product and destination."],
];

export default async function EnglishFaqPage() {
  const [heroTitle, heroDescription] = await Promise.all([
    getSiteContent("faq.hero.title", "en"),
    getSiteContent("faq.hero.description", "en"),
  ]);
  return (
    <main className={styles.page}>
      <header className={styles.header}><Link className={styles.brand} href="/en"><span className={styles.brandMark}>PE</span><span><strong>PE SOHO</strong><small>EXPORT SUPPORT</small></span></Link><nav><Link href="/en/products">Products</Link><Link href="/en/services">Services</Link><Link href="/en/about">About</Link><Link className={styles.active} href="/en/faq">FAQ</Link><Link href="/en/contact">Contact</Link></nav><div><Link className={styles.cta} href="/faq">中文</Link></div></header>
      <section className={styles.hero}><p className={styles.eyebrow}>FAQ</p><h1>{heroTitle}</h1><p>{heroDescription}</p></section>
      <section className={styles.list}>{questions.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</section>
      <section className={styles.ctaBand}><div><p className={styles.eyebrow}>HAVE ANOTHER QUESTION?</p><h2>Tell me what you need.</h2></div><Link className={styles.cta} href="/en/contact">Contact me ↗</Link></section>
    </main>
  );
}
