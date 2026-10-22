import Link from "next/link";
import styles from "./privacy.module.css";

export const metadata = {
  title: "隐私政策 | PE SOHO",
  description: "PE SOHO 询盘信息使用说明。",
};

export default function PrivacyPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}><Link className={styles.brand} href="/"><span className={styles.brandMark}>PE</span><span><strong>PE SOHO</strong><small>外贸采购与出口支持</small></span></Link><nav><Link href="/products">产品目录</Link><Link href="/services">服务流程</Link><Link href="/about">关于我</Link><Link href="/contact">联系 / 询盘</Link></nav><Link className={styles.cta} href="/en">English</Link></header>
      <article className={styles.article}><p className={styles.eyebrow}>隐私政策</p><h1>你的询盘信息只用于推进本次沟通。</h1><p>当你通过本站提交询盘时，我们会收集你主动填写的姓名、邮箱、公司、国家、采购数量、规格、留言和附件信息。</p><h2>信息如何使用</h2><p>这些信息只用于确认产品需求、联系你、安排报价或跟进供应与出口事项。除非法律要求或为完成你明确提出的服务，否则不会出售或公开你的信息。</p><h2>信息保存</h2><p>询盘记录保存在项目使用的 MySQL 数据库中。附件可能以数据库二进制内容保存，并仅对后台管理员开放。</p><h2>联系我</h2><p>如果你希望修改或删除询盘信息，请通过 <a href="mailto:hello@example.com">hello@example.com</a> 联系。</p><Link className={styles.textLink} href="/">← 返回首页</Link></article>
    </main>
  );
}
