import "dotenv/config";
import express from "express";
import cors from "cors";
import { useCases } from "./composition-root.js";
import { makeReviewsController } from "./infrastructure/inbound/http/controllers/reviewsController.js";
import { makeReviewsRouter } from "./infrastructure/inbound/http/routes.js";

const HTTP_PORT = Number(process.env.HTTP_PORT || 3004);

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) =>
  res.json({ status: "Ok", service: "reviews-service" })
);

app.use("/api/reviews", makeReviewsRouter(makeReviewsController(useCases)));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

app.listen(HTTP_PORT, () => console.log(`HTTP server listening on ${HTTP_PORT}`));
