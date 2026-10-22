import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PE SOHO | 中国外贸采购与出口服务",
  description: "为海外买家提供中国采购、质量跟进和出口支持。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
