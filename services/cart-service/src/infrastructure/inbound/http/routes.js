import { Router } from "express";
import { requireAuth } from "@mybookstore/auth-middleware";

export const makeCartRouter = (controller) => {
  const router = Router();
  router.get("/", requireAuth, controller.get);
  router.post("/items", requireAuth, controller.add);
  router.delete("/items/:bookId", requireAuth, controller.remove);
  return router;
};
