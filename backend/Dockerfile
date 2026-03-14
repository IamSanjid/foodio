# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root configurations
COPY package*.json ./
# Copy workspace member configuration
COPY backend/package*.json ./backend/

# Install dependencies for the whole workspace (or just backend)
RUN npm install

# Copy backend source
COPY backend/ ./backend/
# Copy shared scripts/assets if any from root (optional, but good for context)

# Build the backend
RUN npm run build -w backend

# Production stage
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm install --only=production

COPY --from=builder /app/backend/dist ./dist

EXPOSE ${PORT}

CMD ["node", "dist/main"]
