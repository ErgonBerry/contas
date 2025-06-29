# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies + vite for preview
RUN npm ci --only=production && npm install vite

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy other necessary files
COPY --from=builder /app/vite.config.ts ./
COPY --from=builder /app/index.html ./

# Expose port
EXPOSE 4173

# Start the application
CMD ["sh", "-c", "npm run preview -- --host 0.0.0.0 --port 4173"]