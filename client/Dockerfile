# Stage 1: Build environment
FROM node:22.13-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build

# Stage 2: Production image
FROM node:22.13-alpine
WORKDIR /app
COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./
RUN npm ci --production
ENV NODE_ENV production
EXPOSE 3000
CMD ["npx", "serve", "-s", "build", "-l", "3000"]