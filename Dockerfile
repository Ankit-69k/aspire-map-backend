# ---------- Build stage ----------
FROM node:20-alpine AS build
WORKDIR /app

# Install deps including devDependencies (TypeScript, Prisma, etc.)
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy rest of the source
COPY . .

# Build TypeScript -> dist/
RUN npm run build

# Generate Prisma client
RUN npx prisma generate


# ---------- Runtime stage ----------
FROM node:20-alpine AS runtime
WORKDIR /app

RUN apk add --no-cache dumb-init
RUN addgroup app && adduser -S -G app app

# Copy only runtime deps
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps && npm cache clean --force

# Copy prisma and built app
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/dist ./dist

# Permissions
RUN chown -R app:app /app
USER app

ENV PORT=8080
EXPOSE $PORT

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
