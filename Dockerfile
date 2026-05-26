# Stage 1: Builder
FROM node:20-alpine as builder

ARG NEXT_PUBLIC_BASE_PATH
ARG NEXT_PUBLIC_PORT

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm ci --omit=dev --legacy-peer-deps

COPY . .
RUN npm run build

# Stage 2: Runner
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

ENV PORT 3000

CMD ["npm", "run", "start"]