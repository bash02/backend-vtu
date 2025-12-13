import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

export function signToken(
  payload: string | object | Buffer,
  expiresIn: string | number = "1d"
): string {
  return jwt.sign(payload, JWT_SECRET as jwt.Secret, {
    expiresIn: expiresIn as any,
  });
}

export function verifyToken(token: string): any {
  return jwt.verify(token, JWT_SECRET as string);
}
