# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage - serve with nginx
FROM nginx:alpine AS production

# Copy custom nginx config as template
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Default port (Railway will override via PORT env var)
ENV PORT=80
EXPOSE 80

# nginx:alpine auto-processes templates in /etc/nginx/templates/ using envsubst
CMD ["nginx", "-g", "daemon off;"]
