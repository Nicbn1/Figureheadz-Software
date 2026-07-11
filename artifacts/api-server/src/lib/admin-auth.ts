import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request, Response, NextFunction } from "express";

const secret = process.env["SESSION_SECRET"] ?? "figureheadz-dev-secret";
const TOKEN_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

function sign(payload: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function issueAdminToken(): string {
  const expires = Date.now() + TOKEN_TTL_MS;
  const payload = `admin.${expires}`;
  const signature = sign(payload);
  return Buffer.from(`${payload}.${signature}`).toString("base64url");
}

function verifyAdminToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const lastDot = decoded.lastIndexOf(".");
    const payload = decoded.slice(0, lastDot);
    const signature = decoded.slice(lastDot + 1);
    const expected = sign(payload);

    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expected);
    if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
      return false;
    }

    const [, expiresRaw] = payload.split(".");
    const expires = Number(expiresRaw);
    return Number.isFinite(expires) && Date.now() < expires;
  } catch {
    return false;
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;

  if (!token || !verifyAdminToken(token)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  next();
}

export function checkAdminPassword(password: string): boolean {
  const expected = process.env["ADMIN_PASSWORD"] ?? "figureheadz2026";
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
