# syntax=docker/dockerfile:1

# ---- deps + build ----
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json pnpm-lock.yaml ./
RUN if [ -f pnpm-lock.yaml ]; then \
      corepack enable pnpm && \
      corepack pnpm install --frozen-lockfile || corepack pnpm install --no-frozen-lockfile; \
    else \
      npm ci; \
    fi

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

RUN if [ -f pnpm-lock.yaml ]; then \
      corepack pnpm exec npm run build; \
    else \
      npm run build; \
    fi

# ---- runtime ----
FROM nginx:1.27-alpine AS runtime

# Template is envsubst'd by the nginx image entrypoint into /etc/nginx/conf.d/default.conf
# using API_UPSTREAM (see docker-compose environment).
ENV API_UPSTREAM=http://10.3.33.31:3000
RUN mkdir -p /etc/nginx/templates && printf '%s\n' \
  'server {' \
  '    listen 80;' \
  '    server_name _;' \
  '    root /usr/share/nginx/html;' \
  '    index index.html;' \
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

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
    CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
