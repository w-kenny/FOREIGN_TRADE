import LoginForm from "./login-form";
import styles from "./login.module.css";

export default function AdminLoginPage() {
  return (
    <main className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.brandMark}>PE</div>
        <p className={styles.eyebrow}>PRIVATE ADMIN AREA</p>
        <h1>Manage your trade site.</h1>
        <p className={styles.description}>Sign in to edit products, review inquiries, and publish updates.</p>
        <LoginForm />
      </div>
    </main>
  );
}
