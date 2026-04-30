import { Router } from "express";

export const makeAuthRouter = (controller) => {
  const router = Router();
  router.post("/register", controller.register);
  router.post("/login", controller.login);
  router.get("/verify", controller.verify);
  return router;
};
