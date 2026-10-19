# Express on Bunny Edge Scripting

An [Express 5](https://expressjs.com) app running as a standalone Edge Script, bridged to the edge with [fetch-to-node](https://github.com/mhart/fetch-to-node).

## Run locally

```bash
npm install
npm run dev
```

The script runs at http://127.0.0.1:8080.

## Deploy

```bash
bunny scripts create my-express-api --type standalone
npm run deploy
```
