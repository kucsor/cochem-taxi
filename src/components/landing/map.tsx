"use client";

import { useEffect, useRef, useState } from 'react';
import MapGL, { MapRef, Source, Layer, Marker, NavigationControl } from 'react-map-gl';
import type { LayerProps } from 'react-map-gl';
import { LngLatBounds } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { motion } from 'framer-motion';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

type MapProps = {
  geometry: any;
  hasAnfahrt?: boolean;
};

function AnimatedMarker({ color, delay = 0 }: { color: string; delay?: number }) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 20, 
        delay 
      }}
      className="relative"
    >
      {/* Pulse animation */}
      <motion.div
        animate={{ 
          scale: [1, 1.5, 1],
          opacity: [0.8, 0, 0.8]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className={`absolute inset-0 rounded-full ${color === 'green' ? 'bg-green-500' : 'bg-red-500'}`}
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
    </motion.div>
  );
}

export function Map({ geometry, hasAnfahrt = false }: MapProps) {
  const mapRef = useRef<MapRef>(null);
  const [isTerrainLoaded, setIsTerrainLoaded] = useState(false);
  
  const yellowColor = '#ffc400';
  const orangeColor = '#FFA500';
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
      'line-width': 12,
      'line-opacity': 0.2,
      'line-blur': 4,
    },
  };

  const routeShadowLayer: LayerProps = {
    id: 'route-shadow',
    type: 'line',
    source: 'route',
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
    },
    paint: {
      'line-color': '#000000',
      'line-width': 6,
      'line-opacity': 0.3,
      'line-offset': 2,
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
      'line-width': 4,
      'line-gradient': [
        'interpolate',
        ['linear'],
        ['line-progress'],
        0, yellowColor,
        1, hasAnfahrt ? orangeColor : yellowColor
      ]
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
        padding: 100,
        duration: 1500,
        maxZoom: 15,
        pitch: 45, // Tilt for 3D effect
      });
    }, 200);

    return () => clearTimeout(timer);
  }, [geometry]);

  // Add terrain on load
  const handleLoad = () => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    // Add terrain source
    map.addSource('mapbox-dem', {
      type: 'raster-dem',
      url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
      tileSize: 512,
      maxzoom: 14
    });

    // Enable 3D terrain with exaggeration
    map.setTerrain({ 
      source: 'mapbox-dem', 
      exaggeration: 1.5 
    });

    // Add sky layer for better 3D visuals
    map.addLayer({
      id: 'sky',
      type: 'sky',
      paint: {
        'sky-type': 'atmosphere',
        'sky-atmosphere-sun': [0.0, 90.0],
        'sky-atmosphere-sun-intensity': 15
      }
    });

    setIsTerrainLoaded(true);
  };

  return (
    <MapGL
      ref={mapRef}
      mapboxAccessToken={MAPBOX_TOKEN}
      initialViewState={{
        longitude: 7.166,
        latitude: 50.146,
        zoom: 12,
        pitch: 45,
        bearing: 0,
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/outdoors-v12" // Outdoors style for terrain
      scrollZoom={false}
      dragPan={true}
      dragRotate={true}
      attributionControl={false}
      onLoad={handleLoad}
      terrain={isTerrainLoaded ? { source: 'mapbox-dem', exaggeration: 1.5 } : undefined}
    >
      <NavigationControl position="top-right" visualizePitch={true} />
      
      {routeGeoJSON && (
        <Source id="route" type="geojson" data={routeGeoJSON}>
          <Layer {...routeGlowLayer} />
          <Layer {...routeShadowLayer} />
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