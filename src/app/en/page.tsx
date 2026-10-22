import Link from "next/link";
import { getPublishedProducts } from "@/lib/products";
import { getSiteContent } from "@/lib/site";
import styles from "../page.module.css";

const services = [
  ["01", "Product sourcing", "Find suitable suppliers and confirm product requirements."],
  ["02", "Quality follow-up", "Coordinate samples, production updates and pre-shipment checks."],
  ["03", "Export support", "Keep documents, packaging and shipping arrangements moving."],
];

export default async function EnglishHomePage() {
  const products = (await getPublishedProducts("en")).slice(0, 3);
  const [heroTitle, heroDescription] = await Promise.all([
    getSiteContent("home.hero.title", "en"),
    getSiteContent("home.hero.description", "en"),
  ]);
  return (
    <main>
      <header className={styles.header}>
        <Link className={styles.brand} href="/en"><span className={styles.brandMark}>PE</span><span><strong>PE SOHO</strong><small>EXPORT SUPPORT</small></span></Link>
        <nav className={styles.nav} aria-label="Primary navigation"><Link href="/en/products">Products</Link><Link href="/en/services">Services</Link><Link href="/en/about">About</Link><Link href="/en/faq">FAQ</Link><Link href="/en/contact">Contact</Link></nav>
        <div className={styles.headerActions}><Link className={styles.language} href="/">中文</Link><Link className={styles.headerCta} href="/en/contact">Send an inquiry <span>↗</span></Link></div>
      </header>
      <section className={`${styles.hero} ${styles.shell}`}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>DIRECT SOURCING · CLEAR COMMUNICATION · EXPORT SUPPORT</p>
          <h1>{heroTitle}</h1>
          <p className={styles.heroText}>{heroDescription}</p>
          <div className={styles.heroActions}><Link className={styles.primaryButton} href="/en/products">Browse products <span>↗</span></Link><Link className={styles.textButton} href="/en/contact">Share your requirements <span>→</span></Link></div>
          <div className={styles.quickProof}><span className={styles.avatar}>PE</span><span><strong>Direct communication</strong><small>One person follows the project from quote to shipment</small></span></div>
        </div>
        <div className={styles.heroVisual}><div className={styles.heroImage} role="img" aria-label="Export packing and product inspection" /><div className={styles.heroNote}><span className={styles.noteDot} /><span><strong>Fast, practical, transparent</strong><small>Focused on real purchasing needs</small></span></div><div className={styles.routeStamp}>CN <span>→</span> WORLD</div></div>
      </section>
      <section className={`${styles.trustStrip} ${styles.shell}`}><p>Support built around the details buyers actually care about</p><div><span>01 / Fast replies</span><span>02 / Flexible MOQ</span><span>03 / Supplier coordination</span><span>04 / Export support</span></div></section>
      <section className={`${styles.section} ${styles.shell}`}>
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>FEATURED PRODUCTS</p><h2>Start with your purchasing need.</h2></div><Link className={styles.textButton} href="/en/products">View all products <span>↗</span></Link></div>
        <div className={styles.productGrid}>{products.map((product) => <Link className={styles.productCard} href={`/en/products/${product.slug}`} key={product.id}><div className={styles.productImage} style={{ backgroundImage: `url("${product.imageUrl}")` }}><span>View details <b>↗</b></span></div><div className={styles.productMeta}><small>{product.category}</small><h3>{product.name}</h3><p>{product.shortDescription}</p></div></Link>)}</div>
      </section>
      <section className={`${styles.processSection} ${styles.shell}`}><div className={styles.processIntro}><p className={styles.eyebrow}>HOW IT WORKS</p><h2>Less back-and-forth. More useful progress.</h2><p>For buyers who value accurate information, timely replies and consistent follow-up.</p><Link className={styles.primaryButton} href="/en/services">See the process <span>↗</span></Link></div><div className={styles.serviceList}>{services.map(([number, title, detail]) => <div className={styles.serviceItem} key={number}><span className={styles.serviceNumber}>{number}</span><div><h3>{title}</h3><p>{detail}</p></div><span className={styles.serviceArrow}>↗</span></div>)}</div></section>
      <section className={`${styles.ctaSection} ${styles.shell}`}><div><p className={styles.eyebrow}>HAVE A PURCHASING NEED?</p><h2>Make the next step clear.</h2></div><Link className={styles.primaryButton} href="/en/contact">Send an inquiry <span>↗</span></Link></section>
      <footer className={`${styles.footer} ${styles.shell}`}><div><Link className={styles.brand} href="/en"><span className={styles.brandMark}>PE</span><span><strong>PE SOHO</strong><small>EXPORT SUPPORT</small></span></Link><p>Product sourcing and export support for overseas buyers.</p></div><div className={styles.footerLinks}><Link href="/en/products">Products</Link><Link href="/en/about">About</Link><Link href="/en/contact">Contact</Link><Link href="/en/privacy">Privacy</Link></div><small className={styles.copyright}>© 2026 PE SOHO. Clearer foreign trade cooperation.</small></footer>
    </main>
  );
}
