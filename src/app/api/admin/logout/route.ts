import { NextRequest, NextResponse } from "next/server";
import { sameOrigin } from "@/lib/server/gateway";
import {
  SESSION_COOKIE,
  cookieOptions,
  revokeSession,
} from "@/lib/server/admin-auth";
export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return new NextResponse(null, { status: 403 });
  try {
    await revokeSession(request);
  } catch {
    return NextResponse.json(
      { error: "Deconectarea nu este disponibilă." },
      { status: 503 },
    );
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", { ...cookieOptions, maxAge: 0 });
  return response;
}
