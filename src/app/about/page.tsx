import Link from "next/link";
import { getSiteContent } from "@/lib/site";
import styles from "./info.module.css";

export default async function AboutPage() {
  const [heroTitle, heroDescription] = await Promise.all([
    getSiteContent("about.hero.title", "zh"),
    getSiteContent("about.hero.description", "zh"),
  ]);
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/"><span className={styles.brandMark}>PE</span><span><strong>PE SOHO</strong><small>外贸采购与出口支持</small></span></Link>
        <nav><Link href="/products">产品目录</Link><Link href="/services">服务流程</Link><Link className={styles.active} href="/about">关于我</Link><Link href="/faq">常见问题</Link><Link href="/contact">联系 / 询盘</Link><Link href="/en/about">English</Link></nav>
        <Link className={styles.cta} href="/contact">联系我 ↗</Link>
      </header>
      <section className={styles.hero}><p className={styles.eyebrow}>关于我</p><h1>{heroTitle}</h1><p>{heroDescription}</p></section>
      <section className={styles.content}><div className={styles.contentIntro}><p className={styles.eyebrow}>合作方式</p><h2>保持沟通直接，让信息清楚可追踪。</h2></div><div className={styles.steps}><div className={styles.step}><span>01</span><div><h3>直接沟通</h3><p>你可以直接和负责项目的人沟通，不需要在多个销售和客服之间反复转述。</p></div></div><div className={styles.step}><span>02</span><div><h3>重视细节</h3><p>从材质、尺寸、包装到交期，先把规格确认清楚，再推进报价和生产。</p></div></div><div className={styles.step}><span>03</span><div><h3>持续跟进</h3><p>从供应商确认到出货安排，提供清晰的进度反馈和问题同步。</p></div></div></div></section>
      <section className={styles.ctaBand}><div><p className={styles.eyebrow}>开始沟通</p><h2>把你的产品需求发给我。</h2></div><Link className={styles.cta} href="/contact">提交询盘 ↗</Link></section>
    </main>
  );

  // 这是一个笔记
}
