"use client";

import { useEffect, useRef } from 'react';
import MapGL, { MapRef, Source, Layer, Marker } from 'react-map-gl';
import type { LayerProps } from 'react-map-gl';
import { LngLatBounds } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

type MapProps = {
  geometry: any;
  hasAnfahrt?: boolean;
};

function AnimatedMarker({ color, delay = 0 }: { color: string; delay?: number }) {
  return (
    <div
      className="relative animate-in zoom-in duration-500 fill-mode-forwards"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Pulse animation */}
      <div
        className={`absolute inset-0 rounded-full animate-marker-pulse ${color === 'green' ? 'bg-green-500' : 'bg-red-500'}`}
      />
      {/* Core marker */}
      <div 
        className={`relative w-5 h-5 rounded-full border-3 border-white shadow-xl ${
          color === 'green' ? 'bg-green-500' : 'bg-red-500'
        }`}
        style={{ 
          boxShadow: `0 0 20px ${color === 'green' ? 'rgba(34, 197, 94, 0.6)' : 'rgba(239, 68, 68, 0.6)'}`
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-2 h-2 rounded-full bg-white`} />
        </div>
      </div>
    </div>
  );
}

export function Map({ geometry, hasAnfahrt = false }: MapProps) {
  const mapRef = useRef<MapRef>(null);
  
  const yellowColor = '#ffc400';
  const orangeColor = '#FFA500';
  const lineColor = hasAnfahrt ? orangeColor : yellowColor;

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
      'line-width': 4,
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
    if (!geometry || !geometry.coordinates || geometry.coordinates.length === 0) {
      return;
    }

    const timer = setTimeout(() => {
      const map = mapRef.current?.getMap();
      if (!map) return;

      const coordinates = geometry.coordinates as [number, number][];
      const bounds = new LngLatBounds(coordinates[0], coordinates[0]);

      for (const coord of coordinates) {
        bounds.extend(coord);
      }
      
      map.fitBounds(bounds, {
        padding: 80,
        duration: 1000,
        maxZoom: 15,
      });
    }, 100);

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
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/streets-v12" // Simple streets style - fast loading
      scrollZoom={true}  // Enable scroll zoom
      dragPan={true}     // Enable drag with finger/mouse
      dragRotate={false} // Disable rotation (keep it simple)
      touchZoomRotate={true} // Enable pinch zoom on mobile
      doubleClickZoom={true}
      attributionControl={false} // Remove attribution for cleaner look
    >
      {/* NO NavigationControl - removed for cleaner UI */}
      
      {routeGeoJSON && (
        <Source id="route" type="geojson" data={routeGeoJSON}>
          <Layer {...routeLayer} />
        </Source>
      )}

      {startPoint && (
        <Marker longitude={startPoint[0]} latitude={startPoint[1]} anchor="center">
          <AnimatedMarker color="green" delay={0.3} />
        </Marker>
      )}
      
      {endPoint && (
        <Marker longitude={endPoint[0]} latitude={endPoint[1]} anchor="center">
          <AnimatedMarker color="red" delay={0.5} />
        </Marker>
      )}
    </MapGL>
  );
}
