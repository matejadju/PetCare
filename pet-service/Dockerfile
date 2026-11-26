FROM node:22-alpine AS build

WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json package-lock.json ./

RUN npm ci

COPY prisma ./prisma

RUN npx prisma generate

COPY src ./src
COPY openapi.yaml ./

# Runtime stage
FROM node:22-alpine AS runtime

WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV=production

COPY --from=build --chown=node:node /app /app

USER node

EXPOSE 8002

CMD ["node", "src/server.js"]