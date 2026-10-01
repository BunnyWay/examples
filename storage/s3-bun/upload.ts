import { basename } from "node:path";
import { s3 } from "bun";

const path = process.argv[2];
if (!path) {
  console.error("Usage: bun upload <file>");
  process.exit(1);
}

const file = Bun.file(path);
if (!(await file.exists())) {
  console.error(`No file at ${path}`);
  process.exit(1);
}

const key = `uploads/${basename(path)}`;
const started = performance.now();

// Bun streams the file and switches to a multipart upload for large files,
// so this works the same for a 1 KB text file and a 5 GB video.
await s3.write(key, file);

const seconds = ((performance.now() - started) / 1000).toFixed(1);
console.log(`Uploaded ${path} to ${key} (${file.size} bytes in ${seconds}s)`);
console.log(`Download link, valid for an hour: ${s3.presign(key, { expiresIn: 3600 })}`);
