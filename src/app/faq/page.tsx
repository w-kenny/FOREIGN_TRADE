import Link from "next/link";
import { getSiteContent } from "@/lib/site";
import styles from "./faq.module.css";

const questions = [
  ["最小起订量是多少？", "不同产品的 MOQ 不同。你可以在产品详情页查看，或直接提交数量需求，我会按实际产品确认。"],
  ["可以提供样品吗？", "可以根据产品和供应商情况协助安排样品，样品费用和运输方式会提前确认。"],
  ["支持 OEM / ODM 吗？", "部分产品支持定制。请在询盘中说明材质、尺寸、包装和设计要求。"],
  ["多久可以回复？", "正常情况下会在 24 小时内回复；复杂项目会先确认关键规格，再给出报价计划。"],
  ["可以安排质量检查吗？", "可以协助跟进样品、生产状态和出货前检查，具体方式根据订单规模确认。"],
  ["支持哪些贸易条款？", "可根据产品和目的地讨论 EXW、FOB、CIF 等常见贸易条款。"],
];

export default async function FaqPage() {
  const [heroTitle, heroDescription] = await Promise.all([
    getSiteContent("faq.hero.title", "zh"),
    getSiteContent("faq.hero.description", "zh"),
  ]);
  return (
    <main className={styles.page}>
      <header className={styles.header}><Link className={styles.brand} href="/"><span className={styles.brandMark}>PE</span><span><strong>PE SOHO</strong><small>外贸采购与出口支持</small></span></Link><nav><Link href="/products">产品目录</Link><Link href="/services">服务流程</Link><Link href="/about">关于我</Link><Link className={styles.active} href="/faq">常见问题</Link><Link href="/contact">联系 / 询盘</Link><Link href="/en/faq">English</Link></nav><Link className={styles.cta} href="/contact">提交询盘 ↗</Link></header>
      <section className={styles.hero}><p className={styles.eyebrow}>常见问题</p><h1>{heroTitle}</h1><p>{heroDescription}</p></section>
      <section className={styles.list}>{questions.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</section>
      <section className={styles.ctaBand}><div><p className={styles.eyebrow}>还有其他问题？</p><h2>直接告诉我你的需求。</h2></div><Link className={styles.cta} href="/contact">联系 / 询盘 ↗</Link></section>
    </main>
  );
}
