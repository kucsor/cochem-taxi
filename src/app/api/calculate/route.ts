import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { airports } from "@/lib/airports";
import { allowRequest, sameOrigin } from "@/lib/server/gateway";
import {
  ANFAHRT_FEE_PERCENTAGE,
  COCHEM_CENTER_COORDS,
  COCHEM_POLYGON,
  PRICE_BUFFER,
  getHaversineDistance,
  getBaseFee,
  getRatePerKm,
  isNightTime,
  isPointInPolygon,
  routePassesThroughCochemZone,
} from "@/lib/fare";
const coordinate = (min: number, max: number) =>
  z
    .string()
    .optional()
    .transform((v) => (v === "" || v === undefined ? undefined : Number(v)))
    .pipe(z.number().finite().min(min).max(max).optional());
const schema = z.object({
  startAddress: z.string().trim().min(1).max(200),
  endAddress: z.string().trim().min(1).max(200),
  pickupTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  passengers: z.enum(["1-4", "5-8"]).default("1-4"),
  startLat: coordinate(-90, 90),
  startLon: coordinate(-180, 180),
  endLat: coordinate(-90, 90),
  endLon: coordinate(-180, 180),
  airportSlug: z
    .enum(["hahn", "frankfurt", "koeln-bonn", "duesseldorf", "luxemburg"])
    .optional(),
});
type Coords = { lat: number; lon: number };
const empty = {
  price: null,
  distance: null,
  message: null,
  geometry: null,
  hasAnfahrt: false,
  anfahrtFee: null,
};
function failure(code: string, status = 422) {
  return NextResponse.json({ ...empty, message: code, code }, { status });
}
async function mapbox(url: string) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) throw new Error("Map unavailable");
  const response = await fetch(
    `${url}${url.includes("?") ? "&" : "?"}access_token=${encodeURIComponent(token)}`,
    { signal: AbortSignal.timeout(12000), cache: "no-store" },
  );
  if (!response.ok) throw new Error("Map unavailable");
  return response.json();
}
async function geocode(address: string): Promise<Coords | null> {
  const exact = airports.find(
    (a) => a.address.toLowerCase() === address.toLowerCase(),
  );
  if (exact) return { lat: exact.lat, lon: exact.lon };
  const d = await mapbox(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?country=DE,LU&limit=1&proximity=7.1667,50.15`,
  );
  const center = d.features?.[0]?.center;
  return center ? { lon: center[0], lat: center[1] } : null;
}
async function route(a: Coords, b: Coords) {
  const d = await mapbox(
    `https://api.mapbox.com/directions/v5/mapbox/driving/${a.lon},${a.lat};${b.lon},${b.lat}?geometries=geojson&overview=full`,
  );
  return d.routes?.[0];
}
export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return failure("forbidden", 403);
  try {
    if (Number(request.headers.get("content-length") || 0) > 6000)
      return failure("validation", 413);
    if (!(await allowRequest(request, "calculator", 20)))
      return failure("rate_limited", 429);
    const raw = await request.text();
    if (raw.length > 6000) return failure("validation", 413);
    const parsed = schema.safeParse(JSON.parse(raw));
    if (!parsed.success) return failure("validation", 400);
    const p = parsed.data;
    const start =
      p.startLat !== undefined && p.startLon !== undefined
        ? { lat: p.startLat, lon: p.startLon }
        : await geocode(p.startAddress);
    const airport = airports.find((a) => a.slug === p.airportSlug);
    const end = airport
      ? { lat: airport.lat, lon: airport.lon }
      : p.endLat !== undefined && p.endLon !== undefined
        ? { lat: p.endLat, lon: p.endLon }
        : await geocode(p.endAddress);
    if (!start || !end)
      return failure(
        !start && !end
          ? "geocoding_both"
          : !start
            ? "geocoding_start"
            : "geocoding_end",
      );
    if (airports.some((a) => getHaversineDistance(start, a) < 1))
      return failure("cochem_only");
    if (
      (airport || airports.some((a) => getHaversineDistance(end, a) < 1)) &&
      !isPointInPolygon(start, COCHEM_POLYGON)
    )
      return failure("cochem_only");
    const main = await route(start, end);
    if (!main?.distance) return failure("routing");
    const distance = main.distance / 1000;
    const large = p.passengers === "5-8";
    const base = getBaseFee({ large });
    const rate = getRatePerKm({ large, night: isNightTime(p.pickupTime) });
    let fee = 0;
    if (
      !isPointInPolygon(start, COCHEM_POLYGON) &&
      !isPointInPolygon(end, COCHEM_POLYGON) &&
      !routePassesThroughCochemZone(main.geometry)
    ) {
      const approach = await route(COCHEM_CENTER_COORDS, start);
      if (!approach) return failure("routing");
      fee = (base + (approach.distance / 1000) * rate) * ANFAHRT_FEE_PERCENTAGE;
    }
    return NextResponse.json(
      {
        price: (base + distance * rate + fee) * PRICE_BUFFER,
        distance,
        duration: main.duration / 60,
        message: null,
        geometry: main.geometry,
        hasAnfahrt: fee > 0,
        anfahrtFee: fee > 0 ? fee * PRICE_BUFFER : null,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.warn("Calculator request failed", error instanceof Error ? error.name : "UnknownError");
    return failure("server_error", 503);
  }
}
