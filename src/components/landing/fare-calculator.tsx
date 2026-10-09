"use client";

import { airports } from "@/lib/airports";
import { calculationOutcome } from "@/lib/calculation-diagnostics";
import { useState, useEffect, useRef } from "react";
import { Locate, MapPin, Clock, Calculator, Sparkles, Navigation, Loader2, Users, Map as MapIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "./submit-button";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";
import { CountUp } from "@/components/ui/count-up";
import { classifyDestination, resolvedAnalyticsPlace } from "@/lib/analytics-destinations";
import { trackEvent, clearEstimateAttribution } from "@/lib/tracking";
import Image from "next/image";

const Map = dynamic(() => import('@/components/landing/map').then(mod => mod.Map), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

type Dictionary = {
  callButton?: string;
  subtitle: string;
  hideMap: string;
  showMap: string;
  mapHidden: string;
  loadMap: string;
  title: string;
  startLabel: string;
  startPlaceholder: string;
  endLabel: string;
  endPlaceholder: string;
  timeLabel: string;
  passengersLabel: string;
  passengersStandard: string;
  passengersLarge: string;
  submitButton: string;
  locateMeAriaLabel: string;
  resultTitle: string;
  resultDistance: string;
  routeMapTitle: string;
  anfahrtInfo: string;
  errorMessages: Record<string, string>;
  locationPrefix: string;
  locating: string;
  detailsLink?: string;
};

type FareState = {
  duration?: number;
  price: number | null;
  distance: number | null;
  message: string | null;
  geometry: any | null;
  hasAnfahrt: boolean;
  anfahrtFee: number | null;
};

const initialState: FareState = {
  price: null,
  distance: null,
  message: null,
  geometry: null,
  hasAnfahrt: false,
  anfahrtFee: null,
};

function PriceResult({ state, pending, dict, lang }: { lang: string; state: FareState; pending: boolean; dict: Dictionary }) {

  if (pending) {
      return (
        <div
          className="relative overflow-hidden w-full text-center p-4 md:p-6 mt-4 md:mt-6 rounded-2xl glass space-y-2 md:space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <div aria-hidden="true" className="absolute inset-0 animate-shimmer" />
          <Skeleton className="h-3 md:h-4 w-20 md:w-24 mx-auto bg-white/10" />
          <Skeleton className="h-10 md:h-12 w-32 md:w-40 mx-auto bg-white/10" />
          <Skeleton className="h-2 md:h-3 w-36 md:w-48 mx-auto bg-white/10" />
        </div>
      );
  }

  if (state.message) {
      return (
        <p
          className="mt-4 md:mt-6 text-xs md:text-sm text-red-400 text-center p-3 md:p-4 rounded-xl bg-red-500/10 border border-red-500/20 animate-in fade-in zoom-in-95 duration-300"
        >
          {state.message}
        </p>
      );
  }

  if (state.price !== null && state.distance !== null) {
      return (
        <div
          key={state.price} // Force re-animation on price change
          className="w-full text-center p-4 md:p-6 mt-4 md:mt-6 rounded-2xl bg-primary/10 border border-primary/30 space-y-2 md:space-y-3 glow-gold-subtle animate-in fade-in slide-in-from-bottom-4 zoom-in-95 duration-500"
        >
          <p className="text-xs md:text-sm text-muted-foreground">{dict.resultTitle}</p>
          <p
            className="text-3xl md:text-5xl font-bold text-gradient-gold animate-in zoom-in duration-500 delay-100 fill-mode-forwards"
          >
            <CountUp
              end={state.price}
              durationMs={700}
              format={(value) => `~${value.toLocaleString(lang === "nl" ? "nl-NL" : lang === "en" ? "en-GB" : "de-DE", { style: "currency", currency: "EUR" })}`}
            />
          </p>
          <p className="text-[10px] md:text-xs text-muted-foreground">
            {dict.resultDistance.replace('{distance}', state.distance.toFixed(1))}
          </p>
          {state.duration != null && <p className="text-sm text-muted-foreground">~{Math.ceil(state.duration)} min · {lang === 'de' ? 'ohne Verkehrspuffer' : lang === 'nl' ? 'zonder verkeersbuffer' : 'excluding traffic buffer'}</p>}
          {state.hasAnfahrt && state.anfahrtFee !== null && (
            <p
              className="text-[10px] md:text-xs text-primary/70 italic mt-1 md:mt-2 animate-in fade-in delay-300 fill-mode-forwards"
            >
              {dict.anfahrtInfo.replace('{anfahrtPrice}', state.anfahrtFee.toLocaleString(lang === "nl" ? "nl-NL" : lang === "en" ? "en-GB" : "de-DE", { style: "currency", currency: "EUR" }))}
            </p>
          )}
        </div>
      );
  }

  return null;
}

function MapResult({ state, pending, isLoaded, setIsLoaded, dict }: { dict: Dictionary; state: FareState; pending: boolean; isLoaded: boolean; setIsLoaded: (v: boolean) => void }) {
  const mapContainerClass = "h-[250px] md:h-[300px] lg:h-full w-full rounded-xl md:rounded-2xl overflow-hidden glass min-h-[200px] md:min-h-[300px] relative";

  // Static Map Image URL
  const staticMapUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/7.166,50.146,12,0/800x600?access_token=${MAPBOX_TOKEN}`;

  if (pending) {
    return (
      <div className={mapContainerClass}>
        <Skeleton className="h-full w-full bg-white/5" />
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className={mapContainerClass + " group cursor-pointer"}
        onClick={() => {
          setIsLoaded(true);
          trackEvent('load_map_click');
        }}
      >
        {/* Static Map Image */}
        <div className="absolute inset-0">
            {/* Using regular img for external URL if not configured in next.config, but better use next/image with unoptimized if strict */}
            {/* Since domain is external, we need to allow it in next.config or use unoptimized */}
            <img
                src={staticMapUrl}
                alt={dict.routeMapTitle}
                className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-300"
                width="800"
                height="600"
            />
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
          <Button variant="secondary" className="gap-2 shadow-lg hover:scale-105 transition-transform">
            <MapIcon className="w-4 h-4" />
            {dict.loadMap}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={mapContainerClass}>
      <Map geometry={state.geometry} hasAnfahrt={state.hasAnfahrt} />
    </div>
  );
}

export function FareCalculator({ airportSlug, dict, lang = "de", showDetailsLink = true, initialStartAddress = "", initialDestinationAddress = "" }: { airportSlug?: string; dict: Dictionary; lang?: string; showDetailsLink?: boolean; initialStartAddress?: string; initialDestinationAddress?: string }) {
  // Initial values are curated route-page presets, not visitor-entered addresses.
  const originCategory = useRef<string>(classifyDestination(initialStartAddress));
  const destinationCategory = useRef<string>(classifyDestination(initialDestinationAddress, airportSlug));
  const [startAddress, setStartAddress] = useState(initialStartAddress);
  const [endAddress, setEndAddress] = useState(initialDestinationAddress);
  const [pickupTime, setPickupTime] = useState("");
  const [passengers, setPassengers] = useState<"1-4" | "5-8">("1-4");
  const [startSuggestions, setStartSuggestions] = useState<any[]>([]);
  const [endSuggestions, setEndSuggestions] = useState<any[]>([]);
  const [isStartFocused, setIsStartFocused] = useState(false);
  const [isEndFocused, setIsEndFocused] = useState(false);
  const [startCoords, setStartCoords] = useState<{ lat: number, lon: number } | null>(null);
  const [endCoords, setEndCoords] = useState<{ lat: number, lon: number } | null>(null);
  const [showMap, setShowMap] = useState(false);
  
  const [state, setState] = useState<FareState>(initialState);
  const requestVersion = useRef(0);
  const lastSearchCategory = useRef("");
  useEffect(() => { clearEstimateAttribution(); requestVersion.current++; setPending(false); setState(initialState); }, [startAddress, endAddress, pickupTime, passengers]);
  const [pending, setPending] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // New loading states for suggestions
  const [isStartLoading, setIsStartLoading] = useState(false);
  const [isEndLoading, setIsEndLoading] = useState(false);

  const formatPlaceName = (suggestion: any): string => {
    const isAddress = suggestion.place_type.includes('address');
    if (isAddress && suggestion.context) {
      const houseNumber = suggestion.address;
      const street = suggestion.text;
      const cityObj = suggestion.context.find((c: any) => c.id.startsWith('place')) 
                   || suggestion.context.find((c: any) => c.id.startsWith('locality'));
      const city = cityObj ? cityObj.text : '';
      const orderedAddress = [city, houseNumber, street].filter(Boolean).join(', ');
      if (orderedAddress) return orderedAddress;
    }
    return suggestion.place_name.split(',').slice(0, 2).join(', ');
  };

  useEffect(() => {
    const now = new Date();
    setPickupTime(
      new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Berlin", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(now)
    );
  }, []);

  const fetchSuggestions = async (
    query: string,
    setter: React.Dispatch<React.SetStateAction<any[]>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    signal: AbortSignal
  ) => {
    if (query.length < 2) {
      setter([]);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=DE,LU&limit=5&proximity=7.1667,50.15&language=de&types=address,place,locality`, { signal }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.features) setter(data.features);
      } else {
        setter([]);
      }
    } catch (error) {
      setter([]);
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    if (!isStartFocused || !startAddress) {
      if (startSuggestions.length > 0) setStartSuggestions([]);
      return;
    }
    const controller = new AbortController();
    const handler = setTimeout(() => fetchSuggestions(startAddress, setStartSuggestions, setIsStartLoading, controller.signal), 300);
    return () => { clearTimeout(handler); controller.abort(); setIsStartLoading(false); };
  }, [startAddress, isStartFocused]);

  useEffect(() => {
    if (!isEndFocused || !endAddress) {
      if (endSuggestions.length > 0) setEndSuggestions([]);
      return;
    }
    const controller = new AbortController();
    const handler = setTimeout(() => {
      const category = classifyDestination(endAddress, airportSlug);
      const destination = category === "other" ? "unknown" : category;
      if(endAddress.trim().length >= 3 && destination !== lastSearchCategory.current) {
        trackEvent("destination_search", {destination, route_version: 2, source:"calculator"});
        lastSearchCategory.current = destination;
      }
      void fetchSuggestions(endAddress, setEndSuggestions, setIsEndLoading, controller.signal);
    }, 500);
    return () => { clearTimeout(handler); controller.abort(); setIsEndLoading(false); };
  }, [endAddress, isEndFocused]);

  const handleSelectSuggestion = (suggestion: any, type: "start" | "end") => {
    const displayName = formatPlaceName(suggestion);
    clearEstimateAttribution();
    const category = resolvedAnalyticsPlace(suggestion, type === "end" ? airportSlug : undefined);
    if (type === "start") originCategory.current = category;
    else destinationCategory.current = category;
    trackEvent(type === "end" ? "destination_select" : "pickup_select", {
      destination: type === "end" ? category : undefined,
      origin: type === "start" ? category : originCategory.current,
      route_version: 2, source: "calculator",
    });
    const coords = { lat: suggestion.center[1], lon: suggestion.center[0] };
    if (type === "start") {
      setStartAddress(displayName);
      setStartCoords(coords);
      setStartSuggestions([]);
    } else {
      setEndAddress(displayName);
      setEndCoords(coords);
      setEndSuggestions([]);
    }
  };

  const handleLocateMe = () => {
    trackEvent('click_locate_me');
    if (!navigator.geolocation) {
      alert(dict.errorMessages.location);
      return;
    }
    const error = () => {
      trackEvent("location_error");
      alert(dict.errorMessages.location);
      setStartAddress("");
    };
    const success = async (position: GeolocationPosition) => {
      trackEvent("location_success");
      const { latitude, longitude } = position.coords;
      setStartCoords({ lat: latitude, lon: longitude });
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}&limit=1&language=de&types=address,place,locality`
        );
        if (!response.ok) throw new Error('Reverse geocoding failed');
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          setStartAddress(formatPlaceName(data.features[0]));
          originCategory.current = resolvedAnalyticsPlace(data.features[0]);
        } else {
          setStartAddress(`${dict.locationPrefix} ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
      } catch (e) {
        setStartAddress(`${dict.locationPrefix} ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      }
      setStartSuggestions([]);
    };
    clearEstimateAttribution();
    originCategory.current = "unknown";
    setStartAddress(`${dict.locating}...`);
    setStartCoords(null);
    navigator.geolocation.getCurrentPosition(success, error, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pending) return;
    const version = ++requestVersion.current;
    setState(initialState);
    const metrics = { passengers, origin: originCategory.current, destination: destinationCategory.current, route_version: 2, tariff: Number(pickupTime.split(":")[0]) >= 22 || Number(pickupTime.split(":")[0]) < 6 ? "night" : "day", source: "calculator" };
    clearEstimateAttribution();
    let recordedStart = false;
    const recordStart = () => {
      if (!recordedStart) { trackEvent("use_calculator", metrics); recordedStart = true; }
    };
    setPending(true);
    setIsMapLoaded(true); // Load map on submit
    if (!showMap) setShowMap(true); // Show map container on mobile
    
    try {
      // Reuse the same lookup needed for unselected addresses, before sending
      // coordinates to the calculator. No second server geocode is necessary.
      const resolve = async (address: string, coords: {lat:number;lon:number} | null, category: string, fixedAirport?: string) => {
        const airport = airports.find(a => a.slug === fixedAirport || a.address.toLowerCase() === address.toLowerCase());
        if (airport) return {coords:{lat:airport.lat,lon:airport.lon},category:`airport-${airport.slug}`};
        if (coords) return {coords,category};
        const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}&country=DE,LU&limit=1&language=de&types=address,place,locality&proximity=7.1667,50.15`, {signal:AbortSignal.timeout(12000)});
        if (!response.ok) throw new Error("Place lookup unavailable");
        const feature = (await response.json()).features?.[0];
        return {coords:feature?.center ? {lon:feature.center[0],lat:feature.center[1]} : null,category:resolvedAnalyticsPlace(feature)};
      };
      const [start,end] = await Promise.all([
        resolve(startAddress,startCoords,metrics.origin),
        resolve(endAddress,endCoords,metrics.destination,airportSlug),
      ]);
      if (version !== requestVersion.current) return;
      metrics.origin = start.category;
      metrics.destination = end.category;
      recordStart();
      if (!start.coords || !end.coords) {
        const code = !start.coords && !end.coords ? "geocoding_both" : !start.coords ? "geocoding_start" : "geocoding_end";
        trackEvent("calculator_error", {...metrics,outcome:code});
        setState({...initialState,message:dict.errorMessages[code] || dict.errorMessages.generic});
        return;
      }
      const response = await fetch('/api/calculate', {
        method: 'POST',
        signal: AbortSignal.timeout(30000),
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          airportSlug,
          startAddress,
          endAddress,
          pickupTime,
          passengers,
          startLat: start.coords.lat.toString(),
          startLon: start.coords.lon.toString(),
          endLat: end.coords.lat.toString(),
          endLon: end.coords.lon.toString(),
          errorMessages: dict.errorMessages,
        }),
      });
      
      const data = await response.json();
      if (version !== requestVersion.current) return;
      if (!response.ok || data.message) {
        setState({ ...initialState, message: dict.errorMessages[data.code] || dict.errorMessages.generic });
        trackEvent('calculator_error', { ...metrics, outcome: calculationOutcome(data.code) });
      } else { setState(data); trackEvent('calculator_success', { ...metrics, fare: Math.round(data.price * 100) / 100, distance: Math.round(data.distance * 10) / 10 }); }
    } catch (error) {
      if (version !== requestVersion.current) return;
      recordStart();
      trackEvent("calculator_error", { ...metrics, outcome: "network_or_timeout" });
      setState({
        ...initialState,
        message: dict.errorMessages.generic || "Ein Fehler ist aufgetreten",
      });
    } finally {
      if (version === requestVersion.current) setPending(false);
    }
  };

  return (
    <section id="rechner" className="w-full max-w-5xl mx-auto scroll-mt-28 md:scroll-mt-32 px-4 md:px-6 py-8 md:py-12">
        <Card className="glass-card overflow-hidden border-white/10">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-5 lg:gap-0">
              
              {/* Left side - Form */}
              <div className="lg:col-span-3 p-4 md:p-6 lg:p-8 flex flex-col">
                <CardHeader className="p-0 mb-4 md:mb-6">
                  <div className="flex items-center gap-2 md:gap-3 mb-2">
                    <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-primary/10 glow-gold-subtle">
                      <Calculator className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                    </div>
                    <h2 className="font-bold text-lg md:text-2xl text-white">{dict.title}</h2>
                  </div>
                  <p className="text-muted-foreground text-xs md:text-sm">
                    {dict.subtitle}
                  </p>
                </CardHeader>
                
                <CardContent className="p-0 space-y-3 md:space-y-5 flex-grow">
                  {/* Start Location */}
                  <div className="space-y-2 relative group">
                    <Label htmlFor="start" className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3 md:w-4 md:h-4 text-primary" />
                      {dict.startLabel}
                    </Label>
                    <div className="relative flex items-center">
                      <Input 
                        id="start" 
                        name="startAddress" 
                        placeholder={dict.startPlaceholder} 
                        required 
                        value={startAddress} 
                        onChange={(e) => { clearEstimateAttribution(); originCategory.current = "unknown"; setStartAddress(e.target.value); setStartCoords(null); }}
                        onFocus={() => setIsStartFocused(true)} 
                        onBlur={() => setTimeout(() => setIsStartFocused(false), 150)} 
                        autoComplete="off" 
                        aria-busy={isStartLoading}
                        className="pr-10 md:pr-12 h-11 md:h-12 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 rounded-lg md:rounded-xl transition-all duration-300 text-sm" 
                      />
                      {isStartLoading ? (
                        <div className="absolute right-2 md:right-3 h-full flex items-center justify-center pointer-events-none">
                          <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin text-muted-foreground" />
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handleLocateMe}
                          className="absolute right-2 md:right-3 h-full text-muted-foreground hover:text-primary transition-colors"
                          aria-label={dict.locateMeAriaLabel}
                        >
                          <Navigation className="h-4 w-4 md:hidden" />
                          <Locate className="h-5 w-5 hidden md:block" />
                        </button>
                      )}
                    </div>
                      {isStartFocused && startSuggestions.length > 0 && (
                        <ul
                          className="absolute z-20 w-full bg-black/95 backdrop-blur-xl border border-white/10 rounded-lg md:rounded-xl mt-1 shadow-2xl text-xs md:text-sm overflow-hidden max-h-[200px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200"
                        >
                          {startSuggestions.map((s) => (
                            <li 
                              key={s.id} 
                              className="px-3 md:px-4 py-2.5 md:py-3 cursor-pointer hover:bg-primary/10 transition-colors border-b border-white/5 last:border-0 flex items-center gap-2"
                              onMouseDown={() => handleSelectSuggestion(s, "start")}
                            >
                              <MapPin className="w-3 h-3 text-primary/50 flex-shrink-0" />
                              <span className="truncate">{formatPlaceName(s)}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                  </div>

                  {/* End Location */}
                  <div className="space-y-2 relative">
                    <Label htmlFor="end" className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3 md:w-4 md:h-4 text-primary/70" />
                      {dict.endLabel}
                    </Label>
                    <div className="relative flex items-center">
                      <Input
                        id="end"
                        name="endAddress"
                        readOnly={!!airportSlug}
                        placeholder={dict.endPlaceholder}
                        required
                        value={endAddress}
                        onChange={(e) => { clearEstimateAttribution(); destinationCategory.current = "unknown"; setEndAddress(e.target.value); setEndCoords(null); }}
                        onFocus={() => setIsEndFocused(!airportSlug)}
                        onBlur={() => setTimeout(() => setIsEndFocused(false), 150)}
                        autoComplete="off"
                        aria-busy={isEndLoading}
                        className="pr-10 md:pr-12 h-11 md:h-12 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 rounded-lg md:rounded-xl transition-all duration-300 text-sm"
                      />
                      {isEndLoading && (
                        <div className="absolute right-2 md:right-3 h-full flex items-center justify-center pointer-events-none">
                          <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin text-muted-foreground" />
                        </div>
                      )}
                    </div>
                      {isEndFocused && endSuggestions.length > 0 && (
                        <ul
                          className="absolute z-10 w-full bg-black/95 backdrop-blur-xl border border-white/10 rounded-lg md:rounded-xl mt-1 shadow-2xl text-xs md:text-sm overflow-hidden max-h-[200px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200"
                        >
                          {endSuggestions.map((s) => (
                            <li 
                              key={s.id} 
                              className="px-3 md:px-4 py-2.5 md:py-3 cursor-pointer hover:bg-primary/10 transition-colors border-b border-white/5 last:border-0 flex items-center gap-2"
                              onMouseDown={() => handleSelectSuggestion(s, "end")}
                            >
                              <MapPin className="w-3 h-3 text-primary/50 flex-shrink-0" />
                              <span className="truncate">{formatPlaceName(s)}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                    {/* Passengers */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                        <Users className="w-3 h-3 md:w-4 md:h-4 text-primary" />
                        {dict.passengersLabel}
                      </Label>
                      <div className="grid grid-cols-2 gap-2 h-11 md:h-12 bg-white/5 p-1 rounded-lg md:rounded-xl border border-white/10">
                        <button
                          type="button"
                          onClick={() => {setPassengers("1-4");trackEvent("passenger_change",{passengers:"1-4"});}}
                          className={`rounded-md md:rounded-lg text-xs md:text-sm font-medium transition-all ${passengers === "1-4" ? "bg-primary text-black shadow-lg" : "text-muted-foreground hover:text-white"}`}
                        >
                          {dict.passengersStandard}
                        </button>
                        <button
                          type="button"
                          onClick={() => {setPassengers("5-8");trackEvent("passenger_change",{passengers:"5-8"});}}
                          className={`rounded-md md:rounded-lg text-xs md:text-sm font-medium transition-all ${passengers === "5-8" ? "bg-primary text-black shadow-lg" : "text-muted-foreground hover:text-white"}`}
                        >
                          {dict.passengersLarge}
                        </button>
                      </div>
                    </div>

                    {/* Time */}
                    <div className="space-y-2">
                      <Label htmlFor="time" className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                        <Clock className="w-3 h-3 md:w-4 md:h-4 text-primary" />
                        {dict.timeLabel}
                      </Label>
                      <Input
                        id="time"
                        name="pickupTime"
                        aria-description="Europe/Berlin"
                        type="time"
                        required
                        value={pickupTime}
                        onChange={(e) => {setPickupTime(e.target.value);}}
                        onBlur={() => trackEvent("time_change")}
                        className="h-11 md:h-12 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 rounded-lg md:rounded-xl transition-all duration-300 w-full text-sm"
                      />
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col items-center p-0 pt-4 md:pt-6">
                  <SubmitButton label={dict.submitButton} pending={pending} />
                </CardFooter>

                {/* Persistent wrapper: aria-live must exist before content
                    changes for announcements to fire; min-h reserves the
                    result card's height so the page below doesn't jump. */}
                {/* min-h calibrated to the measured result card incl. the
                    Anfahrt note (mobile 171px / desktop 210px) */}
                <div aria-live="polite" role="status" className="min-h-[171px] md:min-h-[210px]">
                  <PriceResult lang={lang} state={state} pending={pending} dict={dict} />
                  {state.price != null && !pending && (
                    <Button asChild size="lg" className="mt-4 w-full">
                      <a href="tel:+4926718080" >
                        {dict.callButton ?? (lang === 'de' ? 'Taxi anrufen' : 'Call a taxi')} · 02671 8080
                      </a>
                    </Button>
                  )}
                </div>

                {showDetailsLink && dict.detailsLink && (
                  <div className="mt-4 text-center">
                    <Link
                      href={`/${lang}/rechner`}
                      className="text-xs text-muted-foreground hover:text-primary hover:underline underline-offset-4 transition-all"
                    >
                      {dict.detailsLink}
                    </Link>
                  </div>
                )}
              </div>

              {/* Right side - Map */}
              <div className="lg:col-span-2 p-4 md:p-6 lg:p-8 lg:pl-0 border-t lg:border-t-0 lg:border-l border-white/5 bg-black/20">
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <h3 className="text-xs md:text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-primary/70" />
                      {dict.routeMapTitle}
                    </h3>
                    {/* Mobile toggle map button */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {setShowMap(!showMap);trackEvent("map_toggle");}}
                      className="text-xs text-primary md:hidden"
                    >
                      {showMap ? dict.hideMap : dict.showMap}
                    </Button>
                  </div>
                  <div className={`flex-grow ${!showMap ? 'hidden md:block' : 'block'}`}>
                    <MapResult dict={dict} state={state} pending={pending} isLoaded={isMapLoaded} setIsLoaded={setIsMapLoaded} />
                  </div>
                  {/* Mobile map placeholder when hidden */}
                  {!showMap && (
                    <div className="h-[100px] rounded-xl glass flex items-center justify-center md:hidden">
                      <p className="text-xs text-muted-foreground">{dict.mapHidden}</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </form>
        </Card>
    </section>
  );
}
