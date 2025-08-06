# Blacktop Blackout - Production Dockerfile
# Multi-stage build for optimized production container

# Stage 1: Build stage
FROM node:20-alpine AS builder

LABEL maintainer="Blacktop Solutions LLC <info@blacktopsolutions.com>"
LABEL description="Blacktop Blackout - Asphalt Maintenance Management Platform"
LABEL version="1.0.0"

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    curl

# Copy package files
COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build applications
RUN npm run build

# Stage 2: Production stage
FROM node:20-alpine AS production

# Install runtime dependencies
RUN apk add --no-cache \
    postgresql-client \
    curl \
    tini

# Create app user
RUN addgroup -g 1001 -S blacktop && \
    adduser -S blacktop -u 1001 -G blacktop

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=blacktop:blacktop /app/dist ./dist
COPY --from=builder --chown=blacktop:blacktop /app/node_modules ./node_modules
COPY --from=builder --chown=blacktop:blacktop /app/package*.json ./

# Copy configuration files
COPY --chown=blacktop:blacktop apps/api/init-db*.js ./
COPY --chown=blacktop:blacktop .env.example ./

# Create necessary directories
RUN mkdir -p logs uploads && \
    chown -R blacktop:blacktop logs uploads

# Switch to non-root user
USER blacktop

# Expose ports
EXPOSE 3000 3333

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3333/health || exit 1

# Use tini as entrypoint for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Default command
CMD ["node", "dist/apps/api/main.js"]