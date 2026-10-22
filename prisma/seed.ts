import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type SeedProduct = {
  slug: string;
  sku: string;
  category: string;
  nameEn: string;
  nameCn: string;
  descriptionEn: string;
  descriptionCn: string;
  moq: string;
  leadTime: string;
  images: string[];
  specifications: Array<[string, string]>;
};

const seedProducts: SeedProduct[] = [
  {
    slug: "stainless-steel-cable-gland",
    sku: "CG-304-0135",
    category: "cable-accessories",
    nameEn: "Stainless Steel Cable Gland",
    nameCn: "不锈钢电缆接头",
    descriptionEn: "304 stainless steel cable gland for industrial and outdoor enclosures.",
    descriptionCn: "适用于工业设备、户外箱体和控制柜的 304 不锈钢电缆接头。",
    moq: "500 pcs",
    leadTime: "15–25 days",
    images: [
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=900&q=85",
    ],
    specifications: [["材质", "Stainless Steel 304"], ["防护等级", "IP68"], ["最小起订量", "500 pcs"]],
  },
  {
    slug: "nylon-cable-gland",
    sku: "CG-NY-021",
    category: "cable-accessories",
    nameEn: "Nylon Cable Gland",
    nameCn: "尼龙电缆接头",
    descriptionEn: "Lightweight nylon cable gland with reliable strain relief and sealing.",
    descriptionCn: "轻量尼龙材质，具备稳定的电缆固定和密封效果。",
    moq: "1,000 pcs",
    leadTime: "12–20 days",
    images: [
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=900&q=85",
    ],
    specifications: [["材质", "Nylon PA66"], ["防护等级", "IP68"], ["颜色", "Black / White"]],
  },
  {
    slug: "custom-kraft-packaging",
    sku: "PK-KR-100",
    category: "packaging-solutions",
    nameEn: "Custom Kraft Packaging",
    nameCn: "定制牛皮纸包装",
    descriptionEn: "Custom kraft packaging with flexible sizes and low-volume production support.",
    descriptionCn: "支持尺寸、印刷和结构定制，可承接小批量包装生产。",
    moq: "500 pcs",
    leadTime: "18–30 days",
    images: [
      "https://images.unsplash.com/photo-1607166452427-7e4476b8d9f2?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1589365278144-c9e705f843ba?auto=format&fit=crop&w=900&q=85",
    ],
    specifications: [["材质", "Kraft Paper"], ["印刷", "CMYK / Pantone"], ["定制", "Size and artwork"]],
  },
  {
    slug: "corrugated-shipping-box",
    sku: "PK-BC-220",
    category: "packaging-solutions",
    nameEn: "Corrugated Shipping Box",
    nameCn: "瓦楞纸运输箱",
    descriptionEn: "Protective corrugated boxes for export packaging and warehouse handling.",
    descriptionCn: "适合出口包装和仓储周转的瓦楞纸运输箱。",
    moq: "300 pcs",
    leadTime: "15–25 days",
    images: [
      "https://images.unsplash.com/photo-1586528116493-da8b3a8b4a9a?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=900&q=85",
    ],
    specifications: [["纸板", "3 / 5 layer"], ["印刷", "Flexographic"], ["包装", "Flat packed"]],
  },
  {
    slug: "industrial-hardware-components",
    sku: "HW-IC-300",
    category: "industrial-hardware",
    nameEn: "Industrial Hardware Components",
    nameCn: "工业五金零部件",
    descriptionEn: "Machined and stamped hardware components for repeat industrial orders.",
    descriptionCn: "适用于工业项目和长期重复订单的机加工、冲压五金零部件。",
    moq: "1,000 pcs",
    leadTime: "20–35 days",
    images: [
      "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=900&q=85",
    ],
    specifications: [["材质", "Steel / Stainless Steel"], ["工艺", "CNC / Stamping"], ["公差", "As drawing"]],
  },
  {
    slug: "stainless-steel-bracket",
    sku: "HW-BR-304",
    category: "industrial-hardware",
    nameEn: "Stainless Steel Bracket",
    nameCn: "不锈钢安装支架",
    descriptionEn: "Corrosion-resistant brackets for equipment mounting and support applications.",
    descriptionCn: "耐腐蚀安装支架，适用于设备固定和支撑场景。",
    moq: "500 pcs",
    leadTime: "20–30 days",
    images: [
      "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=900&q=85",
    ],
    specifications: [["材质", "Stainless Steel 304"], ["表面处理", "Brushed"], ["厚度", "1.5–3.0 mm"]],
  },
  {
    slug: "led-work-light",
    sku: "EL-WL-120",
    category: "electrical-products",
    nameEn: "LED Work Light",
    nameCn: "LED 工作灯",
    descriptionEn: "Portable LED work light for workshops, warehouses, and outdoor tasks.",
    descriptionCn: "适用于车间、仓库和户外作业的便携式 LED 工作灯。",
    moq: "100 pcs",
    leadTime: "25–35 days",
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1550985543-f47b9e8f3f7a?auto=format&fit=crop&w=900&q=85",
    ],
    specifications: [["功率", "20 W"], ["色温", "6500 K"], ["电池", "Rechargeable"]],
  },
  {
    slug: "solar-garden-light",
    sku: "EL-SL-080",
    category: "electrical-products",
    nameEn: "Solar Garden Light",
    nameCn: "太阳能庭院灯",
    descriptionEn: "Weather-resistant solar garden light for residential and landscape projects.",
    descriptionCn: "适用于住宅和景观项目的耐候型太阳能庭院灯。",
    moq: "200 pcs",
    leadTime: "25–40 days",
    images: [
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=900&q=85",
    ],
    specifications: [["光源", "LED"], ["防护等级", "IP65"], ["续航", "8–12 hours"]],
  },
  {
    slug: "microfiber-cleaning-cloth",
    sku: "HC-MC-500",
    category: "household-products",
    nameEn: "Microfiber Cleaning Cloth",
    nameCn: "超细纤维清洁布",
    descriptionEn: "Reusable microfiber cloth with custom colors, sizes, and packaging.",
    descriptionCn: "支持颜色、尺寸和包装定制的可重复使用超细纤维清洁布。",
    moq: "2,000 pcs",
    leadTime: "18–28 days",
    images: [
      "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=900&q=85",
    ],
    specifications: [["材质", "Polyester / Polyamide"], ["克重", "250–350 GSM"], ["定制", "Logo and packaging"]],
  },
  {
    slug: "reusable-storage-bag",
    sku: "HC-RB-210",
    category: "household-products",
    nameEn: "Reusable Storage Bag",
    nameCn: "可重复使用收纳袋",
    descriptionEn: "Reusable storage bag for home organization, travel, and retail packaging.",
    descriptionCn: "适合家庭收纳、旅行和零售包装的可重复使用收纳袋。",
    moq: "1,000 pcs",
    leadTime: "20–30 days",
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85",
    ],
    specifications: [["材质", "RPET / Oxford"], ["尺寸", "Custom"], ["闭合方式", "Zipper"]],
  },
];

