import jwt from "jsonwebtoken";

export const requireAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing token" });
  }
  try {
    const secret = process.env.JWT_SECRET || "dev-secret";
    req.user = jwt.verify(auth.slice(7), secret);
    next();
  } catch (_err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
