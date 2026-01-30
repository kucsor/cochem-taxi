
"use server";

import mbxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";
import mbxDirections from "@mapbox/mapbox-sdk/services/directions";

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
const geocodingService = mbxGeocoding({ accessToken: mapboxToken });
const directionsService = mbxDirections({ accessToken: mapboxToken });

// Tarif constants
const NIGHT_START_HOUR = 22;
const NIGHT_END_HOUR = 6;
const BASE_FEE = 4.1;
const RATE_PER_KM_DAY = 2.6;
const RATE_PER_KM_NIGHT = 2.8;
const ANFAHRT_FEE_PERCENTAGE = 0.40; // 40%

// Cochem central point for Anfahrt calculation: Pater-Martin-Straße, 56812 Cochem
const COCHEM_CENTER_COORDS = { lat: 50.1475, lon: 7.1685 };

// Polygon defining the Cochem no-fee zone. Coordinates are [lon, lat].
const COCHEM_POLYGON: [number, number][] = [
  [7.1580, 50.1590],
  [7.1750, 50.1550],
  [7.1850, 50.1450],
  [7.1820, 50.1320],
  [7.1668, 50.1175],
  [7.1400, 50.1200],
  [7.1250, 50.1300],
  [7.1320, 50.1420],
  [7.1400, 50.1480],
  [7.1580, 50.1590]
];

type FareState = {
  price: number | null;
  distance: number | null;
  message: string | null;
  geometry: any | null;
  hasAnfahrt: boolean;
  anfahrtFee: number | null;
};

// Point-in-polygon (ray-casting) algorithm
function isPointInPolygon(point: { lon: number, lat: number }, polygon: [number, number][]): boolean {
  const { lon: x, lat: y } = point;
  let isInside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0], yi = polygon[i][1];
      const xj = polygon[j][0], yj = polygon[j][1];

      const intersect = ((yi > y) !== (yj > y))
          && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

      if (intersect) {
          isInside = !isInside;
      }
  }
  return isInside;
}

// Helper function to check if any point of the route geometry passes through the Cochem zone
function routePassesThroughCochemZone(geometry: { type: string, coordinates: [number, number][] }): boolean {
  if (!geometry || !geometry.coordinates) {
    return false;
  }
  
  for (const coord of geometry.coordinates) {
    const point = { lon: coord[0], lat: coord[1] };
    if (isPointInPolygon(point, COCHEM_POLYGON)) {
      return true; // The route passes through the zone
    }
  }

  return false; // The route does not pass through the zone
}

// Haversine formula to calculate straight-line distance between two lat/lon points
function getHaversineDistance(
  coords1: { lat: number; lon: number },
  coords2: { lat: number; lon: number }
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (coords2.lat - coords1.lat) * (Math.PI / 180);
  const dLon = (coords2.lon - coords1.lon) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coords1.lat * (Math.PI / 180)) *
      Math.cos(coords2.lat * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

async function geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const response = await geocodingService.forwardGeocode({
      query: address,
      limit: 1,
      countries: ['DE'],
      proximity: [7.1667, 50.15], // Proximity to Cochem
    }).send();

    if (response && response.body && response.body.features && response.body.features.length > 0) {
      const [lon, lat] = response.body.features[0].center;
      return { lat, lon };
    }
    return null;
  } catch (error) {
    console.error("Mapbox geocoding error:", error);
    return null;
  }
}

async function getRoute(
  startCoords: { lat: number; lon: number },
  endCoords: { lat: number; lon: number }
): Promise<{ distance: number; geometry: any } | null> {
  try {
    const response = await directionsService.getDirections({
      profile: 'driving',
      waypoints: [
        { coordinates: [startCoords.lon, startCoords.lat] },
        { coordinates: [endCoords.lon, endCoords.lat] }
      ],
      geometries: 'geojson',
      overview: 'full', // Request the full, detailed geometry
    }).send();

    if (response && response.body && response.body.routes && response.body.routes.length > 0) {
      const route = response.body.routes[0];
      return {
        distance: route.distance / 1000, // Convert to KM
        geometry: route.geometry
      };
    }
    return null;
  } catch (error) {
    console.error("Mapbox directions error:", error);
    return null;
  }
}

// Helper function to find the shortest DRIVING route from any polygon vertex to a target point
async function findShortestDrivingRouteFromPolygon(
  targetCoords: { lat: number; lon: number },
  polygon: [number, number][]
): Promise<{ distance: number; geometry: any } | null> {
  let shortestRoute: { distance: number; geometry: any } | null = null;
  let minDistance = Infinity;

  // Create a promise for each route calculation from each vertex
  const routePromises = polygon.map(vertex => {
    const vertexCoords = { lat: vertex[1], lon: vertex[0] }; // Polygon is [lon, lat]
    return getRoute(vertexCoords, targetCoords);
  });

  // Await all route calculations to run in parallel
  const routes = await Promise.all(routePromises);

  // Find the shortest route among the results
  for (const route of routes) {
    if (route && route.distance < minDistance) {
      minDistance = route.distance;
      shortestRoute = route;
    }
  }

  return shortestRoute;
}


