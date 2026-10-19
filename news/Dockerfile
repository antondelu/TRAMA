# syntax=docker/dockerfile:1

# Performing-arts news service. Same base image as the contact API (Alpine,
# pinned by tag and digest, refreshed by hand; CI scans it with Trivy).
FROM node:22-alpine@sha256:0a7108bf6c7bf5de370ffb1a3ed6be93d405b43ff159f681a8d18c0e2bc2e402

ENV NODE_ENV=production \
    NEWS_DATA_DIR=/data \
    NEWS_SCHEDULER=on
WORKDIR /app

# npm is removed after installing, as in api/Dockerfile: never needed at runtime.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force \
  && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

COPY server.mjs ingest.mjs sources.json ./
COPY lib ./lib

# Stored news live in a volume. Creating the directory here, owned by the
# unprivileged user, makes a new named volume start with that ownership.
RUN mkdir /data && chown node:node /data
VOLUME /data
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.mjs"]
