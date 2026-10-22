import Link from "next/link";
import { getProductCategories, getPublishedProducts } from "@/lib/products";
import styles from "../../products/products.module.css";

export default async function EnglishProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const category = typeof params.category === "string" ? params.category : "";
  const [products, categories] = await Promise.all([
    getPublishedProducts("en", { query, category }),
    getProductCategories(),
  ]);
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/en"><span className={styles.brandMark}>PE</span><span><strong>PE SOHO</strong><small>EXPORT SUPPORT</small></span></Link>
        <nav><Link className={styles.active} href="/en/products">Products</Link><Link href="/en/services">Services</Link><Link href="/en/about">About</Link><Link href="/en/faq">FAQ</Link><Link href="/en/contact">Contact</Link></nav>
        <div className={styles.headerActions}><Link className={styles.language} href="/products">中文</Link><Link className={styles.cta} href="/en/contact">Send an inquiry ↗</Link></div>
      </header>
      <section className={styles.intro}><p className={styles.eyebrow}>PRODUCT CATALOG</p><h1>Products organized for real purchasing needs.</h1><p>Browse current products or send your size, material, packaging and quantity requirements.</p></section>
      <section className={styles.toolbar}>
        <form className={styles.filters} method="get">
          <input name="q" defaultValue={query} placeholder="Search products or keywords" aria-label="Search products" />
          <select name="category" defaultValue={category} aria-label="Filter by category"><option value="">All categories</option>{categories.map((item) => <option value={item.slug} key={item.slug}>{item.name}</option>)}</select>
          <button type="submit">Search</button>
        </form>
        <span>{query || category ? `${products.length} result(s)` : `${products.length} product(s)`}</span>
      </section>
      <section className={styles.grid}>
        {products.map((product) => <Link className={styles.card} href={`/en/products/${product.slug}`} key={product.id}><div className={styles.image} style={{ backgroundImage: `url("${product.imageUrl}")` }}><span>View product ↗</span></div><div className={styles.cardBody}><small>{product.category}</small><h2>{product.name}</h2><p>{product.shortDescription}</p><div className={styles.meta}><span>MOQ <b>{product.moq}</b></span><span>Lead time <b>{product.leadTime}</b></span></div></div></Link>)}
      </section>
      <section className={styles.bottomCta}><div><p className={styles.eyebrow}>DID NOT FIND THE RIGHT PRODUCT?</p><h2>Send your specifications and I will help confirm a suitable supply option.</h2></div><Link className={styles.cta} href="/en/contact">Share requirements ↗</Link></section>
    </main>
  );
}
