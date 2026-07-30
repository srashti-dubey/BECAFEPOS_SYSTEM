# syntax=docker/dockerfile:1

# ---- deps + build ----
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite inlines every VITE_-prefixed var into the built JS bundle at build time (see
# src/config/env.ts) — there is no runtime config step for a static build, so each of these
# must be supplied as a build arg for the target environment.
ARG VITE_APP_NAME=my-react-app
ARG VITE_API_BASE_URL=/api/v1
ARG VITE_API_KEY
ARG VITE_ENCRYPT_DECRYPT_KEY
ARG VITE_USE_MOCK_API=false
ENV VITE_APP_NAME=$VITE_APP_NAME \
    VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_API_KEY=$VITE_API_KEY \
    VITE_ENCRYPT_DECRYPT_KEY=$VITE_ENCRYPT_DECRYPT_KEY \
    VITE_USE_MOCK_API=$VITE_USE_MOCK_API

RUN npm run build

# ---- runtime ----
FROM nginx:1.27-alpine AS runtime

# Service workers only register on a secure context (HTTPS, or localhost) — this app is served
# over a plain LAN IP, so the browser never even exposes navigator.serviceWorker there, no matter
# how the workbox config is tuned (see the memory note on this). A self-signed cert is enough:
# isSecureContext only cares that the transport is actually TLS, not that the cert is CA-trusted —
# once a browser has been told to trust/bypass the warning for this host once, the service worker
# (and therefore offline-shell/navigateFallback) works normally. Generated fresh at build time
# (not committed) so the private key never sits in source control.
ARG SERVER_IP=10.3.33.31
RUN apk add --no-cache openssl && \
    mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 825 -newkey rsa:2048 \
      -keyout /etc/nginx/ssl/server.key \
      -out /etc/nginx/ssl/server.crt \
      -subj "/CN=${SERVER_IP}" \
      -addext "subjectAltName=IP:${SERVER_IP}"

# Template is envsubst'd by the nginx image entrypoint into /etc/nginx/conf.d/default.conf
# using API_UPSTREAM (see docker-compose environment). Listens on both 80 (unchanged, plain HTTP —
# nothing that already depends on the http:// URL breaks) and 443 ssl (new — visit the https://
# URL, accept the self-signed warning once, and the service worker can then actually install).
ENV API_UPSTREAM=http://10.3.33.31:3000
RUN mkdir -p /etc/nginx/templates && printf '%s\n' \
  'server {' \
  '    listen 80;' \
  '    listen 443 ssl;' \
  '    server_name _;' \
  '    root /usr/share/nginx/html;' \
  '    index index.html;' \
  '' \
  '    ssl_certificate /etc/nginx/ssl/server.crt;' \
  '    ssl_certificate_key /etc/nginx/ssl/server.key;' \
  '' \
  '    gzip on;' \
  '    gzip_vary on;' \
  '    gzip_min_length 1024;' \
  '    gzip_types text/plain text/css application/json application/javascript text/javascript' \
  '        application/xml text/xml image/svg+xml;' \
  '' \
  '    add_header X-Content-Type-Options "nosniff" always;' \
  '    add_header X-Frame-Options "SAMEORIGIN" always;' \
  '    add_header Referrer-Policy "strict-origin-when-cross-origin" always;' \
  '' \
  '    location /api/ {' \
  '        proxy_pass ${API_UPSTREAM}/api/;' \
  '        proxy_http_version 1.1;' \
  '        proxy_set_header Host $proxy_host;' \
  '        proxy_set_header X-Real-IP $remote_addr;' \
  '        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;' \
  '        proxy_set_header X-Forwarded-Proto $scheme;' \
  '        proxy_set_header Authorization $http_authorization;' \
  '        proxy_pass_header Set-Cookie;' \
  '    }' \
  '' \
  '    location /assets/ {' \
  '        expires 1y;' \
  '        add_header Cache-Control "public, immutable";' \
  '    }' \
  '' \
  '    location = /index.html {' \
  '        add_header Cache-Control "no-cache";' \
  '    }' \
  '' \
  '    location / {' \
  '        try_files $uri $uri/ /index.html;' \
  '    }' \
  '}' \
  > /etc/nginx/templates/default.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80 443
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
    CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
