FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache tini ca-certificates && \
    addgroup -g 1001 app && \
    adduser -u 1001 -G app -s /bin/sh -D app && \
    mkdir -p /app/data && chown -R app:app /app/data

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

EXPOSE 3002

USER app

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/server.cjs"]
