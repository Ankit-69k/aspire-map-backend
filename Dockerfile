# Set the base image to create the image for the app
FROM node:20-alpine

# Install system dependencies (if needed)
RUN apk add --no-cache dumb-init

# Create a user with permissions to run the app
# -S -> create a system user
# -G -> add the user to a group
# This is done to avoid running the app as root
RUN addgroup app && adduser -S -G app app

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json first for better caching
# This is done before copying the rest of the files to take advantage of Docker's cache
COPY --chown=app:app package*.json ./

# Copy Prisma schema for dependency installation and client generation
COPY --chown=app:app prisma ./prisma/

# Switch to app user for security
USER app

# Install dependencies
# Use npm ci for faster, reliable, reproducible builds in production
RUN npm ci --only=production --legacy-peer-deps && npm cache clean --force

# Generate Prisma Client
RUN npx prisma generate

# Copy the rest of the application files
COPY --chown=app:app . .

# Expose the port that Cloud Run expects (8080 is correct for Cloud Run)
EXPOSE 8080

# Use dumb-init to handle signals properly in containers
ENTRYPOINT ["dumb-init", "--"]

# Start the app
CMD ["npm", "start"]