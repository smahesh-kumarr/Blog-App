FROM node:18-alpine  # Using LTS version

WORKDIR /app

COPY package*.json ./

# Install build tools and dependencies
RUN apk add --no-cache python3 make g++ && \
    npm install --legacy-peer-deps

COPY . .

EXPOSE 5000

CMD ["npx", "nodemon", "index.js"]