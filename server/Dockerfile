FROM node:22-alpine

WORKDIR /app

COPY package.json .

RUN pnpm install

COPY . .

CMD ["node", "server.js"]