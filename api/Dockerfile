# syntax=docker/dockerfile:1

# Contact-form API. Same pinned Node base image as the site's build stage
# (see ../Dockerfile for how to refresh the digest).
FROM node:22-bookworm-slim@sha256:83f487e0a63425e5b4d146fb5e5be574bcbe1b7b843d3ebafdd95eaf7767a7e5

ENV NODE_ENV=production
WORKDIR /app

# npm ci refuses to install if package-lock.json is missing or out of sync.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY server.mjs ./

# The base image ships an unprivileged "node" user.
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.mjs"]
