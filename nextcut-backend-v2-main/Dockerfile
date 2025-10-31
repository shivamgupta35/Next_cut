# ---- build stage ----
FROM node:22-slim AS builder
WORKDIR /app

# install openssl libs and ca-certs so Prisma can generate / run engines
RUN apt-get update && \
    apt-get install -y --no-install-recommends openssl ca-certificates libssl3 && \
    rm -rf /var/lib/apt/lists/*

# copy package files first for cache
COPY package*.json ./

# copy prisma schema early so `npx prisma generate` can find it during postinstall
COPY prisma ./prisma

# install dependencies (runs postinstall and prisma generate if postinstall exists)
RUN npm ci

# copy rest of source
COPY . .

# ensure prisma client is generated for linux target(s)
RUN npx prisma generate


# build the project (TypeScript compile)
RUN npm run build

# ---- production stage ----
FROM node:22-slim AS runner
WORKDIR /app

# Install runtime openssl library required by Prisma library engine
RUN apt-get update && \
    apt-get install -y --no-install-recommends libssl3 ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# copy built artifacts and node_modules from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/index.js"]
