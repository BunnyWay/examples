import { createHash } from "node:crypto";

// Basic token authentication: Base64(MD5(key + path + expires)), made URL safe.
// https://docs.bunny.net/cdn/security/token-authentication/basic
export function signUrl(
  baseUrl: string,
  key: string,
  path: string,
  expires: number,
): string {
  const token = createHash("md5")
    .update(key + path + expires)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  const url = new URL(path, baseUrl);
  url.searchParams.set("token", token);
  url.searchParams.set("expires", String(expires));

  return url.href;
}
