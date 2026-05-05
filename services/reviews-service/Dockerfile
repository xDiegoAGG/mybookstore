FROM node:20-alpine

WORKDIR /app

COPY shared /app/shared
RUN npm install --omit=dev --prefix /app/shared/auth-middleware

COPY services/reviews-service/package*.json /app/services/reviews-service/
WORKDIR /app/services/reviews-service
RUN npm install --omit=dev --legacy-peer-deps

COPY services/reviews-service/src /app/services/reviews-service/src

ENV NODE_ENV=production
EXPOSE 3004
CMD ["node", "src/server.js"]
