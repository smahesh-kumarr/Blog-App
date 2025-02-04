FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN apk add --no-cache python3 make g++ && \
    npm install --legacy-peer-deps

COPY . .

EXPOSE 4000

CMD ["npx", "nodemon", "index.js"]