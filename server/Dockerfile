# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copy package files and install production deps
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production

# Generate Prisma client for production
RUN npx prisma generate

# Copy built files
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 4000

# Run migrations and start server
CMD ["sh", "-c", "npx prisma db push && node dist/index.js"]
