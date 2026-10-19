# syntax=docker/dockerfile:1
# Reutilizado del proyecto base (BOLD) y adaptado a npm.

# --- Build: compila la SPA con Vite ---------------------------------------
# Imagen fijada por tag y digest; Dependabot abre un PR cuando sale uno nuevo.
FROM node:22-bookworm-slim@sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392 AS build
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
FROM nginxinc/nginx-unprivileged:1.30-alpine@sha256:f5116ed4606f3eb015dd4a8e28cb9b351476dc0ad4bc6e9f93b19cec130cdf03

COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY docker/nginx/security-headers.conf /etc/nginx/security-headers.conf
COPY --from=build /app/dist /usr/share/nginx/html

USER 101:101
EXPOSE 8080 8443

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
