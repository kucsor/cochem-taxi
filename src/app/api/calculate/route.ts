import { NextRequest, NextResponse } from 'next/server';
import mbxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";
import mbxDirections from "@mapbox/mapbox-sdk/services/directions";
import { z } from "zod";

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
const geocodingService = mbxGeocoding({ accessToken: mapboxToken });
const directionsService = mbxDirections({ accessToken: mapboxToken });

// Tarif constants
const NIGHT_START_HOUR = 22;
const NIGHT_END_HOUR = 6;
const BASE_FEE = 4.1;
const RATE_PER_KM_DAY = 2.6;
const RATE_PER_KM_NIGHT = 2.8;
const ANFAHRT_FEE_PERCENTAGE = 0.40;

// Cochem central point
const COCHEM_CENTER_COORDS = { lat: 50.1475, lon: 7.1685 };

// Polygon defining the Cochem no-fee zone
const COCHEM_POLYGON: [number, number][] = [
  [7.1580, 50.1590], [7.1750, 50.1550], [7.1850, 50.1450],
  [7.1820, 50.1320], [7.1668, 50.1175], [7.1400, 50.1200],
  [7.1250, 50.1300], [7.1320, 50.1420], [7.1400, 50.1480], [7.1580, 50.1590]
];

// Input validation schema
const calculateSchema = z.object({
  startAddress: z.string().min(1, "Start address is required").max(200, "Start address is too long"),
  endAddress: z.string().min(1, "End address is required").max(200, "End address is too long"),
  pickupTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  startLat: z.string().optional(),
  startLon: z.string().optional(),
  endLat: z.string().optional(),
  endLon: z.string().optional(),
  errorMessages: z.record(z.string()).optional(),
});

type FareState = {
  price: number | null;
  distance: number | null;
  message: string | null;
  geometry: any | null;
  hasAnfahrt: boolean;
  anfahrtFee: number | null;
};

// Point-in-polygon algorithm
function isPointInPolygon(point: { lon: number, lat: number }, polygon: [number, number][]): boolean {
  const { lon: x, lat: y } = point;
  let isInside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) isInside = !isInside;
  }
  return isInside;
}

function routePassesThroughCochemZone(geometry: { type: string, coordinates: [number, number][] }): boolean {
  if (!geometry?.coordinates) return false;
  for (const coord of geometry.coordinates) {
    if (isPointInPolygon({ lon: coord[0], lat: coord[1] }, COCHEM_POLYGON)) return true;
  }
  return false;
}

