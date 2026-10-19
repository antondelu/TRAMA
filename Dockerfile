# syntax=docker/dockerfile:1
# Reutilizado del proyecto base (BOLD) y adaptado a npm.

# --- Build: compila la SPA con Vite ---------------------------------------
# Imagen fijada por tag y digest (ver api/Dockerfile para actualizarla).
FROM node:22-bookworm-slim@sha256:83f487e0a63425e5b4d146fb5e5be574bcbe1b7b843d3ebafdd95eaf7767a7e5 AS build
WORKDIR /app

# npm ci falla si package-lock.json falta o no coincide con package.json.
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

COPY . .
# VITE_API_URL vacío = modo demo. Pasalo como build-arg al conectar el backend.
ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# --- Runtime: nginx sin privilegios ---------------------------------------
FROM nginxinc/nginx-unprivileged:1.27-alpine@sha256:65e3e85dbaed8ba248841d9d58a899b6197106c23cb0ff1a132b7bfe0547e4c0

COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY docker/nginx/security-headers.conf /etc/nginx/security-headers.conf
COPY --from=build /app/dist /usr/share/nginx/html

USER 101:101
EXPOSE 8080 8443

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
