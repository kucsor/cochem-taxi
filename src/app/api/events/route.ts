import { NextRequest, NextResponse } from "next/server";
import { eventSchema } from "@/lib/event-schema";
import { gateway, allowRequest, sameOrigin } from "@/lib/server/gateway";
export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return new NextResponse(null, { status: 403 });
  if (Number(request.headers.get("content-length") || 0) > 2048)
    return new NextResponse(null, { status: 413 });
  if (
    /bot|crawler|spider|headless/i.test(request.headers.get("user-agent") || "")
  )
    return new NextResponse(null, { status: 204 });
  try {
    const body = await request.text();
    if (body.length > 2048) return new NextResponse(null, { status: 413 });
    const parsed = eventSchema.safeParse(JSON.parse(body));
    if (!parsed.success) return new NextResponse(null, { status: 400 });
    if (!(await allowRequest(request, "events", 120)))
      return new NextResponse(null, { status: 429 });
    const { id, name, path, visit, referrer, device, source, value, outcome } =
      parsed.data;
    await gateway("event", {
      environment: process.env.VERCEL_ENV || "development",
      id,
      name,
      path,
      visit,
      referrer,
      device,
      source,
      value,
      outcome,
      language: path.split("/")[1],
    });
    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}
