import assert from "node:assert/strict";
import test from "node:test";
import { imageToSrc } from "./products";
import { isAllowedAttachmentSize, isProductSlug, isSameOriginRequest, isValidEmail, normalizeEmail } from "./validation";

test("accepts URL-safe product slugs and rejects unsafe values", () => {
  assert.equal(isProductSlug("stainless-steel-cable-gland"), true);
  assert.equal(isProductSlug("Cable Gland"), false);
  assert.equal(isProductSlug("../admin"), false);
});

test("normalizes administrator emails before lookup", () => {
  assert.equal(normalizeEmail("  ADMIN@EXAMPLE.COM "), "admin@example.com");
});

test("accepts ordinary email addresses and rejects malformed inquiry emails", () => {
  assert.equal(isValidEmail("buyer@example.com"), true);
  assert.equal(isValidEmail(" buyer@example.com "), true);
  assert.equal(isValidEmail("buyer@example"), false);
  assert.equal(isValidEmail("buyer example.com"), false);
});

test("limits attachments to a positive five megabytes", () => {
  assert.equal(isAllowedAttachmentSize(1), true);
  assert.equal(isAllowedAttachmentSize(5 * 1024 * 1024), true);
  assert.equal(isAllowedAttachmentSize(0), false);
  assert.equal(isAllowedAttachmentSize(5 * 1024 * 1024 + 1), false);
});

test("uses image BLOB before the URL fallback", () => {
  const blobSrc = imageToSrc({
    imageBlob: Uint8Array.from([72, 105]),
    mimeType: "image/png",
    imageUrl: "https://example.com/fallback.png",
  });
  assert.equal(blobSrc, "data:image/png;base64,SGk=");
  assert.equal(imageToSrc({ imageBlob: null, mimeType: "image/png", imageUrl: "https://example.com/fallback.png" }), "https://example.com/fallback.png");
});

test("accepts same-origin requests and rejects cross-origin requests", () => {
  assert.equal(isSameOriginRequest(new Request("http://localhost:3000/api/test", { headers: { origin: "http://localhost:3000" } })), true);
  assert.equal(isSameOriginRequest(new Request("http://localhost:3000/api/test", { headers: { origin: "https://attacker.example" } })), false);
});
