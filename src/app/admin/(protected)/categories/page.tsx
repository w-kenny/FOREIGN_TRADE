import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CategoryManager from "./category-manager";
import styles from "./categories.module.css";

export default async function AdminCategoriesPage() {
  const categories = await prisma.productCategory.findMany({
    orderBy: { nameCn: "asc" },
    include: { _count: { select: { products: true } } },
  }).catch(() => []);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <Link href="/admin" className={styles.back}>← 返回后台概览</Link>
          <p className={styles.eyebrow}>产品目录管理</p>
          <h1>产品分类</h1>
        </div>
        <Link className={styles.siteLink} href="/admin/products">返回产品管理</Link>
      </header>
      <CategoryManager initialCategories={categories.map((category) => ({
        id: category.id,
        slug: category.slug,
        name: category.name,
        nameCn: category.nameCn,
        productCount: category._count.products,
      }))} />
    </main>
  );
}
