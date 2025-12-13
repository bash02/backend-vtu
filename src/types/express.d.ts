// types/express.d.ts
import type { Request } from "express";

export interface AuthUser {
  id: string;
  // Add other properties if your middleware sets them (email, role, etc.)
}

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
  }
}
