# Build stage
FROM node:24.16.0-alpine@sha256:fb71d01345f11b708a3553c66e7c74074f2d506400ea81973343d915cb64eef0 AS builder
WORKDIR /app

# Add build arguments
ARG VITE_API_URL
ARG VITE_ENCRYPTION_KEY
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_ENCRYPTION_KEY=$VITE_ENCRYPTION_KEY

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
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files \$uri \$uri/ /index.html; \
    } \
}" > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

