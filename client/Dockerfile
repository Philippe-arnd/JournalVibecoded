# Build stage
FROM node:26.13.1-alpine@sha256:6bd9ab43c0ec0190ca7b2d193906cb8b7edf6e7f4afa43ddeccd6452710bffb5 AS builder
WORKDIR /app

# Add build arguments
ARG VITE_API_URL
ARG VITE_ENCRYPTION_KEY
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_ENCRYPTION_KEY=$VITE_ENCRYPTION_KEY
# OpenObserve RUM (public client token, baked into the browser bundle at build time)
ARG VITE_OO_RUM_TOKEN
ARG VITE_OO_APP_ID
ARG VITE_OO_SERVICE_NAME
ENV VITE_OO_RUM_TOKEN=$VITE_OO_RUM_TOKEN
ENV VITE_OO_APP_ID=$VITE_OO_APP_ID
ENV VITE_OO_SERVICE_NAME=$VITE_OO_SERVICE_NAME
# OpenLens (public capture key, baked into the browser bundle at build time)
ARG VITE_OPENLENS_HOST
ARG VITE_OPENLENS_KEY
ARG SOURCE_COMMIT
ENV VITE_OPENLENS_HOST=$VITE_OPENLENS_HOST
ENV VITE_OPENLENS_KEY=$VITE_OPENLENS_KEY
ENV SOURCE_COMMIT=$SOURCE_COMMIT

COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
RUN apk add --no-cache curl
COPY --from=builder /app/dist /usr/share/nginx/html
# Add custom nginx config if needed for SPA routing
RUN echo "server { \
    listen 80; \
    location /assets/ { \
        root /usr/share/nginx/html; \
        add_header Access-Control-Allow-Origin 'https://openobserve.philapps.com' always; \
        add_header Vary Origin always; \
    } \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files \$uri \$uri/ /index.html; \
    } \
}" > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

