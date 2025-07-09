FROM node:18-slim

RUN apt-get update && apt-get install -y openssl

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 3000

CMD [ "node", "src/index.js" ]