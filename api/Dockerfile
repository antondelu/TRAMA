# syntax=docker/dockerfile:1

# Contact-form API. Alpine (no perl or other Debian extras) on the same Node
# major as the site's build stage. Pinned by tag and digest and refreshed by
# hand; CI scans the result with Trivy every week and on every PR.
FROM node:22-alpine@sha256:0a7108bf6c7bf5de370ffb1a3ed6be93d405b43ff159f681a8d18c0e2bc2e402

ENV NODE_ENV=production
WORKDIR /app

# npm ci refuses to install if package-lock.json is missing or out of sync.
# npm itself is removed afterwards: the server never needs it at runtime, and
# the copy bundled in the base image is where most of its CVEs come from.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force \
  && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

COPY server.mjs ./

# The base image ships an unprivileged "node" user.
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.mjs"]
