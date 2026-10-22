import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, color: "#17324d", background: "#fbfcfa" }}>
      <div style={{ maxWidth: 520, textAlign: "center" }}>
        <p style={{ color: "#0f8b8d", fontSize: 11, fontWeight: 700, letterSpacing: ".14em" }}>404 / NOT FOUND</p>
        <h1 style={{ marginTop: 15, fontSize: 48, letterSpacing: "-.04em" }}>这个页面暂时不存在。</h1>
        <p style={{ marginTop: 16, color: "#425466", lineHeight: 1.7 }}>链接可能已经更新，或者这个产品还没有发布。</p>
        <Link href="/" style={{ display: "inline-flex", marginTop: 28, padding: "13px 17px", color: "#fff", background: "#0f8b8d", borderRadius: 4, fontWeight: 700 }}>返回首页 ↗</Link>
      </div>
    </main>
  );
}
