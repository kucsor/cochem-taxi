import "server-only";
import { gateway } from "./gateway";
import {
  createHmac,
  createHash,
  randomBytes,
  scrypt,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import type { NextRequest } from "next/server";
const derive = promisify(scrypt);
export const SESSION_COOKIE =
  process.env.NODE_ENV === "production"
    ? "__Host-cochem-admin"
    : "cochem-admin";
export const SESSION_SECONDS = 60 * 60 * 8;
export async function verifyPassword(password: string) {
  const encoded = process.env.ADMIN_PASSWORD_HASH;
  if (!encoded) return false;
  const [salt, expected] = encoded.split(":");
  if (!salt || !expected || expected.length !== 128) return false;
  const actual = (await derive(password, salt, 64)) as Buffer;
  return timingSafeEqual(actual, Buffer.from(expected, "hex"));
}
function signature(value: string) {
  const key = process.env.ADMIN_SESSION_SECRET;
  if (!key) throw new Error("Admin is not configured");
  return createHmac("sha256", key)
    .update(value)
    .update(process.env.ADMIN_PASSWORD_HASH || "")
    .digest("base64url");
}
export async function makeSession() {
  const payload = Buffer.from(
    JSON.stringify({
      exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS,
      nonce: randomBytes(24).toString("hex"),
    }),
  ).toString("base64url");
  const token = `${payload}.${signature(payload)}`;
  await gateway("session_create", {
    hash: createHash("sha256").update(token).digest("hex"),
  });
  return token;
}
export async function isAdmin(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE)?.value || "";
    const [payload, mac, extra] = token.split(".");
    if (!payload || !mac || extra) return false;
    const expected = signature(payload);
    if (
      mac.length !== expected.length ||
      !timingSafeEqual(Buffer.from(mac), Buffer.from(expected))
    )
      return false;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (
      !Number.isInteger(data.exp) ||
      data.exp <= Date.now() / 1000 ||
      data.exp > Date.now() / 1000 + SESSION_SECONDS
    )
      return false;
    return await gateway<boolean>("session_check", {
      hash: createHash("sha256").update(token).digest("hex"),
    });
  } catch {
    return false;
  }
}
export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: SESSION_SECONDS,
};

export async function revokeSession(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (token)
    await gateway("session_delete", {
      hash: createHash("sha256").update(token).digest("hex"),
    });
}
