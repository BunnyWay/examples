import * as BunnyStorageSDK from "@bunny.net/storage-sdk";
import { Hono } from "hono";

const {
	BUNNY_STORAGE_ZONE,
	BUNNY_STORAGE_PASSWORD,
	BUNNY_STORAGE_REGION = "de",
	BUNNY_PULL_ZONE_URL,
} = process.env;

if (!BUNNY_STORAGE_ZONE || !BUNNY_STORAGE_PASSWORD || !BUNNY_PULL_ZONE_URL) {
	throw new Error("Copy .env.example to .env and fill in every value");
}

const zone = BunnyStorageSDK.zone.connect_with_accesskey(
	BUNNY_STORAGE_REGION as BunnyStorageSDK.regions.StorageRegion,
	BUNNY_STORAGE_ZONE,
	BUNNY_STORAGE_PASSWORD,
);

const MAX_BYTES = 10 * 1024 * 1024;

// The SDK types its input as Node's web ReadableStream. A File stream is the same thing at runtime.
type UploadStream = Parameters<typeof BunnyStorageSDK.file.upload>[2];

const app = new Hono();

app.get("/", async (c) => {
	// list() throws when the folder doesn't exist yet, which means no uploads.
	const files = await BunnyStorageSDK.file
		.list(zone, "/uploads/")
		.catch(() => []);
	const newestFirst = files
		.filter((file) => !file.isDirectory)
		.sort((a, b) => b.lastChanged.getTime() - a.lastChanged.getTime());

	return c.html(
		<html lang="en">
			<head>
				<meta charset="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<title>Upload to Bunny Storage with the SDK</title>
			</head>
			<body style="font-family: system-ui, sans-serif; max-width: 40rem; margin: 3rem auto; padding: 0 1.5rem">
				<h1>Upload to Bunny Storage with the SDK</h1>
				<form method="post" action="/upload" enctype="multipart/form-data">
					<input type="file" name="file" required />
					<button type="submit">Upload</button>
				</form>
				{c.req.query("error") ? (
					<p style="color: #dc2626">{c.req.query("error")}</p>
				) : null}
				<h2>Uploads</h2>
				{newestFirst.length === 0 ? (
					<p>Nothing in uploads/ yet.</p>
				) : (
					<ul>
						{newestFirst.map((file) => (
							<li>
								<a href={`${BUNNY_PULL_ZONE_URL}/uploads/${file.objectName}`}>
									{file.objectName}
								</a>
							</li>
						))}
					</ul>
				)}
			</body>
		</html>,
	);
});

app.post("/upload", async (c) => {
	const body = await c.req.parseBody();
	const file = body.file;

	if (!(file instanceof File) || file.size === 0) {
		return c.redirect(
			`/?error=${encodeURIComponent("Choose a file to upload")}`,
		);
	}
	if (file.size > MAX_BYTES) {
		return c.redirect(
			`/?error=${encodeURIComponent("Files must be 10 MB or smaller")}`,
		);
	}

	// A random prefix keeps two uploads with the same name apart.
	const name = `${crypto.randomUUID()}-${file.name.replace(/[^\w.-]+/g, "-")}`;

	await BunnyStorageSDK.file.upload(
		zone,
		`/uploads/${name}`,
		file.stream() as unknown as UploadStream,
		{
			contentType: file.type || "application/octet-stream",
		},
	);

	return c.redirect("/");
});

app.onError((err, c) =>
	c.redirect(`/?error=${encodeURIComponent(err.message)}`),
);

export default app;