function getHaversineDistance(coords1: { lat: number; lon: number }, coords2: { lat: number; lon: number }): number {
  const R = 6371;
  const dLat = (coords2.lat - coords1.lat) * (Math.PI / 180);
  const dLon = (coords2.lon - coords1.lon) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coords1.lat * (Math.PI / 180)) * Math.cos(coords2.lat * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const response = await geocodingService.forwardGeocode({
      query: address,
      limit: 1,
      countries: ['DE'],
      proximity: [7.1667, 50.15],
    }).send();

    if (response?.body?.features?.length > 0) {
      const [lon, lat] = response.body.features[0].center;
      return { lat, lon };
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

async function getRoute(startCoords: { lat: number; lon: number }, endCoords: { lat: number; lon: number }) {
  try {
    const response = await directionsService.getDirections({
      profile: 'driving',
      waypoints: [
        { coordinates: [startCoords.lon, startCoords.lat] },
        { coordinates: [endCoords.lon, endCoords.lat] }
      ],
      geometries: 'geojson',
      overview: 'full',
    }).send();

    if (response?.body?.routes?.length > 0) {
      const route = response.body.routes[0];
      return { distance: route.distance / 1000, geometry: route.geometry };
    }
    return null;
  } catch (error) {
    console.error("Directions error:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  // Security: Check Origin to prevent CSRF/Hotlinking
  const origin = request.headers.get('origin');
  if (origin) {
    const requestOrigin = new URL(request.url).origin;
    if (origin !== requestOrigin) {
      console.warn(`[Security] Blocked request from invalid origin: ${origin}`);
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
  }

  try {
    const body = await request.json();

    // Validate input
    const validationResult = calculateSchema.safeParse(body);

    const initialState: FareState = {
      price: null, distance: null, message: null, geometry: null, hasAnfahrt: false, anfahrtFee: null,
    };

    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues.map(i => i.message).join(", ");
      return NextResponse.json({ ...initialState, message: errorMessage });
    }

    const { startAddress, endAddress, pickupTime, startLat, startLon, endLat, endLon, errorMessages } = validationResult.data;

    let startCoords: { lat: number; lon: number } | null = null;
    if (startLat && startLon) {
      const lat = parseFloat(startLat);
      const lon = parseFloat(startLon);
      if (!isNaN(lat) && !isNaN(lon)) startCoords = { lat, lon };
    }
    if (!startCoords) startCoords = await geocodeAddress(startAddress);

    let endCoords: { lat: number; lon: number } | null = null;
    if (endLat && endLon) {
      const lat = parseFloat(endLat);
      const lon = parseFloat(endLon);
      if (!isNaN(lat) && !isNaN(lon)) endCoords = { lat, lon };
    }
    if (!endCoords) endCoords = await geocodeAddress(endAddress);

    if (!startCoords || !endCoords) {
      let message = errorMessages?.geocoding_both || "Addresses not found";
      if (!startCoords && !endCoords) message = errorMessages?.geocoding_both || "Both addresses not found";
      else if (!startCoords) message = errorMessages?.geocoding_start || "Start address not found";
      else message = errorMessages?.geocoding_end || "End address not found";
      return NextResponse.json({ ...initialState, message });
    }

    const mainRoute = await getRoute(startCoords, endCoords);
    if (!mainRoute?.distance) {
      return NextResponse.json({ ...initialState, message: errorMessages?.routing || "Route not found" });
    }

    const { distance, geometry } = mainRoute;
    const [hour] = pickupTime.split(":").map(Number);
    const isNightTariff = hour >= NIGHT_START_HOUR || hour < NIGHT_END_HOUR;
    const ratePerKm = isNightTariff ? RATE_PER_KM_NIGHT : RATE_PER_KM_DAY;
    const mainPrice = (BASE_FEE + distance * ratePerKm);

    let anfahrtFee = 0;
    let hasAnfahrt = false;
    
    const startIsInZone = isPointInPolygon(startCoords, COCHEM_POLYGON);
    const endIsInZone = isPointInPolygon(endCoords, COCHEM_POLYGON);
    const routeGoesThroughCochem = routePassesThroughCochemZone(geometry);

    if (!startIsInZone && !endIsInZone && !routeGoesThroughCochem) {
      hasAnfahrt = true;
      const distStartToCenter = getHaversineDistance(startCoords, COCHEM_CENTER_COORDS);
      const distEndToCenter = getHaversineDistance(endCoords, COCHEM_CENTER_COORDS);
      
      // Simplified anfahrt calculation - use haversine as estimate
      const anfahrtDistance = Math.min(distStartToCenter, distEndToCenter);
      if (anfahrtDistance > 0) {
        const anfahrtPriceFull = (BASE_FEE + anfahrtDistance * ratePerKm);
        anfahrtFee = anfahrtPriceFull * ANFAHRT_FEE_PERCENTAGE;
      }
    }
    
    const finalPrice = (mainPrice + anfahrtFee) * 1.1;

    return NextResponse.json({
      price: finalPrice,
      distance: distance,
      message: null,
      geometry: geometry,
      hasAnfahrt: hasAnfahrt,
      anfahrtFee: anfahrtFee > 0 ? anfahrtFee : null,
    });

  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { price: null, distance: null, message: "Server error", geometry: null, hasAnfahrt: false, anfahrtFee: null },
      { status: 500 }
    );
  }
}
