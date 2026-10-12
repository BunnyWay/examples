import * as BunnySDK from "@bunny.net/edgescript-sdk";
import process from "node:process";
import { signUrl } from "./sign.ts";

const LINK_LIFETIME_SECONDS = 3600;

BunnySDK.net.http.serve((request: Request): Response => {
  const { TOKEN_KEY, PULL_ZONE_URL } = process.env;
  if (!TOKEN_KEY || !PULL_ZONE_URL) {
    return new Response("Set TOKEN_KEY and PULL_ZONE_URL", { status: 500 });
  }

  const { pathname } = new URL(request.url);
  if (pathname === "/") {
    return new Response("Request a file path, such as /invoices/inv-1042.pdf");
  }

  // Check the visitor's session here, and return a 403 if they can't see this file.

  const expires = Math.floor(Date.now() / 1000) + LINK_LIFETIME_SECONDS;

  return Response.redirect(
    signUrl(PULL_ZONE_URL, TOKEN_KEY, pathname, expires),
    302,
  );
});
