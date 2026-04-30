import "dotenv/config";
import express from "express";
import cors from "cors";
import { useCases } from "./composition-root.js";
import { makeBooksController } from "./infrastructure/inbound/http/controllers/booksController.js";
import { makeBooksRouter } from "./infrastructure/inbound/http/routes.js";
import { startGrpcServer } from "./infrastructure/inbound/grpc/server.js";

const HTTP_PORT = Number(process.env.HTTP_PORT || 3003);
const GRPC_PORT = Number(process.env.GRPC_PORT || 50053);

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) =>
  res.json({ status: "Ok", service: "catalog-service" })
);

app.use("/api/books", makeBooksRouter(makeBooksController(useCases)));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

app.listen(HTTP_PORT, () => console.log(`HTTP server listening on ${HTTP_PORT}`));
startGrpcServer({ ...useCases, port: GRPC_PORT });
