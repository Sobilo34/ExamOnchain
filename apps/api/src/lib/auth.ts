import jwt from "jsonwebtoken";
import type { FastifyReply, FastifyRequest } from "fastify";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-insecure-secret";

export type AppRole = "STUDENT" | "LECTURER";
export type JwtPayload = { sub: string; role: AppRole };

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export async function requireAuth(req: FastifyRequest, reply: FastifyReply): Promise<JwtPayload> {
  const cookies = (req as FastifyRequest & { cookies?: Record<string, string | undefined> }).cookies;
  const raw = cookies?.token ?? req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!raw) {
    reply.code(401).send({ error: "Unauthorized" });
    throw new Error("Unauthorized");
  }
  try {
    return verifyToken(raw);
  } catch {
    reply.code(401).send({ error: "Invalid token" });
    throw new Error("Invalid token");
  }
}

export async function requireRole(req: FastifyRequest, reply: FastifyReply, role: AppRole): Promise<JwtPayload> {
  const p = await requireAuth(req, reply);
  if (p.role !== role) {
    reply.code(403).send({ error: "Forbidden" });
    throw new Error("Forbidden");
  }
  return p;
}
