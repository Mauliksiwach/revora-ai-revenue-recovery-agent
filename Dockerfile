# Multi-stage Docker build for Revora Monorepo
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace manifests
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install dependencies for both workspaces
RUN npm ci

# Copy entire codebase
COPY . .

# Build both backend (tsc) and frontend (vite)
RUN npm run build

# Production Runner Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy workspace package manifests
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install production dependencies only
RUN npm ci --omit=dev

# Copy compiled artifacts from builder stage
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/frontend/dist ./frontend/dist

EXPOSE 5000

# Start server serving both API and frontend SPA
CMD ["node", "backend/dist/index.js"]
