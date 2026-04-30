import "dotenv/config";
import express from "express";
import cors from "cors";
import { useCases, bootstrap } from "./composition-root.js";
import { makeUsersController } from "./infrastructure/inbound/http/controllers/usersController.js";
import { makeUsersRouter } from "./infrastructure/inbound/http/routes.js";
import { startGrpcServer } from "./infrastructure/inbound/grpc/server.js";

const HTTP_PORT = Number(process.env.HTTP_PORT || 3002);
const GRPC_PORT = Number(process.env.GRPC_PORT || 50052);

async function start() {
  await bootstrap();

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) =>
    res.json({ status: "Ok", service: "users-service" })
  );

  app.use("/api/users", makeUsersRouter(makeUsersController(useCases)));

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
  });

  app.listen(HTTP_PORT, () => console.log(`HTTP server listening on ${HTTP_PORT}`));
  startGrpcServer({ ...useCases, port: GRPC_PORT });
}

start().catch((err) => {
  console.error("Failed to start users-service", err);
  process.exit(1);
});
