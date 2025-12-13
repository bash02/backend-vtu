import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

export function auth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, error: "No token, authorization denied" });
  }
  const token = authHeader.split(" ")[1] as string;
  try {
    const decoded = verifyToken(token);
    // @ts-ignore
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Token is not valid" });
  }
}
