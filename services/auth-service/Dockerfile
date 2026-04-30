FROM node:20-alpine

WORKDIR /app

COPY shared /app/shared

COPY services/auth-service/package*.json /app/services/auth-service/
WORKDIR /app/services/auth-service
RUN npm install --omit=dev --legacy-peer-deps

COPY services/auth-service/src /app/services/auth-service/src

ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "src/server.js"]
