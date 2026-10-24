# Stage 1: Build
FROM node:20-alpine AS builder

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy lockfile and package.json first to leverage Docker cache
COPY pnpm-lock.yaml package.json ./

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY . .
RUN pnpm run build

# Stage 2: Production
FROM node:20-alpine AS runner

# Re-enable pnpm for the runner stage
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy only production dependencies
COPY pnpm-lock.yaml package.json ./
RUN pnpm install --prod --frozen-lockfile

# Copy built code from builder
COPY --from=builder /app/dist ./dist

EXPOSE 5004

USER node

CMD ["node", "dist/main"]
