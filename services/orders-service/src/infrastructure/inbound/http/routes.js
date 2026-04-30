import { Router } from "express";
import { requireAuth } from "@mybookstore/auth-middleware";

export const makeOrdersRouter = (controller) => {
  const router = Router();
  router.get("/", requireAuth, controller.list);
  router.post("/", requireAuth, controller.create);
  return router;
};
