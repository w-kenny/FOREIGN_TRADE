import { prisma } from "@/lib/prisma";

export const contentDefaults: Record<string, Record<string, string>> = {
  "home.hero.title": {
    zh: "让来自中国的采购更简单、更可靠。",
    en: "Make sourcing from China simpler and more reliable.",
  },
  "home.hero.description": {
    zh: "我帮助海外买家寻找合适产品、确认规格，并通过一个明确的联系人推进报价、生产与出货。",
    en: "I help overseas buyers find suitable products, confirm specifications and move quotation, production and shipping forward with one clear contact.",
  },
  "about.hero.title": {
    zh: "一个直接负责你采购进度的人。",
    en: "One person directly responsible for your purchasing progress.",
  },
  "about.hero.description": {
    zh: "我连接海外买家与中国供应链，帮助确认产品、沟通细节、跟进质量并推进出口流程。",
    en: "I connect overseas buyers with Chinese suppliers, helping confirm products, communicate details, follow quality and move export work forward.",
  },
  "services.hero.title": {
    zh: "从找到产品，到完成出货。",
    en: "From finding the product to shipping it out.",
  },
  "services.hero.description": {
    zh: "围绕海外买家的实际采购环节，提供清晰、直接、可跟进的支持。",
    en: "Clear, direct support around the purchasing steps that matter to overseas buyers.",
  },
  "faq.hero.title": {
    zh: "先把合作中常见的问题说明白。",
    en: "Common questions, answered clearly.",
  },
  "faq.hero.description": {
    zh: "如果你的问题不在这里，欢迎直接提交采购需求。",
    en: "If your question is not listed here, send your purchasing requirements directly.",
  },
  "contact.hero.title": {
    zh: "告诉我你的采购需求。",
    en: "Tell me what you need to source.",
  },
  "contact.hero.description": {
    zh: "填写产品、数量、规格和目的地，我会确认需求并给出下一步建议。",
    en: "Share the product, quantity, specifications and destination. I will confirm the practical next step.",
  },
};

export const settingDefaults: Record<string, string> = {
  "site.name": "PE SOHO",
  "site.url": "http://localhost:3000",
  "contact.email": "hello@example.com",
  "contact.whatsapp": "",
  "contact.reply_time": "通常 24 小时内",
};

export async function getSiteContent(key: string, language: "zh" | "en", fallback?: string) {
  const record = await prisma.siteContent.findUnique({
    where: { contentKey_language: { contentKey: key, language } },
  }).catch(() => null);
  return record?.content ?? fallback ?? contentDefaults[key]?.[language] ?? "";
}

export async function getSiteSetting(key: string, fallback?: string) {
  const record = await prisma.siteSetting.findUnique({ where: { settingKey: key } }).catch(() => null);
  return record?.settingValue ?? fallback ?? settingDefaults[key] ?? "";
}
