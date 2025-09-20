# Set the base image to create the image for the app
FROM node:20-alpine

# Install system dependencies (if needed)
RUN apk add --no-cache dumb-init

# Create a user with permissions to run the app
RUN addgroup app && adduser -S -G app app

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json first for better caching
COPY package*.json ./

# Copy Prisma schema for dependency installation and client generation
COPY prisma ./prisma/

# Install dependencies as root
RUN npm ci --only=production --legacy-peer-deps && npm cache clean --force

# Generate Prisma Client
RUN npx prisma generate

# Copy the rest of the application files
COPY . .

# Adjust ownership so the app user can access everything
RUN chown -R app:app /app

# Switch to non-root user for runtime
USER app

# Expose the port that Cloud Run expects
EXPOSE 8080

# Use dumb-init to handle signals properly in containers
ENTRYPOINT ["dumb-init", "--"]

# Start the app
CMD ["npm", "start"]
