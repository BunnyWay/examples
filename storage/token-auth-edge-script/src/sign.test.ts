import { strictEqual } from "node:assert/strict";
import { signUrl } from "./sign.ts";

Deno.test("signs a path with the basic token formula", () => {
  // Expected token computed independently from the documented formula.
  strictEqual(
    signUrl(
      "https://private-files.b-cdn.net",
      "secret-key",
      "/invoices/inv-1042.pdf",
      1893456000,
    ),
    "https://private-files.b-cdn.net/invoices/inv-1042.pdf?token=yfRjJNeFHPAtoKAFMjY8Gg&expires=1893456000",
  );
});
