# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root configurations
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm install

# Copy frontend source
COPY frontend/ ./frontend/

# Build the frontend
RUN npm run build -w frontend

# Production stage
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

COPY --from=builder /app/frontend/public ./public
COPY --from=builder /app/frontend/.next/standalone/frontend ./
COPY --from=builder /app/frontend/.next/standalone/node_modules ./node_modules
COPY --from=builder /app/frontend/.next/static ./frontend/.next/static

EXPOSE ${PORT}

CMD ["node", "server.js"]
