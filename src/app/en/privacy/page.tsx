import Link from "next/link";
import styles from "../../privacy/privacy.module.css";

export const metadata = {
  title: "Privacy Policy | PE SOHO",
  description: "How PE SOHO uses inquiry information.",
};

export default function EnglishPrivacyPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/en">
          <span className={styles.brandMark}>PE</span>
          <span>
            <strong>PE SOHO</strong>
            <small>EXPORT SUPPORT</small>
          </span>
        </Link>
        <nav>
          <Link href="/en/products">Products</Link>
          <Link href="/en/services">Services</Link>
          <Link href="/en/about">About</Link>
          <Link href="/en/contact">Contact</Link>
        </nav>
        <Link className={styles.cta} href="/privacy">中文</Link>
      </header>

      <article className={styles.article}>
        <p className={styles.eyebrow}>PRIVACY POLICY</p>
        <h1>Your inquiry information is used only to move this conversation forward.</h1>
        <p>
          When you submit an inquiry through this site, we collect the name,
          email, company, country, purchasing quantity, specifications, message
          and attachments that you choose to provide.
        </p>
        <h2>How the information is used</h2>
        <p>
          The information is used to confirm product requirements, contact you,
          prepare a quotation, and follow up on supply or export arrangements.
          It is not sold or made public unless required by law or necessary to
          provide a service that you explicitly requested.
        </p>
        <h2>How the information is stored</h2>
        <p>
          Inquiry records are stored in the MySQL database used by this project.
          Attachments may be stored as database binary content and are available
          only to authorized administrators.
        </p>
        <h2>Contact</h2>
        <p>
          To request a correction or deletion of your inquiry information,
          email <a href="mailto:hello@example.com">hello@example.com</a>.
        </p>
        <Link className={styles.textLink} href="/en">← Back to home</Link>
      </article>
    </main>
  );
}
