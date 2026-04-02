# syntax=docker/dockerfile:1

# ─────────────────────────────────────────────────────
# Stage 1: Dependency installer
# Uses a slim base to keep the build cache efficient.
# node_modules are installed here and not re-installed
# on subsequent builds unless package.json changes.
# ─────────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copy only manifests first for better layer caching
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# ─────────────────────────────────────────────────────
# Stage 2: Final runtime image
# Copies the app source and pre-built modules from deps.
# ─────────────────────────────────────────────────────
FROM node:20-alpine AS runtime

# Set NODE_ENV early so any runtime code sees it
ENV NODE_ENV=production

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy installed node_modules from the deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source (excluding files via .dockerignore)
COPY . .

# Ensure the app user owns the working directory
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 5000

# Use exec form to handle SIGTERM correctly
CMD ["node", "server.js"]