async function upsertCategory(slug: string) {
  const names: Record<string, [string, string]> = {
    "cable-accessories": ["Cable Accessories", "电缆配件"],
    "packaging-solutions": ["Packaging Solutions", "包装方案"],
    "industrial-hardware": ["Industrial Hardware", "工业五金"],
    "electrical-products": ["Electrical Products", "电气产品"],
    "household-products": ["Household Products", "家居用品"],
  };
  const [name, nameCn] = names[slug];
  return prisma.productCategory.upsert({
    where: { slug },
    update: { name, nameCn },
    create: { slug, name, nameCn },
  });
}

async function upsertImage(productId: number, imageUrl: string, sortOrder: number) {
  return prisma.productImage.upsert({
    where: { productId_sortOrder: { productId, sortOrder } },
    update: { imageUrl, isPrimary: sortOrder === 0, altText: "产品图片" },
    create: { productId, imageUrl, sortOrder, isPrimary: sortOrder === 0, altText: "产品图片" },
  });
}

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.ADMIN_PASSWORD ?? "change-me";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash, name: "PE SOHO 管理员" },
  });

  for (const [index, item] of seedProducts.entries()) {
    const category = await upsertCategory(item.category);
    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        sku: item.sku,
        categoryId: category.id,
        status: "PUBLISHED",
        moq: item.moq,
        leadTime: item.leadTime,
        imageUrl: item.images[0],
        sortOrder: index + 1,
      },
      create: {
        slug: item.slug,
        sku: item.sku,
        status: "PUBLISHED",
        categoryId: category.id,
        moq: item.moq,
        leadTime: item.leadTime,
        imageUrl: item.images[0],
        sortOrder: index + 1,
      },
    });

    await prisma.productTranslation.upsert({
      where: { productId_language: { productId: product.id, language: "en" } },
      update: { name: item.nameEn, shortDescription: item.descriptionEn, description: item.descriptionEn },
      create: { productId: product.id, language: "en", name: item.nameEn, shortDescription: item.descriptionEn, description: item.descriptionEn },
    });
    await prisma.productTranslation.upsert({
      where: { productId_language: { productId: product.id, language: "zh" } },
      update: { name: item.nameCn, shortDescription: item.descriptionCn, description: item.descriptionCn },
      create: { productId: product.id, language: "zh", name: item.nameCn, shortDescription: item.descriptionCn, description: item.descriptionCn },
    });

    await prisma.productSpecification.deleteMany({ where: { productId: product.id } });
    await prisma.productSpecification.createMany({
      data: item.specifications.map(([label, value], specificationIndex) => ({
        productId: product.id,
        label,
        value,
        sortOrder: specificationIndex + 1,
      })),
    });

    for (const [imageIndex, imageUrl] of item.images.entries()) {
      await upsertImage(product.id, imageUrl, imageIndex);
    }
  }

  const siteSettings = {
    "site.name": "PE SOHO",
    "site.url": "http://localhost:3000",
    "contact.email": "hello@example.com",
    "contact.whatsapp": "",
    "contact.reply_time": "通常 24 小时内",
  };
  for (const [settingKey, settingValue] of Object.entries(siteSettings)) {
    await prisma.siteSetting.upsert({
      where: { settingKey },
      update: { settingValue },
      create: { settingKey, settingValue },
    });
  }

  const siteContents = [
    ["home.hero.title", "zh", "让来自中国的采购更简单、更可靠。"],
    ["home.hero.title", "en", "Make sourcing from China simpler and more reliable."],
    ["home.hero.description", "zh", "我帮助海外买家寻找合适产品、确认规格，并通过一个明确的联系人推进报价、生产与出货。"],
    ["home.hero.description", "en", "I help overseas buyers find suitable products, confirm specifications and move quotation, production and shipping forward with one clear contact."],
    ["contact.hero.title", "zh", "告诉我你的采购需求。"],
    ["contact.hero.title", "en", "Tell me what you need to source."],
    ["contact.hero.description", "zh", "填写产品、数量、规格和目的地，我会确认需求并给出下一步建议。"],
    ["contact.hero.description", "en", "Share the product, quantity, specifications and destination. I will confirm the practical next step."],
  ] as const;
  for (const [contentKey, language, content] of siteContents) {
    await prisma.siteContent.upsert({
      where: { contentKey_language: { contentKey, language } },
      update: { content },
      create: { contentKey, language, content },
    });
  }

  console.log(`Seeded admin ${email} and ${seedProducts.length} products.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
