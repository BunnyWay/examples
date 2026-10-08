# Blazor WebAssembly on Bunny Storage

A standalone Blazor WebAssembly app, as made by `dotnet new blazorwasm --empty`, with a second route at `/about`. It publishes as static files and is served from Bunny Storage through a pull zone, with client-side routing so deep links survive a refresh.

```bash
dotnet watch
```

## Deploy

```bash
bunny sites create my-site
bunny sites deploy --build
```

[`bunny.jsonc`](bunny.jsonc) tells the bunny.net CLI to run `dotnet publish -c Release -o bin/publish`, upload `bin/publish/wwwroot`, and serve `index.html` for unknown paths so `/about` loads when opened directly. You need the .NET 10 SDK installed.

See the [Blazor WebAssembly guide](https://docs.bunny.net/storage/static-site-hosting/blazor) for a manual deploy and custom domains.
