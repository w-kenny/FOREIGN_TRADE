import nodemailer from "nodemailer";

type InquiryEmail = {
  id: number;
  name: string;
  email: string;
  company: string | null;
  whatsapp: string | null;
  country: string | null;
  quantity: string | null;
  specification: string | null;
  message: string;
  productName: string | null;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[character] ?? character));
}

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const from = process.env.SMTP_FROM;
  if (!host || !from) return null;
  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD ?? "" }
      : undefined,
  });
}

/**
 * 邮件是可选能力：没有 SMTP 配置时直接跳过，不阻塞客户询盘保存。
 * 配置 SMTP_HOST 和 SMTP_FROM 后，会同时发送管理员通知和客户确认邮件。
 */
export async function sendInquiryEmails(inquiry: InquiryEmail) {
  const transporter = createTransporter();
  if (!transporter) return { sent: false, skipped: true };

  const lines = [
    `客户：${inquiry.name}`,
    `邮箱：${inquiry.email}`,
    `公司：${inquiry.company ?? "未填写"}`,
    `WhatsApp / 电话：${inquiry.whatsapp ?? "未填写"}`,
    `国家：${inquiry.country ?? "未填写"}`,
    `产品：${inquiry.productName ?? "未关联产品"}`,
    `数量：${inquiry.quantity ?? "未填写"}`,
    `规格：${inquiry.specification ?? "未填写"}`,
    "",
    inquiry.message,
  ];
  const text = lines.join("\n");
  const html = lines.map((line) => `<p>${escapeHtml(line) || "&nbsp;"}</p>`).join("");
  const from = process.env.SMTP_FROM!;
  const adminEmail = process.env.ADMIN_EMAIL;

  if (adminEmail) {
    await transporter.sendMail({
      from,
      to: adminEmail,
      replyTo: inquiry.email,
      subject: `新询盘 #${inquiry.id}${inquiry.productName ? ` · ${inquiry.productName}` : ""}`,
      text,
      html,
    });
  }

  await transporter.sendMail({
    from,
    to: inquiry.email,
    subject: "已收到你的采购询盘 | PE SOHO",
    text: `感谢你的询盘。我们已经收到需求，会尽快回复。\n\n${text}`,
    html: `<p>感谢你的询盘。我们已经收到需求，会尽快回复。</p>${html}`,
  });

  return { sent: true, skipped: false };
}
