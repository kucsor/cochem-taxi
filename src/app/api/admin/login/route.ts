import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { allowRequest, sameOrigin } from "@/lib/server/gateway";
import {
  verifyPassword,
  makeSession,
  SESSION_COOKIE,
  cookieOptions,
} from "@/lib/server/admin-auth";
export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return new NextResponse(null, { status: 403 });
  if (Number(request.headers.get("content-length") || 0) > 2048)
    return new NextResponse(null, { status: 413 });
  try {
    if (!(await allowRequest(request, "login", 5, 900)))
      return NextResponse.json(
        { error: "Too many attempts. Please try again in 15 minutes." },
        { status: 429 },
      );
    const parsed = z
      .object({
        username: z.string().max(64),
        password: z.string().min(1).max(256),
      })
      .safeParse(await request.json());
    if (!parsed.success)
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 },
      );
    const valid = await verifyPassword(parsed.data.password);
    if (
      !valid ||
      parsed.data.username !== (process.env.ADMIN_USERNAME || "kuxor")
    )
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 },
      );
    const response = NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
    response.cookies.set(SESSION_COOKIE, await makeSession(), cookieOptions);
    return response;
  } catch {
    return NextResponse.json(
      { error: "Sign-in is temporarily unavailable." },
      { status: 503 },
    );
  }
}
