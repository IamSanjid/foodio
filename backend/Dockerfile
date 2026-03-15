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

COPY package*.json ./
COPY backend/package*.json ./backend/

RUN npm install --omit=dev

COPY --from=builder /app/backend/dist ./backend/dist

RUN mkdir -p /app/uploads

EXPOSE ${PORT}

CMD ["node", "-r", "tsconfig-paths/register", "backend/dist/main.js"]