# Signed downloads from Bunny Storage with Edge Scripting

A standalone Edge Script that turns any path into a signed, expiring link to a private file. The files live in a storage zone behind a pull zone with [token authentication](https://docs.bunny.net/cdn/security/token-authentication) turned on.

```bash
cp .env.example .env
deno install
deno task dev
```

Set `TOKEN_KEY` to the pull zone's **URL Token Authentication Key** and `PULL_ZONE_URL` to its hostname, then open http://127.0.0.1:8080/invoices/inv-1042.pdf. The script redirects to a link on the pull zone that works for one hour.

## Deploy

```bash
bunny scripts create signed-downloads --type standalone
bunny scripts env set TOKEN_KEY your-token-key --secret
bunny scripts env set PULL_ZONE_URL https://private-files.b-cdn.net
deno task deploy
```

## How it works

[`src/sign.ts`](src/sign.ts) builds the token from the key, the file path, and an expiry timestamp, using the [basic token authentication](https://docs.bunny.net/cdn/security/token-authentication/basic) formula. [`src/main.ts`](src/main.ts) signs the requested path and redirects to it.

The script signs every path it's asked for. Add your own session check where the comment in [`src/main.ts`](src/main.ts) marks the spot before you deploy.

`deno task test` checks the signature against a known token, and `deno task check` type-checks, lints, and checks formatting.

## Docs

- [Serve private files from Bunny Storage](https://docs.bunny.net/storage/guides/serve-private-files)
- [Token authentication](https://docs.bunny.net/cdn/security/token-authentication)
- [Standalone scripts](https://docs.bunny.net/scripting/standalone/overview)
