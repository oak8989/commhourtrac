# Multi-stage build for VolunteerHub
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files for server
COPY server/package*.json ./server/

# Install server dependencies
RUN cd server && npm ci --only=production

# Copy built frontend
COPY --from=builder /app/dist ./dist

# Copy server code
COPY server ./server

# Set environment to production
ENV NODE_ENV=production

# Expose port
EXPOSE 3001

# Start the server
CMD ["node", "server/index.js"]
