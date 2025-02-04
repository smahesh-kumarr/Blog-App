FROM node:22.13-alpine

WORKDIR /app

COPY package*.json ./

# Install build dependencies and bcrypt requirements
RUN apk add --no-cache --virtual .build-deps \
    python3 \
    make \
    g++ \
    && npm install \
    && apk del .build-deps

COPY . .

EXPOSE 4000

CMD ["npx", "nodemon", "index.js"]