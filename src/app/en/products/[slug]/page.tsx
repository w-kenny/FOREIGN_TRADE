import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedProduct } from "@/lib/products";
import styles from "../../../products/[slug]/detail.module.css";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublishedProduct(slug, "en");
  return {
    title: product?.seoTitle || product?.name || "Product | PE SOHO",
    description: product?.seoDescription || product?.shortDescription || "Product sourcing and export support from China.",
  };
}

export default async function EnglishProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getPublishedProduct(slug, "en");
  if (!product) notFound();
  return (
    <main className={styles.page}>
      <header className={styles.header}><Link className={styles.brand} href="/en"><span className={styles.brandMark}>PE</span><span><strong>PE SOHO</strong><small>EXPORT SUPPORT</small></span></Link><nav><Link href="/en/products">Products</Link><Link href="/en/services">Services</Link><Link href="/en/about">About</Link><Link href="/en/contact">Contact</Link></nav><div><Link className={styles.cta} href={`/en/contact?product=${product.slug}`}>Send an inquiry ↗</Link></div></header>
      <div className={styles.breadcrumb}><Link href="/en/products">Products</Link><span>/</span><span>{product.name}</span></div>
      <section className={styles.detail}><div className={styles.gallery}><div className={styles.image} style={{ backgroundImage: `url("${product.imageUrl}")` }} />{product.images.length > 1 && <div className={styles.imageList} aria-label="Product images">{product.images.map((image) => <div className={styles.imageThumb} key={image.id} role="img" aria-label={image.altText} style={{ backgroundImage: `url("${image.src}")` }} />)}</div>}</div><div className={styles.info}><p className={styles.eyebrow}>{product.category}</p><h1>{product.name}</h1><p className={styles.description}>{product.description}</p><div className={styles.quickFacts}><div><small>Minimum order</small><strong>{product.moq}</strong></div><div><small>Lead time</small><strong>{product.leadTime}</strong></div></div><div className={styles.actionRow}><Link className={styles.cta} href={`/en/contact?product=${product.slug}`}>Send an inquiry ↗</Link><Link className={styles.pdfLink} href={`/api/products/${product.slug}/pdf?language=en`}>Download product PDF ↓</Link></div><p className={styles.note}>Share your quantity, specifications and destination so I can confirm the right supply option.</p></div></section>
      <section className={styles.specSection}><div><p className={styles.eyebrow}>SPECIFICATIONS</p><h2>Confirm the key details first.</h2></div><div className={styles.specTable}>{product.specifications.map((spec) => <div className={styles.specRow} key={spec.label}><span>{spec.label}</span><strong>{spec.value}</strong></div>)}</div></section>
    </main>
  );
}
