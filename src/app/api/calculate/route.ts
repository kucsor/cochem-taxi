import { NextRequest, NextResponse } from 'next/server';
import mbxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";
import mbxDirections from "@mapbox/mapbox-sdk/services/directions";
import { z } from "zod";
import {
  ANFAHRT_FEE_PERCENTAGE,
  COCHEM_CENTER_COORDS,
  COCHEM_POLYGON,
  PRICE_BUFFER,
  getBaseFee,
  getHaversineDistance,
  getRatePerKm,
  isNightTime,
  isPointInPolygon,
  routePassesThroughCochemZone,
} from "@/lib/fare";

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

// Initialize services lazily to prevent build-time errors
const getGeocodingService = () => mbxGeocoding({ accessToken: mapboxToken });
const getDirectionsService = () => mbxDirections({ accessToken: mapboxToken });

// Input validation schema
const calculateSchema = z.object({
  startAddress: z.string().min(1, "Start address is required").max(200, "Start address is too long"),
  endAddress: z.string().min(1, "End address is required").max(200, "End address is too long"),
  pickupTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  startLat: z.string().optional(),
  startLon: z.string().optional(),
  endLat: z.string().optional(),
  endLon: z.string().optional(),
  passengers: z.enum(["1-4", "5-8"]).optional().default("1-4"),
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

async function geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const response = await getGeocodingService().forwardGeocode({
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
    const response = await getDirectionsService().getDirections({
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

    const { startAddress, endAddress, pickupTime, startLat, startLon, endLat, endLon, errorMessages, passengers } = validationResult.data;

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

    // Select tariff based on passengers
    const isLarge = passengers === "5-8";
    const isNightTariff = isNightTime(pickupTime);
    const currentBaseFee = getBaseFee({ large: isLarge });
    const ratePerKm = getRatePerKm({ night: isNightTariff, large: isLarge });
    const mainPrice = (currentBaseFee + distance * ratePerKm);

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
        const anfahrtPriceFull = (currentBaseFee + anfahrtDistance * ratePerKm);
        anfahrtFee = anfahrtPriceFull * ANFAHRT_FEE_PERCENTAGE;
      }
    }
    
    const finalPrice = (mainPrice + anfahrtFee) * PRICE_BUFFER;

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
