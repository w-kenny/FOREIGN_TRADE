import Link from "next/link";
import { getProductCategories, getPublishedProducts } from "@/lib/products";
import styles from "./products.module.css";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const category = typeof params.category === "string" ? params.category : "";
  const [products, categories] = await Promise.all([
    getPublishedProducts("zh", { query, category }),
    getProductCategories(),
  ]);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/">
          <span className={styles.brandMark}>PE</span>
          <span><strong>PE SOHO</strong><small>EXPORT SUPPORT</small></span>
        </Link>
        <nav>
          <Link className={styles.active} href="/products">产品目录</Link>
          <Link href="/services">服务流程</Link>
          <Link href="/about">关于我</Link>
          <Link href="/contact">联系 / 询盘</Link><Link href="/en/products">English</Link>
        </nav>
        <Link className={styles.cta} href="/contact">提交询盘 ↗</Link>
      </header>

      <section className={styles.intro}>
        <p className={styles.eyebrow}>产品目录</p>
        <h1>为实际采购需求整理的产品。</h1>
        <p>浏览当前产品，或者直接提交你的尺寸、材质、包装和数量需求。</p>
      </section>

      <section className={styles.toolbar}>
        <form className={styles.filters} method="get">
          <input name="q" defaultValue={query} placeholder="搜索产品名称或关键词" aria-label="搜索产品" />
          <select name="category" defaultValue={category} aria-label="筛选产品分类">
            <option value="">全部分类</option>
            {categories.map((item) => <option value={item.slug} key={item.slug}>{item.nameCn} / {item.name}</option>)}
          </select>
          <button type="submit">搜索</button>
        </form>
        <span>{query || category ? `筛选结果 ${products.length} 个` : `当前展示 ${products.length} 个产品`}</span>
      </section>

      <section className={styles.grid}>
        {products.map((product) => (
          <Link className={styles.card} href={`/products/${product.slug}`} key={product.id}>
            <div className={styles.image} style={{ backgroundImage: `url("${product.imageUrl}")` }}>
              <span>查看产品 ↗</span>
            </div>
            <div className={styles.cardBody}>
              <small>{product.category}</small>
              <h2>{product.name}</h2>
              <p>{product.shortDescription}</p>
              <div className={styles.meta}><span>最小起订量 <b>{product.moq}</b></span><span>交期 <b>{product.leadTime}</b></span></div>
            </div>
          </Link>
        ))}
      </section>

      <section className={styles.bottomCta}>
        <div><p className={styles.eyebrow}>没有找到合适的产品？</p><h2>把你的规格发给我，我来帮你确认合适的供应方案。</h2></div>
        <Link className={styles.cta} href="/contact">提交需求 ↗</Link>
      </section>
    </main>
  );
}
