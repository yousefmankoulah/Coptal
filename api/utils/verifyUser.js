import jwt from "jsonwebtoken";
import { errorHandler } from "./error.js";

export const verifyToken = async (req, res, next) => {
  let token = req.cookies.access_token || req.headers["authorization"];

  if (!token) {
    return next(errorHandler(401, "Unauthorized"));
  }

  // Check if the token includes the "Bearer " prefix and remove it if present
  if (token.startsWith("Bearer ")) {
    token = token.slice(7);
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    return next(errorHandler(401, "Unauthorized"));
  }
};
