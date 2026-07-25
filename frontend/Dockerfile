# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency manifests first for layer caching
COPY package.json package-lock.json* ./
RUN npm install --frozen-lockfile

# Copy source and build
COPY . .

ARG VITE_AUTH_API_URL
ARG VITE_USER_API_URL
ARG VITE_MEETING_API_URL
ARG VITE_LIVEKIT_URL

ENV VITE_AUTH_API_URL=$VITE_AUTH_API_URL
ENV VITE_USER_API_URL=$VITE_USER_API_URL
ENV VITE_MEETING_API_URL=$VITE_MEETING_API_URL
ENV VITE_LIVEKIT_URL=$VITE_LIVEKIT_URL

RUN npm run build

# ─── Stage 2: Serve ───────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS serve

# Remove default nginx index page
RUN rm -rf /usr/share/nginx/html/*

# Copy build output from Stage 1
COPY --from=build /app/dist /usr/share/nginx/html

# nginx config for SPA — all unknown paths fall back to index.html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
