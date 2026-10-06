import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/server/admin-auth";
import { gateway } from "@/lib/server/gateway";
export async function GET(request: NextRequest) {
  const headers = {
    "Cache-Control": "no-store, private",
    "X-Robots-Tag": "noindex, nofollow",
  };
  if (!(await isAdmin(request)))
    return NextResponse.json(
      { error: "Sign in required." },
      { status: 401, headers },
    );
  const p = request.nextUrl.searchParams;
  const from =
    p.get("from") ||
    new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10);
  const to = p.get("to") || new Date().toISOString().slice(0, 10);
  const language = p.get("language") || "";
  const device = p.get("device") || "";
  const environment = p.get("environment") || "production";
  if (
    !["production", "preview", "development"].includes(environment) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(from) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(to) ||
    !Number.isFinite(Date.parse(from)) ||
    !Number.isFinite(Date.parse(to)) ||
    new Date(from).toISOString().slice(0, 10) !== from ||
    new Date(to).toISOString().slice(0, 10) !== to ||
    from > to ||
    Date.parse(to) - Date.parse(from) > 730 * 86400000 ||
    !["", "de", "en", "nl"].includes(language) ||
    !["", "mobile", "tablet", "desktop"].includes(device)
  )
    return NextResponse.json(
      { error: "Invalid filters; select no more than 731 days." },
      { status: 400, headers },
    );
  try {
    return NextResponse.json(
      await gateway("insights", { from, to, language, device, environment }),
      { headers },
    );
  } catch {
    return NextResponse.json(
      { error: "Statistics are temporarily unavailable." },
      { status: 503, headers },
    );
  }
}
