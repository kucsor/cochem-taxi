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
      { error: "Autentificare necesară." },
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
    from > to ||
    Date.parse(to) - Date.parse(from) > 365 * 86400000 ||
    !["", "de", "en", "nl"].includes(language) ||
    !["", "mobile", "tablet", "desktop"].includes(device)
  )
    return NextResponse.json(
      { error: "Interval sau filtre incorecte; maximum 366 de zile." },
      { status: 400, headers },
    );
  try {
    return NextResponse.json(
      await gateway("stats", { from, to, language, device, environment }),
      { headers },
    );
  } catch {
    return NextResponse.json(
      { error: "Statisticile nu sunt disponibile momentan." },
      { status: 503, headers },
    );
  }
}
