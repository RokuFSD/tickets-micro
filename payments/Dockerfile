FROM node:alpine
RUN npm install -g pnpm

WORKDIR /app
COPY package.json ./
RUN pnpm install --prod
COPY ./ ./

CMD ["pnpm", "start"]
