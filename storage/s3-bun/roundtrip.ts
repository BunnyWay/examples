import { s3 } from "bun";

// `s3` is Bun's default client. It picks up the S3_* variables from .env,
// so pointing it at Bunny Storage needs no code.
const key = `examples/hello-${Date.now()}.txt`;

await s3.write(key, "Hello from Bun and Bunny Storage", { type: "text/plain" });
console.log(`Wrote ${key} (${await s3.size(key)} bytes)`);

const { contents = [] } = await s3.list({ prefix: "examples/" });
console.log(`Listed ${contents.length} object(s) under examples/`);
for (const object of contents) {
  console.log(`  ${object.key}  ${object.size} bytes`);
}

// A presigned URL works in any HTTP client for the next five minutes, no credentials needed.
const url = s3.presign(key, { expiresIn: 300 });
const body = await (await fetch(url)).text();
console.log(`Fetched it back through a presigned URL: "${body}"`);

await s3.delete(key);
console.log(`Deleted ${key}, exists now: ${await s3.exists(key)}`);
