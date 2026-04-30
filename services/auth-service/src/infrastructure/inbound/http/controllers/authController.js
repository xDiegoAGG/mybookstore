import { EmailAlreadyExistsError } from "../../../../domain/errors/EmailAlreadyExistsError.js";
import { InvalidCredentialsError } from "../../../../domain/errors/InvalidCredentialsError.js";

export const makeAuthController = ({ register, login, verifyToken }) => ({
  register: async (req, res, next) => {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({ message: "email and password are required" });
      }
      const cred = await register.execute({ email, password });
      res.status(201).json({ id: cred.id, email: cred.email });
    } catch (err) {
      if (err instanceof EmailAlreadyExistsError) {
        return res.status(409).json({ message: err.message });
      }
      next(err);
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({ message: "email and password are required" });
      }
      const result = await login.execute({ email, password });
      res.json(result);
    } catch (err) {
      if (err instanceof InvalidCredentialsError) {
        return res.status(401).json({ message: err.message });
      }
      next(err);
    }
  },

  verify: (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing token" });
    }
    try {
      const payload = verifyToken.execute(auth.slice(7));
      res.json(payload);
    } catch (err) {
      if (err instanceof InvalidCredentialsError) {
        return res.status(401).json({ message: "Invalid token" });
      }
      next(err);
    }
  },
});
