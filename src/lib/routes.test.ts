import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

test("the English privacy policy route exists for the English footer link", () => {
  const routeFile = join(process.cwd(), "src", "app", "en", "privacy", "page.tsx");
  assert.equal(existsSync(routeFile), true);
});
