# ---------------- Build Stage ----------------
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm ci --legacy-peer-deps

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source files
COPY . .

# Build TypeScript
RUN npm run build

# ---------------- Production Stage ----------------
FROM node:20-alpine

WORKDIR /app

# Copy only production deps
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps

# Copy built JS files from build stage
COPY --from=build /app/dist ./dist
# Copy Prisma client
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

# Copy Prisma schema if needed at runtime
COPY --from=build /app/prisma ./prisma

# Create non-root user
RUN addgroup app && adduser -S -G app app
RUN chown -R app:app /app
USER app

# Expose port Cloud Run expects
EXPOSE 8080

# Start server
CMD ["node", "dist/index.js"]
