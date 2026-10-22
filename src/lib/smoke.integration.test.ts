import assert from "node:assert/strict";
import test from "node:test";
import { prisma } from "./prisma";

const baseUrl = process.env.BASE_URL ?? "http://localhost:3002";
let sessionCookie = "";

async function request(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (sessionCookie) headers.set("cookie", sessionCookie);
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, { ...init, headers });
  } catch (error) {
    throw new Error(`${path}: ${error instanceof Error ? error.message : String(error)}`);
  }
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) sessionCookie = setCookie.split(";")[0];
  return response;
}

async function readJson(response: Response) {
  return (await response.json()) as Record<string, unknown>;
}

function utf16Be(value: string) {
  const bytes = Buffer.alloc(2 + value.length * 2);
  bytes.writeUInt16BE(0xfeff, 0);
  for (let index = 0; index < value.length; index += 1) {
    bytes.writeUInt16BE(value.charCodeAt(index), 2 + index * 2);
  }
  return bytes;
}

test("covers the critical public and admin workflows against the local app", async () => {
  let categoryId: number | null = null;
  let productId: number | null = null;
  let cloneId: number | null = null;
  let inquiryId: number | null = null;
  const suffix = Date.now().toString();
  const categorySlug = `integration-category-${suffix}`;
  const productSlug = `integration-product-${suffix}`;
  const inquiryMessage = `Integration smoke inquiry ${suffix}`;
  const blobBase64 = Buffer.from("integration-image").toString("base64");
  const attachmentBase64 = Buffer.from("integration-attachment").toString("base64");
  const originalContent = await prisma.siteContent.findUnique({
    where: { contentKey_language: { contentKey: "home.hero.title", language: "zh" } },
  });
  const originalSetting = await prisma.siteSetting.findUnique({
    where: { settingKey: "contact.email" },
  });

  try {
    const publicRoutes = [
      "/",
      "/products",
      "/products/stainless-steel-cable-gland",
      "/services",
      "/about",
      "/faq",
      "/contact",
      "/privacy",
      "/en",
      "/en/products",
      "/en/products/stainless-steel-cable-gland",
      "/en/services",
      "/en/about",
      "/en/faq",
      "/en/contact",
      "/en/privacy",
      "/robots.txt",
      "/sitemap.xml",
    ];
    for (const route of publicRoutes) {
      const response = await request(route);
      assert.equal(response.status, 200, `expected ${route} to be public`);
    }
    const homeHtml = await (await request("/")).text();
    assert.match(homeHtml, /\/products\/stainless-steel-cable-gland/);

    assert.equal((await request("/products/does-not-exist")).status, 404);
    assert.equal((await request("/en/products/does-not-exist")).status, 404);
    const pdfResponse = await request("/api/products/stainless-steel-cable-gland/pdf");
    assert.equal(pdfResponse.status, 200);
    assert.equal(pdfResponse.headers.get("content-type"), "application/pdf");
    assert.equal(Buffer.from(await pdfResponse.arrayBuffer()).subarray(0, 8).toString(), "%PDF-1.4");
    const chinesePdf = await request("/api/products/stainless-steel-cable-gland/pdf?language=zh");
    const chinesePdfBytes = Buffer.from(await chinesePdf.arrayBuffer());
    const chineseNameBytes = Buffer.from(`<${utf16Be("不锈钢电缆接头").toString("hex").toUpperCase()}>`);
    assert.equal(chinesePdf.status, 200);
    assert.equal(chinesePdfBytes.includes(chineseNameBytes), true);
    assert.equal((await request("/api/products/does-not-exist/pdf")).status, 404);
    assert.equal((await request("/admin/login")).status, 200);

    const crossOriginInquiry = await request("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json", origin: "https://attacker.example" },
      body: JSON.stringify({ name: "Test", email: "buyer@example.com", product: "Test", message: "Test" }),
    });
    assert.equal(crossOriginInquiry.status, 403);

    const invalidInquiryEmail = await request("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test", email: "not-an-email", product: "Test", message: "Test" }),
    });
    assert.equal(invalidInquiryEmail.status, 400);

    const invalidLogin = await request("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@example.com", password: "wrong-password" }),
    });
    assert.equal(invalidLogin.status, 401);

    const login = await request("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: process.env.ADMIN_EMAIL ?? "admin@example.com", password: process.env.ADMIN_PASSWORD ?? "change-me" }),
    });
    assert.equal(login.status, 200);
    assert.match(sessionCookie, /^pe_soho_admin=/);

    for (const route of [
      "/admin",
      "/admin/products",
      "/admin/products/new",
      "/admin/categories",
      "/admin/inquiries",
      "/admin/content",
      "/admin/settings",
      "/admin/users",
    ]) {
      assert.equal((await request(route)).status, 200, `expected ${route} after login`);
    }
    assert.equal((await request("/api/admin/inquiries/export")).status, 200);

    const createCategory = await request("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: categorySlug, name: "Integration Category", nameCn: "集成测试分类" }),
    });
    assert.equal(createCategory.status, 200);
    categoryId = Number((await readJson(createCategory)).id);
    assert.ok(categoryId > 0);

    const updateCategory = await request("/api/admin/categories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: categoryId, slug: categorySlug, name: "Updated Integration Category", nameCn: "更新后的集成测试分类" }),
    });
    assert.equal(updateCategory.status, 200);

    const createProduct = await request("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: productSlug,
        sku: `INT-${suffix}`,
        categoryId,
        nameEn: "Integration Test Product",
        nameCn: "集成测试产品",
        shortDescriptionEn: "A product created by the integration test.",
        shortDescriptionCn: "由集成测试创建的产品。",
        descriptionEn: "English integration test description.",
        descriptionCn: "中文集成测试描述。",
        moq: "10 pcs",
        leadTime: "7 days",
        publish: "true",
        images: JSON.stringify([
          { base64: blobBase64, mimeType: "image/png", altText: "BLOB image" },
          { imageUrl: "https://example.com/integration.png", altText: "URL image" },
        ]),
        specifications: JSON.stringify([{ label: "Test material", value: "Test value" }]),
      }),
    });
    assert.equal(createProduct.status, 200);
    productId = Number((await readJson(createProduct)).id);
    assert.ok(productId > 0);

    const createdProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: { orderBy: { sortOrder: "asc" } }, translations: true },
    });
    assert.ok(createdProduct);
    assert.equal(createdProduct.status, "PUBLISHED");
    assert.equal(createdProduct.images.length, 2);
    assert.equal(Buffer.from(createdProduct.images[0].imageBlob ?? []).toString(), "integration-image");
    assert.equal(createdProduct.translations.length, 2);

    const blockedCategoryDelete = await request("/api/admin/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: categoryId }),
    });
    assert.equal(blockedCategoryDelete.status, 400);

    const editProduct = await request(`/api/admin/products/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: productSlug,
        sku: `INT-${suffix}`,
        categoryId,
        nameEn: "Updated Integration Product",
        nameCn: "更新后的集成测试产品",
        shortDescriptionEn: "Updated English summary.",
        shortDescriptionCn: "更新后的中文简述。",
        descriptionEn: "Updated English description.",
        descriptionCn: "更新后的中文描述。",
        moq: "20 pcs",
        leadTime: "9 days",
        status: "PUBLISHED",
        existingImages: JSON.stringify(createdProduct.images.map((image, index) => ({
          id: image.id,
          imageUrl: image.imageUrl ?? undefined,
          altText: image.altText ?? undefined,
          sortOrder: index,
          isPrimary: index === 1,
        }))),
        newImages: "[]",
        specifications: JSON.stringify([{ label: "Updated material", value: "Updated value" }]),
      }),
    });
    assert.equal(editProduct.status, 200);

    const publicProduct = await request(`/products/${productSlug}`);
    assert.equal(publicProduct.status, 200);
    assert.match(await publicProduct.text(), /更新后的集成测试产品/);
    assert.equal((await request(`/en/products/${productSlug}`)).status, 200);

    const duplicateProduct = await request(`/api/admin/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "duplicate" }),
    });
    assert.equal(duplicateProduct.status, 200);
    cloneId = Number((await readJson(duplicateProduct)).id);
    assert.ok(cloneId > 0);
    assert.equal((await prisma.product.findUnique({ where: { id: cloneId } }))?.status, "DRAFT");

    assert.equal((await request(`/api/admin/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ARCHIVED" }),
    })).status, 200);
    assert.equal((await request(`/products/${productSlug}`)).status, 404);
    assert.equal((await request(`/api/admin/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "PUBLISHED" }),
    })).status, 200);

    const validInquiry = await request("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Integration Buyer",
        email: `integration-${suffix}@example.com`,
        company: "Integration Company",
        whatsapp: "+8613800000000",
        country: "China",
        product: productSlug,
        quantity: "20 pcs",
        specification: "Integration specification",
        message: inquiryMessage,
        attachments: [{
          fileName: "integration.txt",
          mimeType: "text/plain",
          fileSize: Buffer.from("integration-attachment").length,
          fileBase64: attachmentBase64,
        }],
      }),
    });
    assert.equal(validInquiry.status, 200);

    const createdInquiry = await prisma.inquiry.findFirst({
      where: { message: inquiryMessage },
      include: { attachments: true },
    });
    assert.ok(createdInquiry);
    inquiryId = createdInquiry.id;
    assert.equal(createdInquiry.whatsapp, "+8613800000000");
    assert.equal(createdInquiry.attachments.length, 1);
    assert.equal(Buffer.from(createdInquiry.attachments[0].fileBlob ?? []).toString(), "integration-attachment");

    const inquiryDetail = await request(`/api/admin/inquiries/${inquiryId}`);
    assert.equal(inquiryDetail.status, 200);
    assert.equal((await readJson(inquiryDetail)).whatsapp, "+8613800000000");

    const inquiryStatus = await request(`/api/admin/inquiries/${inquiryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "IN_PROGRESS" }),
    });
    assert.equal(inquiryStatus.status, 200);

    const inquiryNote = await request(`/api/admin/inquiries/${inquiryId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "REPLY", content: "Integration reply record" }),
    });
    assert.equal(inquiryNote.status, 200);
    assert.equal((await prisma.inquiry.findUnique({ where: { id: inquiryId } }))?.status, "REPLIED");

    const attachment = await request(`/api/admin/inquiries/${inquiryId}/attachments/${createdInquiry.attachments[0].id}`);
    assert.equal(attachment.status, 200);
    assert.equal(Buffer.from(await attachment.arrayBuffer()).toString(), "integration-attachment");

    const exportResponse = await request("/api/admin/inquiries/export");
    assert.equal(exportResponse.status, 200);
    assert.equal(exportResponse.headers.get("content-type"), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    assert.equal(Buffer.from(await exportResponse.arrayBuffer()).subarray(0, 2).toString(), "PK");

    const contentValue = `集成测试首页标题 ${suffix}`;
    const saveContent = await request("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ contentKey: "home.hero.title", language: "zh", content: contentValue }] }),
    });
    assert.equal(saveContent.status, 200);
    assert.match(await (await request("/")).text(), new RegExp(contentValue));

    const settingValue = `integration-${suffix}@example.com`;
    const saveSetting = await request("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ settingKey: "contact.email", settingValue: settingValue }] }),
    });
    assert.equal(saveSetting.status, 200);
    assert.match(await (await request("/contact")).text(), new RegExp(settingValue));

    const deleteClone = await request(`/api/admin/products/${cloneId}`, { method: "DELETE" });
    assert.equal(deleteClone.status, 200);
    cloneId = null;
    const deleteProduct = await request(`/api/admin/products/${productId}`, { method: "DELETE" });
    assert.equal(deleteProduct.status, 200);
    productId = null;
    const deleteCategory = await request("/api/admin/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: categoryId }),
    });
    assert.equal(deleteCategory.status, 200);
    categoryId = null;

    assert.equal((await request("/api/admin/logout", { method: "POST" })).status, 200);
    sessionCookie = "";
    assert.equal((await request("/admin", { redirect: "manual" })).status, 307);
  } finally {
    if (originalContent) {
      await prisma.siteContent.upsert({
        where: { contentKey_language: { contentKey: originalContent.contentKey, language: originalContent.language } },
        update: { content: originalContent.content },
        create: { contentKey: originalContent.contentKey, language: originalContent.language, content: originalContent.content },
      });
    } else {
      await prisma.siteContent.deleteMany({ where: { contentKey: "home.hero.title", language: "zh" } });
    }
    if (originalSetting) {
      await prisma.siteSetting.upsert({
        where: { settingKey: originalSetting.settingKey },
        update: { settingValue: originalSetting.settingValue },
        create: { settingKey: originalSetting.settingKey, settingValue: originalSetting.settingValue },
      });
    }
    if (inquiryId) await prisma.inquiry.delete({ where: { id: inquiryId } }).catch(() => undefined);
    if (cloneId) await prisma.product.delete({ where: { id: cloneId } }).catch(() => undefined);
    if (productId) await prisma.product.delete({ where: { id: productId } }).catch(() => undefined);
    if (categoryId) await prisma.productCategory.delete({ where: { id: categoryId } }).catch(() => undefined);
    await prisma.$disconnect();
  }
});
