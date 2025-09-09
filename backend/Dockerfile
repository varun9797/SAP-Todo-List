# Use Node.js LTS version
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for testing and linting)
RUN npm ci

# Copy source code and configuration files
COPY . .

# ===== QUALITY CHECKS STAGE =====
FROM base AS quality-checks

# Run type checking
RUN echo "🔍 Running TypeScript type checking..." && \
    npm run type-check

# Run linting
RUN echo "🧹 Running ESLint..." && \
    npm run lint

# Run tests
RUN echo "🧪 Running tests..." && \
    npm test

# ===== BUILD STAGE =====
FROM base AS builder

# Build the application (after quality checks pass)
RUN echo "🏗️ Building application..." && \
    npm run build

# ===== PRODUCTION STAGE =====
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["npm", "start"]
