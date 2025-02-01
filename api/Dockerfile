
FROM node:22.13-alpine 

WORKDIR /app 

COPY package*.json ./ 

RUN npm install 

# Install build dependencies for bcrypt
RUN apk add --no-cache python3 make g++ && npm install && apk del python3 make g++


COPY . . 

EXPOSE 4000 

CMD ["npx", "nodemon", "index.js"]
