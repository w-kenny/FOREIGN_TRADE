import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductActions from "./product-actions";
import styles from "./products.module.css";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
    include: { category: true, translations: { where: { language: "en" } } },
  }).catch(() => []);

  return (
    <main className={styles.page}>
      <header className={styles.header}><div><Link href="/admin" className={styles.back}>← 返回后台概览</Link><p className={styles.eyebrow}>产品目录管理</p><h1>产品管理</h1></div><Link className={styles.button} href="/admin/products/new">新增产品 ↗</Link></header>
      <div className={styles.table}>
        <div className={styles.tableHead}><span>产品</span><span>分类</span><span>状态</span><span>更新时间</span><span>操作</span><span /></div>
        {products.length === 0 && <div className={styles.empty}>暂时没有产品，请先新增产品。</div>}
        {products.map((product) => (
          <div className={styles.row} key={product.id}>
            <div><strong>{product.translations[0]?.name ?? product.slug}</strong><small>{product.slug}{product.sku ? ` · ${product.sku}` : ""}</small></div>
            <span>{product.category.nameCn}</span>
            <span className={`${styles.status} ${styles[product.status.toLowerCase()]}`}>{product.status === "PUBLISHED" ? "已发布" : product.status === "DRAFT" ? "草稿" : "已归档"}</span>
            <span>{product.updatedAt.toLocaleDateString("zh-CN")}</span>
            <ProductActions id={product.id} status={product.status} />
            <span className={styles.links}><Link href={`/admin/products/${product.id}`}>编辑</Link>{product.status === "PUBLISHED" && <Link href={`/products/${product.slug}`}>预览 ↗</Link>}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
