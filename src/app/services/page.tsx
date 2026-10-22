import Link from "next/link";
import { getSiteContent } from "@/lib/site";
import styles from "./info.module.css";

const steps = [
  ["01", "提交采购需求", "告诉我产品、数量、规格、目的地和预计交期。"],
  ["02", "确认产品与报价", "根据需求筛选供应商，核对规格、包装和贸易条款。"],
  ["03", "样品与质量跟进", "协助安排打样，跟进生产信息和出货前检查。"],
  ["04", "出口与运输安排", "确认文件、包装、装运方式和后续交付节点。"],
];

export default async function ServicesPage() {
  const [heroTitle, heroDescription] = await Promise.all([
    getSiteContent("services.hero.title", "zh"),
    getSiteContent("services.hero.description", "zh"),
  ]);
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/"><span className={styles.brandMark}>PE</span><span><strong>PE SOHO</strong><small>外贸采购与出口支持</small></span></Link>
        <nav><Link href="/products">产品目录</Link><Link className={styles.active} href="/services">服务流程</Link><Link href="/about">关于我</Link><Link href="/faq">常见问题</Link><Link href="/contact">联系 / 询盘</Link><Link href="/en/services">English</Link></nav>
        <Link className={styles.cta} href="/contact">提交询盘 ↗</Link>
      </header>
      <section className={styles.hero}><p className={styles.eyebrow}>服务流程</p><h1>{heroTitle}</h1><p>{heroDescription}</p></section>
      <section className={styles.content}><div className={styles.contentIntro}><p className={styles.eyebrow}>我可以协助的事项</p><h2>把复杂的供应链沟通，拆成清晰的步骤。</h2></div><div className={styles.steps}>{steps.map(([number, title, detail]) => <div className={styles.step} key={number}><span>{number}</span><div><h3>{title}</h3><p>{detail}</p></div></div>)}</div></section>
      <section className={styles.ctaBand}><div><p className={styles.eyebrow}>有具体产品需求？</p><h2>从一条需求消息开始。</h2></div><Link className={styles.cta} href="/contact">提交采购需求 ↗</Link></section>
    </main>
  );
}
