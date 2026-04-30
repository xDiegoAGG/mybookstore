import "dotenv/config";
import express from "express";
import cors from "cors";
import { useCases } from "./composition-root.js";
import { makeCartController } from "./infrastructure/inbound/http/controllers/cartController.js";
import { makeCartRouter } from "./infrastructure/inbound/http/routes.js";
import { startGrpcServer } from "./infrastructure/inbound/grpc/server.js";

const HTTP_PORT = Number(process.env.HTTP_PORT || 3005);
const GRPC_PORT = Number(process.env.GRPC_PORT || 50055);

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) =>
  res.json({ status: "Ok", service: "cart-service" })
);

app.use("/api/cart", makeCartRouter(makeCartController(useCases)));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

app.listen(HTTP_PORT, () => console.log(`HTTP server listening on ${HTTP_PORT}`));
startGrpcServer({ ...useCases, port: GRPC_PORT });
