// types/express.d.ts or global.d.ts (recommended name: express.d.ts)

import type { JwtPayload } from "../utils/jwt"; // your JWT token payload type

// Combine your own user props with JwtPayload (if JwtPayload doesn't have all you want)
export interface AuthUser extends JwtPayload {
  id: string;
  role?: string;
  email?: string;
  // Add any other properties your token contains
}

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
  }
}
