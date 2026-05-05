FROM node:20-alpine

WORKDIR /app

COPY shared /app/shared
RUN npm install --omit=dev --prefix /app/shared/auth-middleware

COPY services/users-service/package*.json /app/services/users-service/
WORKDIR /app/services/users-service
RUN npm install --omit=dev --legacy-peer-deps

COPY services/users-service/src /app/services/users-service/src

ENV NODE_ENV=production
EXPOSE 3002 50052
CMD ["node", "src/server.js"]
