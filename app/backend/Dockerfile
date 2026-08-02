# ── Stage 1: Runtime ────────────────────────────────────────
FROM alpine:latest

RUN apk add --no-cache nodejs wget

WORKDIR /app

# Копируем готовые зависимости и собранный dist
COPY package*.json ./
COPY node_modules ./node_modules
COPY dist ./dist

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "dist/server.js"]
