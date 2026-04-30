import "dotenv/config";
import express from "express";
import cors from "cors";
import { useCases, bootstrap } from "./composition-root.js";
import { makeAuthController } from "./infrastructure/inbound/http/controllers/authController.js";
import { makeAuthRouter } from "./infrastructure/inbound/http/routes.js";

const HTTP_PORT = Number(process.env.HTTP_PORT || 3001);

async function start() {
  await bootstrap();

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) =>
    res.json({ status: "Ok", service: "auth-service" })
  );

  app.use("/api/auth", makeAuthRouter(makeAuthController(useCases)));

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
  });

  app.listen(HTTP_PORT, () => console.log(`HTTP server listening on ${HTTP_PORT}`));
}

start().catch((err) => {
  console.error("Failed to start auth-service", err);
  process.exit(1);
});
