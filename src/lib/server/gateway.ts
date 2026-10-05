import "server-only";
import { createHmac } from "node:crypto";
import type { NextRequest } from "next/server";

export async function gateway<T = unknown>(
  action: string,
  payload: unknown,
): Promise<T> {
  const url = process.env.ANALYTICS_GATEWAY_URL;
  const secret = process.env.ANALYTICS_GATEWAY_SECRET;
  if (!url || !secret) throw new Error("Analytics is not configured");
  const response = await fetch(url, {
    method: "POST",
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
    headers: {
      "Content-Type": "application/json",
      "x-analytics-secret": secret,
    },
    body: JSON.stringify({ action, payload }),
  });
  if (!response.ok) throw new Error("Analytics service unavailable");
  return response.json() as Promise<T>;
}
export function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return (
      new URL(origin).origin ===
      `${request.nextUrl.protocol}//${request.headers.get("host")}`
    );
  } catch {
    return false;
  }
}
export function clientKey(request: NextRequest, purpose: string) {
  const ip =
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    (process.env.NODE_ENV !== "production"
      ? "development"
      : request.headers.get("x-real-ip")) ||
    "unknown";
  const secret = process.env.ANALYTICS_GATEWAY_SECRET;
  if (!secret) throw new Error("Analytics is not configured");
  return createHmac("sha256", secret)
    .update(`${purpose}:${new Date().toISOString().slice(0, 10)}:${ip}`)
    .digest("hex");
}
export async function allowRequest(
  request: NextRequest,
  purpose: string,
  limit: number,
  seconds = 60,
) {
  return gateway<boolean>("rate", {
    key: clientKey(request, purpose),
    limit,
    seconds,
  });
}
