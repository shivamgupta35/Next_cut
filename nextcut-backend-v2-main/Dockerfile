cd "D:\3535g\CapStone Project\nextcut-backend-v2-main"

@'
# ---- build stage ----
FROM node:22-slim AS builder
WORKDIR /app

# Install openssl (Prisma needs it) and ca-certificates for HTTPS
RUN apt-get update && apt-get install -y openssl ca-certificates --no-install-recommends && rm -rf /var/lib/apt/lists/*

# copy package files first for cache
COPY package*.json ./

# copy prisma schema early so `npx prisma generate` can find it during postinstall
# (copy the prisma folder and any schema to the working dir)
COPY prisma ./prisma

# install dependencies (this will run postinstall and prisma generate)
RUN npm ci

# copy rest of source
COPY . .

# build the project (TypeScript compile)
RUN npm run build

# ---- production stage ----
FROM node:22-slim AS runner
WORKDIR /app

# copy built artifacts and node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/index.js"]
'@ | Set-Content .\Dockerfile -Force
