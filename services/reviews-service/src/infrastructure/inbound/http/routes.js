import { Router } from "express";
import { requireAuth } from "@mybookstore/auth-middleware";

export const makeReviewsRouter = (controller) => {
  const router = Router();
  router.get("/book/:bookId", controller.list);
  router.post("/book/:bookId", requireAuth, controller.add);
  return router;
};
