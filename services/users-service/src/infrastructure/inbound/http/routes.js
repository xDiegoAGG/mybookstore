import { Router } from "express";
import { requireAuth } from "@mybookstore/auth-middleware";

export const makeUsersRouter = (controller) => {
  const router = Router();
  router.get("/me", requireAuth, controller.me);
  router.put("/me", requireAuth, controller.updateMe);
  return router;
};
