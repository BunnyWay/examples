FROM oven/bun:1 AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
# The build script copies public and .next/static into .next/standalone
RUN bun run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./

ENV PORT=80
EXPOSE 80

CMD ["node", "server.js"]
