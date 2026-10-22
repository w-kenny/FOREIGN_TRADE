import type { MetadataRoute } from "next";
import { getPublishedProducts } from "@/lib/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const products = await getPublishedProducts("zh");
  const staticRoutes = ["", "/products", "/services", "/about", "/faq", "/contact", "/privacy", "/en", "/en/products", "/en/services", "/en/about", "/en/faq", "/en/contact", "/en/privacy"];
  return [
    ...staticRoutes.map((path) => ({ url: `${baseUrl}${path}`, lastModified: new Date() })),
    ...products.flatMap((product) => [
      { url: `${baseUrl}/products/${product.slug}`, lastModified: new Date() },
      { url: `${baseUrl}/en/products/${product.slug}`, lastModified: new Date() },
    ]),
  ];
}
