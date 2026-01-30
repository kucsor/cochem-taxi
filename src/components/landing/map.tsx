"use client";

import { useEffect, useRef } from 'react';
import MapGL, { MapRef, Source, Layer, Marker, NavigationControl } from 'react-map-gl';
import type { LayerProps } from 'react-map-gl';
import { LngLatBounds } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

type MapProps = {
  geometry: any;
  hasAnfahrt?: boolean;
};

export function Map({ geometry, hasAnfahrt = false }: MapProps) {
  const mapRef = useRef<MapRef>(null);
  
  const yellowColor = '#ffc400'; // Current primary yellow
  const orangeColor = '#FFA500'; // Orange for Anfahrt

  const lineColor = hasAnfahrt ? orangeColor : yellowColor;

  const routeGlowLayer: LayerProps = {
    id: 'route-glow',
    type: 'line',
    source: 'route',
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
    },
    paint: {
      'line-color': lineColor,
      'line-width': 8, // Thinner glow
      'line-opacity': 0.3,
    },
  };

  const routeLayer: LayerProps = {
    id: 'route',
    type: 'line',
    source: 'route',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': lineColor,
      'line-width': 3 // Thinner line
    }
  };

  const routeGeoJSON = geometry ? {
    type: 'Feature',
    properties: {},
    geometry: geometry
  } : null;

  const startPoint = routeGeoJSON && geometry.coordinates ? geometry.coordinates[0] : null;
  const endPoint = routeGeoJSON && geometry.coordinates ? geometry.coordinates[geometry.coordinates.length - 1] : null;

  useEffect(() => {
    // Exit early if there's no geometry to display
    if (!geometry || !geometry.coordinates || geometry.coordinates.length === 0) {
      return;
    }

    // A small delay ensures that the map has had time to render the new geometry
    // from the <Source> component before we try to fit the bounds.
    const timer = setTimeout(() => {
      const map = mapRef.current?.getMap();
      if (!map) {
        return;
      }

      const coordinates = geometry.coordinates as [number, number][];
      
      // Create a 'LngLatBounds' with the first coordinate.
      const bounds = new LngLatBounds(coordinates[0], coordinates[0]);

      // Extend the 'LngLatBounds' to include every coordinate in the route.
      for (const coord of coordinates) {
        bounds.extend(coord);
      }
      
      map.fitBounds(bounds, {
        padding: 80, // Padding to ensure markers are not at the very edge
        duration: 1000,
        maxZoom: 15 // Prevent zooming in too far on short routes
      });
    }, 100); // 100ms delay as a starting point

    // Cleanup the timer if the component re-renders before the timeout finishes
    return () => clearTimeout(timer);
  }, [geometry]);

  return (
    <MapGL
      ref={mapRef}
      mapboxAccessToken={MAPBOX_TOKEN}
      initialViewState={{
        longitude: 7.166,
        latitude: 50.146,
        zoom: 12
      }}
      style={{ width: '100%', height: '100%', filter: 'saturate(70%)' }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      scrollZoom={false}
      dragPan={false}
      dragRotate={false}
      attributionControl={false}
    >
      <NavigationControl position="top-right" />
      
      {routeGeoJSON && (
        <Source id="route" type="geojson" data={routeGeoJSON}>
          <Layer {...routeGlowLayer} />
          <Layer {...routeLayer} />
        </Source>
      )}

      {startPoint && (
          <Marker longitude={startPoint[0]} latitude={startPoint[1]} anchor="center">
            <div title="Startpunkt" className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-lg" />
          </Marker>
      )}
      {endPoint && (
          <Marker longitude={endPoint[0]} latitude={endPoint[1]} anchor="center">
             <div title="Zielpunkt" className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-lg" />
          </Marker>
      )}
    </MapGL>
  );
}
