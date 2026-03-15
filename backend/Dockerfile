# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY backend/package*.json ./backend/

RUN npm install

COPY backend/ ./backend/

RUN npm run build -w backend

# Production stage
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV TSCONFIG_PATH=/app/backend/tsconfig.json

COPY package*.json ./
COPY backend/package*.json ./backend/

RUN npm install --omit=dev

COPY --from=builder /app/backend/dist ./backend/dist
COPY backend/tsconfig.json ./backend/tsconfig.json
COPY backend/tsconfig-paths-bootstrap.js ./backend/tsconfig-paths-bootstrap.js

RUN mkdir -p /app/uploads

EXPOSE ${PORT}

CMD ["node", "-r", "./backend/tsconfig-paths-bootstrap.js", "backend/dist/main.js"]
