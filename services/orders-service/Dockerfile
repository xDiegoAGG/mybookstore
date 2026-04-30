FROM node:20-alpine

WORKDIR /app

COPY shared /app/shared

COPY services/orders-service/package*.json /app/services/orders-service/
WORKDIR /app/services/orders-service
RUN npm install --omit=dev --legacy-peer-deps

COPY services/orders-service/src /app/services/orders-service/src

ENV NODE_ENV=production
EXPOSE 3006
CMD ["node", "src/server.js"]
