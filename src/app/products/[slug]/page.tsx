import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedProduct } from "@/lib/products";
import styles from "./detail.module.css";

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublishedProduct(slug);
  return {
    title: product?.seoTitle || product?.name || "产品详情 | PE SOHO",
    description: product?.seoDescription || product?.shortDescription || "中国采购与出口支持。",
  };
}

export default async function ProductDetailPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getPublishedProduct(slug);

  if (!product) notFound();

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/">
          <span className={styles.brandMark}>PE</span>
          <span><strong>PE SOHO</strong><small>EXPORT SUPPORT</small></span>
        </Link>
        <nav><Link href="/products">产品目录</Link><Link href="/services">服务流程</Link><Link href="/about">关于我</Link><Link href="/contact">联系 / 询盘</Link><Link href={`/en/products/${product.slug}`}>English</Link></nav>
        <Link className={styles.cta} href={`/contact?product=${product.slug}`}>提交询盘 ↗</Link>
      </header>

      <div className={styles.breadcrumb}><Link href="/products">产品目录</Link><span>/</span><span>{product.name}</span></div>
      <section className={styles.detail}>
        <div className={styles.gallery}>
          <div className={styles.image} style={{ backgroundImage: `url("${product.imageUrl}")` }} />
          {product.images.length > 1 && (
            <div className={styles.imageList} aria-label="产品图片列表">
              {product.images.map((image) => (
                <div
                  className={styles.imageThumb}
                  key={image.id}
                  role="img"
                  aria-label={image.altText}
                  style={{ backgroundImage: `url("${image.src}")` }}
                />
              ))}
            </div>
          )}
        </div>
        <div className={styles.info}>
          <p className={styles.eyebrow}>{product.category}</p>
          <h1>{product.name}</h1>
          <p className={styles.description}>{product.shortDescription}</p>
          <div className={styles.quickFacts}><div><small>最小起订量</small><strong>{product.moq}</strong></div><div><small>预计交期</small><strong>{product.leadTime}</strong></div></div>
          <div className={styles.actionRow}><Link className={styles.cta} href={`/contact?product=${product.slug}`}>提交询盘 ↗</Link><Link className={styles.pdfLink} href={`/api/products/${product.slug}/pdf?language=zh`}>下载产品 PDF ↓</Link></div>
          <p className={styles.note}>填写你的采购数量、规格和目的地，我会确认最合适的供应方案。</p>
        </div>
      </section>
      <section className={styles.specSection}>
        <div><p className={styles.eyebrow}>产品规格</p><h2>先把关键细节确认清楚。</h2></div>
        <div className={styles.specTable}>{product.specifications.map((spec) => <div className={styles.specRow} key={spec.label}><span>{spec.label}</span><strong>{spec.value}</strong></div>)}</div>
      </section>
    </main>
  );
}
