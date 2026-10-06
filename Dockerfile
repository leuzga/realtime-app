# syntax=docker/dockerfile:1.7
# Single multi-stage Dockerfile for the whole monorepo.
# Targets: backend-dev | backend | frontend-dev | frontend
ARG NODE_IMAGE=node:22-alpine
ARG NODE_IMAGE_DEBIAN=node:22

# ───────────────────────── backend ─────────────────────────
FROM ${NODE_IMAGE} AS backend-deps
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
RUN npm ci

FROM backend-deps AS backend-dev
COPY backend/src ./src
COPY backend/tsconfig.json backend/tsconfig.build.json ./
EXPOSE 4000
CMD ["npm", "run", "dev"]

FROM backend-dev AS backend-build
RUN npm run build && npm prune --omit=dev

FROM ${NODE_IMAGE} AS backend
ENV NODE_ENV=production
WORKDIR /app
COPY --from=backend-build /app/package.json ./
COPY --from=backend-build /app/node_modules ./node_modules
COPY --from=backend-build /app/dist ./dist
USER node
EXPOSE 4000
HEALTHCHECK --interval=5s --timeout=3s --retries=10 \
  CMD wget -qO- http://127.0.0.1:4000/health || exit 1
CMD ["node", "dist/main.js"]

# ───────────────────────── frontend ─────────────────────────
FROM ${NODE_IMAGE} AS frontend-deps
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

FROM ${NODE_IMAGE_DEBIAN} AS frontend-dev
RUN apt-get update && apt-get install -y \
  xvfb \
  libgconf-2-4 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libgdk-pixbuf2.0-0 \
  libgtk-3-0 \
  libgbm1 \
  libnss3 \
  libxss1 \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/src ./src
COPY frontend/cypress ./cypress
COPY frontend/index.html frontend/vite.config.ts frontend/tsconfig.json frontend/cypress.config.ts ./
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM frontend-dev AS frontend-build
RUN npm run build

FROM nginx:1.27-alpine AS frontend
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=frontend-build /app/dist /usr/share/nginx/html
EXPOSE 3000
