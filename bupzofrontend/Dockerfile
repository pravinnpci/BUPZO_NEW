FROM node:20-alpine AS builder

WORKDIR /app/bupzofrontend

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

FROM node:20-alpine

WORKDIR /app/bupzofrontend

COPY --from=builder /app/bupzofrontend/package*.json ./
COPY --from=builder /app/bupzofrontend/node_modules ./node_modules
COPY --from=builder /app/bupzofrontend/.next ./.next
COPY --from=builder /app/bupzofrontend/public ./public

EXPOSE 3003
ENV PORT=3003

CMD ["npm", "run", "start"]