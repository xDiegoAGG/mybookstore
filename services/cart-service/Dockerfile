FROM node:20-alpine

WORKDIR /app

COPY shared /app/shared

COPY services/cart-service/package*.json /app/services/cart-service/
WORKDIR /app/services/cart-service
RUN npm install --omit=dev --legacy-peer-deps

COPY services/cart-service/src /app/services/cart-service/src

ENV NODE_ENV=production
EXPOSE 3005 50055
CMD ["node", "src/server.js"]
