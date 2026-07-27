
"use server";

import mbxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";
import mbxDirections from "@mapbox/mapbox-sdk/services/directions";
import {
  ANFAHRT_FEE_PERCENTAGE,
  BASE_FEE,
  COCHEM_CENTER_COORDS,
  COCHEM_POLYGON,
  PRICE_BUFFER,
  getHaversineDistance,
  getRatePerKm,
  isNightTime,
  isPointInPolygon,
  routePassesThroughCochemZone,
} from "@/lib/fare";

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
const geocodingService = mbxGeocoding({ accessToken: mapboxToken });
const directionsService = mbxDirections({ accessToken: mapboxToken });

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

    const isNightTariff = isNightTime(pickupTime);
    const ratePerKm = getRatePerKm({ night: isNightTariff });

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
    
    // Final price with the shared safety buffer applied to the total
    const finalPrice = (mainPrice + anfahrtFee) * PRICE_BUFFER;

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
