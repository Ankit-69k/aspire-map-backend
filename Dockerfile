# Use Node 20 Alpine
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source files
COPY . .

# Build TypeScript
RUN npm run build

# --- Production image ---
FROM node:20-alpine

WORKDIR /app

# Copy only production deps + build
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps

COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules ./node_modules

# Use non-root user
RUN addgroup app && adduser -S -G app app
RUN chown -R app:app /app
USER app

EXPOSE 8080

# Start server
CMD ["node", "dist/index.js"]
