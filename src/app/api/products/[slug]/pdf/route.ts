import { NextResponse } from "next/server";
import { getPublishedProduct } from "@/lib/products";

function pdfText(value: string) {
  const bytes = Buffer.alloc(2 + value.length * 2);
  bytes.writeUInt16BE(0xfeff, 0);
  for (let index = 0; index < value.length; index += 1) {
    bytes.writeUInt16BE(value.charCodeAt(index), 2 + index * 2);
  }
  return `<${bytes.toString("hex").toUpperCase()}>`;
}

function createPdf(lines: string[]) {
  const stream = [
    "BT",
    "/F1 20 Tf",
    "50 760 Td",
    `(${pdfText("PE SOHO Product Brief")}) Tj`,
    "/F1 11 Tf",
    "0 -30 Td",
    ...lines.flatMap((line) => [`(${pdfText(line)}) Tj`, "0 -18 Td"]),
    "ET",
  ].join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${Buffer.byteLength(stream, "ascii")} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type0 /BaseFont /STSong-Light /Encoding /UniGB-UCS2-H /DescendantFonts [6 0 R] >>",
    "<< /Type /Font /Subtype /CIDFontType0 /BaseFont /STSong-Light /CIDSystemInfo << /Registry (Adobe) /Ordering (GB1) /Supplement 4 >> >>",
  ];
  const chunks = ["%PDF-1.4\n"];
  const offsets = [0];
  for (let index = 0; index < objects.length; index += 1) {
    offsets.push(Buffer.byteLength(chunks.join(""), "ascii"));
    chunks.push(`${index + 1} 0 obj\n${objects[index]}\nendobj\n`);
  }
  const xrefOffset = Buffer.byteLength(chunks.join(""), "ascii");
  chunks.push(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`);
  for (let index = 1; index <= objects.length; index += 1) {
    chunks.push(`${String(offsets[index]).padStart(10, "0")} 00000 n \n`);
  }
  chunks.push(`trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);
  return Buffer.from(chunks.join(""), "ascii");
}

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const language = new URL(request.url).searchParams.get("language") === "zh" ? "zh" : "en";
  const product = await getPublishedProduct(slug, language);
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  const lines = [
    product.name,
    `Category: ${product.category}`,
    `MOQ: ${product.moq}`,
    `Lead time: ${product.leadTime}`,
    "",
    product.description,
    "",
    "Specifications:",
    ...product.specifications.map((item) => `${item.label}: ${item.value}`),
  ];
  const pdf = createPdf(lines);
  return new Response(pdf as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${slug}.pdf"`,
      "Content-Length": String(pdf.length),
      "Cache-Control": "public, max-age=3600",
    },
  });
}
