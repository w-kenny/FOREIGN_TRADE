import Link from "next/link";
import { getPublishedProducts } from "@/lib/products";
import { getSiteContent } from "@/lib/site";
import styles from "./page.module.css";

const services = [
  ["01", "产品采购", "筛选合适供应商，确认产品规格和采购要求。"],
  ["02", "质量跟进", "协调打样、生产信息和出货前检查。"],
  ["03", "出口支持", "跟进文件、包装和运输安排，让流程持续推进。"],
];

export default async function Home() {
  const [heroTitle, heroDescription] = await Promise.all([
    getSiteContent("home.hero.title", "zh"),
    getSiteContent("home.hero.description", "zh"),
  ]);
  const products = (await getPublishedProducts("zh")).slice(0, 3);
  return (
    <main>
      <header className={styles.header}>
        <Link className={styles.brand} href="/"><span className={styles.brandMark}>PE</span><span><strong>PE SOHO</strong><small>外贸采购与出口支持</small></span></Link>
        <nav className={styles.nav} aria-label="主导航"><Link href="/products">产品目录</Link><Link href="/services">服务流程</Link><Link href="/about">关于我</Link><Link href="/faq">常见问题</Link><Link href="/contact">联系 / 询盘</Link></nav>
        <div className={styles.headerActions}><Link className={styles.language} href="/en">English</Link><Link className={styles.headerCta} href="/contact">提交询盘 <span>↗</span></Link></div>
      </header>

      <section className={`${styles.hero} ${styles.shell}`}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>直接采购 · 清晰沟通 · 出口支持</p>
          <h1>{heroTitle}</h1>
          <p className={styles.heroText}>{heroDescription}</p>
          <div className={styles.heroActions}><Link className={styles.primaryButton} href="/products">浏览产品 <span>↗</span></Link><Link className={styles.textButton} href="/contact">提交采购需求 <span>→</span></Link></div>
          <div className={styles.quickProof}><span className={styles.avatar}>PE</span><span><strong>直接沟通</strong><small>从报价到出货由一个负责人跟进</small></span></div>
        </div>
        <div className={styles.heroVisual}><div className={styles.heroImage} role="img" aria-label="出口包装与产品检验" /><div className={styles.heroNote}><span className={styles.noteDot} /><span><strong>快速、务实、透明</strong><small>围绕真实采购需求推进合作</small></span></div><div className={styles.routeStamp}>CN <span>→</span> WORLD</div></div>
      </section>

      <section className={`${styles.trustStrip} ${styles.shell}`}><p>围绕买家真正关心的细节展开服务</p><div><span>01 / 快速回复</span><span>02 / 灵活起订量</span><span>03 / 供应商协调</span><span>04 / 出口支持</span></div></section>

      <section className={`${styles.section} ${styles.shell}`}>
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>精选产品</p><h2>从你的采购需求开始。</h2></div><Link className={styles.textButton} href="/products">查看全部产品 <span>↗</span></Link></div>
        <div className={styles.productGrid}>{products.map((product) => <Link className={styles.productCard} href={`/products/${product.slug}`} key={product.id}><div className={styles.productImage} style={{ backgroundImage: `url("${product.imageUrl}")` }}><span>查看详情 <b>↗</b></span></div><div className={styles.productMeta}><small>{product.category}</small><h3>{product.name}</h3><p>{product.shortDescription}</p></div></Link>)}</div>
      </section>

      <section className={`${styles.processSection} ${styles.shell}`}>
        <div className={styles.processIntro}><p className={styles.eyebrow}>合作流程</p><h2>减少反复沟通，让每一步都有效推进。</h2><p>适合重视信息准确、回复及时和持续跟进的海外买家。</p><Link className={styles.primaryButton} href="/services">查看流程 <span>↗</span></Link></div>
        <div className={styles.serviceList}>{services.map(([number, title, detail]) => <div className={styles.serviceItem} key={number}><span className={styles.serviceNumber}>{number}</span><div><h3>{title}</h3><p>{detail}</p></div><span className={styles.serviceArrow}>↗</span></div>)}</div>
      </section>

      <section className={`${styles.ctaSection} ${styles.shell}`}><div><p className={styles.eyebrow}>有采购需求？</p><h2>让下一步变得清晰。</h2></div><Link className={styles.primaryButton} href="/contact">提交询盘 <span>↗</span></Link></section>

      <footer className={`${styles.footer} ${styles.shell}`}><div><Link className={styles.brand} href="/"><span className={styles.brandMark}>PE</span><span><strong>PE SOHO</strong><small>外贸采购与出口支持</small></span></Link><p>为海外买家提供产品采购与出口支持。</p></div><div className={styles.footerLinks}><Link href="/products">产品目录</Link><Link href="/about">关于我</Link><Link href="/contact">联系我</Link><a href="https://wa.me/" target="_blank" rel="noreferrer">WhatsApp</a></div><small className={styles.copyright}>© 2026 PE SOHO。让外贸合作更清晰。</small></footer>
    </main>
  );
}