export async function calculateFare(
  errorMessages: Record<string, string>,
  prevState: FareState,
  formData: FormData
): Promise<FareState> {
  const startAddress = formData.get("startAddress") as string;
  const endAddress = formData.get("endAddress") as string;
  const pickupTime = formData.get("pickupTime") as string;
  const startLatStr = formData.get("startLat") as string;
  const startLonStr = formData.get("startLon") as string;
  const endLatStr = formData.get("endLat") as string;
  const endLonStr = formData.get("endLon") as string;

  const initialState: FareState = {
    price: null,
    distance: null,
    message: null,
    geometry: null,
    hasAnfahrt: false,
    anfahrtFee: null,
  };

  if (!startAddress || !endAddress || !pickupTime) {
    return {
      ...initialState,
      message: errorMessages.missing_input,
    };
  }

  try {
    let startCoords: { lat: number; lon: number } | null = null;
    if (startLatStr && startLonStr) {
      const lat = parseFloat(startLatStr);
      const lon = parseFloat(startLonStr);
      if (!isNaN(lat) && !isNaN(lon)) {
        startCoords = { lat, lon };
      }
    }
    if (!startCoords) {
      startCoords = await geocodeAddress(startAddress);
    }
      
    let endCoords: { lat: number; lon: number } | null = null;
    if (endLatStr && endLonStr) {
        const lat = parseFloat(endLatStr);
        const lon = parseFloat(endLonStr);
        if (!isNaN(lat) && !isNaN(lon)) {
            endCoords = { lat, lon };
        }
    }
    if (!endCoords) {
        endCoords = await geocodeAddress(endAddress);
    }


    if (!startCoords || !endCoords) {
      let message = "";
      if (!startCoords && !endCoords) {
          message = errorMessages.geocoding_both;
      } else if (!startCoords) {
          message = errorMessages.geocoding_start;
      } else {
          message = errorMessages.geocoding_end;
      }
      return { ...initialState, message };
    }

    const mainRoute = await getRoute(startCoords, endCoords);

    if (mainRoute === null || mainRoute.distance === null) {
      return {
        ...initialState,
        message: errorMessages.routing,
      };
    }

    const { distance, geometry } = mainRoute;

    const [hour] = pickupTime.split(":").map(Number);
    const isNightTariff = hour >= NIGHT_START_HOUR || hour < NIGHT_END_HOUR;
    const ratePerKm = isNightTariff ? RATE_PER_KM_NIGHT : RATE_PER_KM_DAY;
    
    // Calculate main trip price
    const mainPrice = (BASE_FEE + distance * ratePerKm);

    let anfahrtFee = 0;
    let hasAnfahrt = false;
    
    const startIsInZone = isPointInPolygon(startCoords, COCHEM_POLYGON);
    const endIsInZone = isPointInPolygon(endCoords, COCHEM_POLYGON);
    const routeGoesThroughCochem = routePassesThroughCochemZone(geometry);

    // Calculate Anfahrt fee ONLY IF start and end are outside the zone, AND the route does not pass through the zone.
    if (!startIsInZone && !endIsInZone && !routeGoesThroughCochem) {
      hasAnfahrt = true;
      
      // Determine which point (start or end) is closer to Cochem center (by straight line, this is fast)
      const distStartToCenter = getHaversineDistance(startCoords, COCHEM_CENTER_COORDS);
      const distEndToCenter = getHaversineDistance(endCoords, COCHEM_CENTER_COORDS);
      
      const anfahrtTargetCoords = distStartToCenter < distEndToCenter ? startCoords : endCoords;

      // Find the shortest DRIVING route from any polygon vertex to the target
      const anfahrtRoute = await findShortestDrivingRouteFromPolygon(anfahrtTargetCoords, COCHEM_POLYGON);
      
      if (anfahrtRoute && anfahrtRoute.distance) {
        const anfahrtPriceFull = (BASE_FEE + anfahrtRoute.distance * ratePerKm);
        anfahrtFee = anfahrtPriceFull * ANFAHRT_FEE_PERCENTAGE;
      } else {
         // Optionally handle error if Anfahrt route can't be calculated
         console.warn("Could not calculate Anfahrt route.");
      }
    }
    
    // Final price with a 10% buffer applied to the total
    const finalPrice = (mainPrice + anfahrtFee) * 1.1;

    return {
      price: finalPrice,
      distance: distance,
      message: null,
      geometry: geometry,
      hasAnfahrt: hasAnfahrt,
      anfahrtFee: anfahrtFee > 0 ? anfahrtFee : null,
    };

  } catch (error) {
      console.error("Fare calculation failed:", error);
      return {
          ...initialState,
          message: errorMessages.generic,
      }
  }
}
