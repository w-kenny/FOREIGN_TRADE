import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductForm from "./product-form";
import styles from "./new.module.css";

export default async function NewProductPage() {
  const categories = await prisma.productCategory.findMany({ orderBy: { nameCn: "asc" } }).catch(() => []);
  return (
    <main className={styles.page}>
      <header className={styles.header}><div><Link href="/admin/products" className={styles.back}>← 返回产品管理</Link><p className={styles.eyebrow}>产品目录管理</p><h1>新增产品</h1></div></header>
      <ProductForm categories={categories.map((category) => ({ id: category.id, name: category.name, nameCn: category.nameCn }))} />
    </main>
  );
}
