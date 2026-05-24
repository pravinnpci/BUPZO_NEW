FROM node:18-alpine AS builder

WORKDIR /app/bupzofrontend

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:18-alpine

WORKDIR /app/bupzofrontend

COPY --from=builder /app/bupzofrontend/node_modules ./node_modules
COPY --from=builder /app/bupzofrontend/dist ./dist
COPY --from=builder /app/bupzofrontend/public ./public

EXPOSE 3000

CMD ["sh", "-c", "node dist/server.js"]