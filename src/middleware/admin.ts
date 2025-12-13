import type { Request, Response, NextFunction } from "express";

export function admin(req: Request, res: Response, next: NextFunction) {
  // @ts-ignore
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ error: "Admin access required" });
  }
}
