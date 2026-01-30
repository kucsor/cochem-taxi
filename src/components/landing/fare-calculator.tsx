"use client";

import { useState, useEffect } from "react";
import { Locate, MapPin, Clock, Calculator, Sparkles, Navigation } from "lucide-react";
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
import { Skeleton } from "../ui/skeleton";
import { trackEvent } from "@/lib/tracking";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

const Map = dynamic(() => import('@/components/landing/map').then(mod => mod.Map), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

type Dictionary = {
  title: string;
  startLabel: string;
  startPlaceholder: string;
  endLabel: string;
  endPlaceholder: string;
  timeLabel: string;
  submitButton: string;
  locateMeAriaLabel: string;
  resultTitle: string;
  resultDistance: string;
  routeMapTitle: string;
  anfahrtInfo: string;
  errorMessages: Record<string, string>;
  locationPrefix: string;
  locating: string;
};

type FareState = {
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

function PriceResult({ state, pending, dict }: { state: FareState; pending: boolean; dict: Dictionary }) {
  useEffect(() => {
    if (state.price !== null && !pending) {
      trackEvent('calculator_success');
    }
  }, [state.price, pending]);

  useEffect(() => {
    if (state.message && !pending) {
      trackEvent('calculator_error', { error_message: state.message });
    }
  }, [state.message, pending]);

  return (
    <AnimatePresence mode="wait">
      {pending ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="w-full text-center p-4 md:p-6 mt-4 md:mt-6 rounded-2xl glass space-y-2 md:space-y-3"
        >
          <Skeleton className="h-3 md:h-4 w-20 md:w-24 mx-auto bg-white/10" />
          <Skeleton className="h-10 md:h-12 w-32 md:w-40 mx-auto bg-white/10" />
          <Skeleton className="h-2 md:h-3 w-36 md:w-48 mx-auto bg-white/10" />
        </motion.div>
      ) : state.message ? (
        <motion.p
          key="error"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="mt-4 md:mt-6 text-xs md:text-sm text-red-400 text-center p-3 md:p-4 rounded-xl bg-red-500/10 border border-red-500/20"
        >
          {state.message}
        </motion.p>
      ) : state.price !== null && state.distance !== null ? (
        <motion.div
          key="result"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="w-full text-center p-4 md:p-6 mt-4 md:mt-6 rounded-2xl bg-primary/10 border border-primary/30 space-y-2 md:space-y-3 glow-gold-subtle"
        >
          <p className="text-xs md:text-sm text-muted-foreground">{dict.resultTitle}</p>
          <motion.p
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold text-gradient-gold"
          >
            ~{state.price.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
          </motion.p>
          <p className="text-[10px] md:text-xs text-muted-foreground">
            {dict.resultDistance.replace('{distance}', state.distance.toFixed(1))}
          </p>
          {state.hasAnfahrt && state.anfahrtFee !== null && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-[10px] md:text-xs text-primary/70 italic mt-1 md:mt-2"
            >
              {dict.anfahrtInfo.replace('{anfahrtPrice}', state.anfahrtFee.toLocaleString("de-DE", { style: "currency", currency: "EUR" }))}
            </motion.p>
          )}
        </motion.div>
      ) : (
        <div className="mt-4 md:mt-6 h-[80px] md:h-[120px]" />
      )}
    </AnimatePresence>
  );
}

function MapResult({ state, pending }: { state: FareState; pending: boolean }) {
  const mapContainerClass = "h-[250px] md:h-[300px] lg:h-full w-full rounded-xl md:rounded-2xl overflow-hidden glass min-h-[200px] md:min-h-[300px]";

  if (pending) {
    return (
      <div className={mapContainerClass}>
        <Skeleton className="h-full w-full bg-white/5" />
      </div>
    );
  }

  return (
    <div className={mapContainerClass}>
      <Map geometry={state.geometry} hasAnfahrt={state.hasAnfahrt} />
    </div>
  );
}

export function FareCalculator({ dict }: { dict: Dictionary }) {
  const isMobile = useIsMobile();
  
  const [startAddress, setStartAddress] = useState("");
  const [endAddress, setEndAddress] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [startSuggestions, setStartSuggestions] = useState<any[]>([]);
  const [endSuggestions, setEndSuggestions] = useState<any[]>([]);
  const [isStartFocused, setIsStartFocused] = useState(false);
  const [isEndFocused, setIsEndFocused] = useState(false);
  const [startCoords, setStartCoords] = useState<{ lat: number, lon: number } | null>(null);
  const [endCoords, setEndCoords] = useState<{ lat: number, lon: number } | null>(null);
  const [showMap, setShowMap] = useState(false);
  
  const [state, setState] = useState<FareState>(initialState);
  const [pending, setPending] = useState(false);

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
      `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
    );
  }, []);

  const fetchSuggestions = async (query: string, setter: React.Dispatch<React.SetStateAction<any[]>>) => {
    if (query.length < 2) {
      setter([]);
      return;
    }
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=DE&limit=5&proximity=7.1667,50.15&types=poi,address,place,locality`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.features) setter(data.features);
      } else {
        setter([]);
      }
    } catch (error) {
      setter([]);
    }
  };

  useEffect(() => {
    if (!isStartFocused || !startAddress) {
      if (startSuggestions.length > 0) setStartSuggestions([]);
      return;
    }
    const handler = setTimeout(() => fetchSuggestions(startAddress, setStartSuggestions), 300);
    return () => clearTimeout(handler);
  }, [startAddress, isStartFocused]);

  useEffect(() => {
    if (!isEndFocused || !endAddress) {
      if (endSuggestions.length > 0) setEndSuggestions([]);
      return;
    }
    const handler = setTimeout(() => fetchSuggestions(endAddress, setEndSuggestions), 300);
    return () => clearTimeout(handler);
  }, [endAddress, isEndFocused]);

  const handleSelectSuggestion = (suggestion: any, type: "start" | "end") => {
    const displayName = formatPlaceName(suggestion);
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
      alert("Geolocation is not supported by your browser.");
      return;
    }
    const error = () => {
      alert("Unable to retrieve your location.");
      setStartAddress("");
    };
    const success = async (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      setStartCoords({ lat: latitude, lon: longitude });
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}&limit=1&types=address,poi,place,locality`
        );
        if (!response.ok) throw new Error('Reverse geocoding failed');
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          setStartAddress(formatPlaceName(data.features[0]));
        } else {
          setStartAddress(`${dict.locationPrefix} ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
      } catch (e) {
        setStartAddress(`${dict.locationPrefix} ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      }
      setStartSuggestions([]);
    };
    setStartAddress(`${dict.locating}...`);
    setStartCoords(null);
    navigator.geolocation.getCurrentPosition(success, error, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    
    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startAddress,
          endAddress,
          pickupTime,
          startLat: startCoords?.lat.toString() || '',
          startLon: startCoords?.lon.toString() || '',
          endLat: endCoords?.lat.toString() || '',
          endLon: endCoords?.lon.toString() || '',
          errorMessages: dict.errorMessages,
        }),
      });
      
      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      setState(data);
      trackEvent('use_calculator');
    } catch (error) {
      setState({
        ...initialState,
        message: dict.errorMessages.generic || "Ein Fehler ist aufgetreten",
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <section id="rechner" className="w-full max-w-5xl mx-auto scroll-mt-28 md:scroll-mt-32 px-4 md:px-6 py-8 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
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
                    Berechnen Sie den geschätzten Preis für Ihre Fahrt
                  </p>
                </CardHeader>
                
                <CardContent className="p-0 space-y-3 md:space-y-5 flex-grow">
                  {/* Start Location */}
                  <div className="space-y-1.5 md:space-y-2 relative group">
                    <Label htmlFor="start" className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-muted-foreground">
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
                        onChange={(e) => { setStartAddress(e.target.value); setStartCoords(null); }} 
                        onFocus={() => setIsStartFocused(true)} 
                        onBlur={() => setTimeout(() => setIsStartFocused(false), 150)} 
                        autoComplete="off" 
                        className="pr-10 md:pr-12 h-11 md:h-12 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 rounded-lg md:rounded-xl transition-all duration-300 text-sm" 
                      />
                      <button 
                        type="button" 
                        onClick={handleLocateMe} 
                        className="absolute right-2 md:right-3 h-full text-muted-foreground hover:text-primary transition-colors" 
                        aria-label={dict.locateMeAriaLabel}
                      >
                        <Navigation className="h-4 w-4 md:hidden" />
                        <Locate className="h-5 w-5 hidden md:block" />
                      </button>
                    </div>
                    <AnimatePresence>
                      {isStartFocused && startSuggestions.length > 0 && (
                        <motion.ul
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-20 w-full bg-black/95 backdrop-blur-xl border border-white/10 rounded-lg md:rounded-xl mt-1 shadow-2xl text-xs md:text-sm overflow-hidden max-h-[200px] overflow-y-auto"
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
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* End Location */}
                  <div className="space-y-1.5 md:space-y-2 relative">
                    <Label htmlFor="end" className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3 md:w-4 md:h-4 text-primary/70" />
                      {dict.endLabel}
                    </Label>
                    <Input 
                      id="end" 
                      name="endAddress" 
                      placeholder={dict.endPlaceholder} 
                      required 
                      value={endAddress} 
                      onChange={(e) => { setEndAddress(e.target.value); setEndCoords(null); }} 
                      onFocus={() => setIsEndFocused(true)} 
                      onBlur={() => setTimeout(() => setIsEndFocused(false), 150)} 
                      autoComplete="off" 
                      className="h-11 md:h-12 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 rounded-lg md:rounded-xl transition-all duration-300 text-sm" 
                    />
                    <AnimatePresence>
                      {isEndFocused && endSuggestions.length > 0 && (
                        <motion.ul
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-10 w-full bg-black/95 backdrop-blur-xl border border-white/10 rounded-lg md:rounded-xl mt-1 shadow-2xl text-xs md:text-sm overflow-hidden max-h-[200px] overflow-y-auto"
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
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Time */}
                  <div className="space-y-1.5 md:space-y-2">
                    <Label htmlFor="time" className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-muted-foreground">
                      <Clock className="w-3 h-3 md:w-4 md:h-4 text-primary" />
                      {dict.timeLabel}
                    </Label>
                    <Input 
                      id="time" 
                      name="pickupTime" 
                      type="time" 
                      required 
                      value={pickupTime} 
                      onChange={(e) => setPickupTime(e.target.value)} 
                      className="h-11 md:h-12 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 rounded-lg md:rounded-xl transition-all duration-300 w-auto text-sm" 
                    />
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col items-center p-0 pt-4 md:pt-6">
                  <SubmitButton label={dict.submitButton} />
                </CardFooter>

                <PriceResult state={state} pending={pending} dict={dict} />
              </div>

              {/* Right side - Map */}
              <div className="lg:col-span-2 p-4 md:p-6 lg:p-8 lg:pl-0 border-t lg:border-t-0 lg:border-l border-white/5 bg-black/20">
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <h3 className="text-xs md:text-sm font-medium text-muted-foreground flex items-center gap-1.5 md:gap-2">
                      <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-primary/70" />
                      {dict.routeMapTitle}
                    </h3>
                    {/* Mobile toggle map button */}
                    {isMobile && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowMap(!showMap)}
                        className="text-xs text-primary lg:hidden"
                      >
                        {showMap ? 'Karte ausblenden' : 'Karte anzeigen'}
                      </Button>
                    )}
                  </div>
                  <div className={`flex-grow ${isMobile && !showMap ? 'hidden' : 'block'}`}>
                    <MapResult state={state} pending={pending} />
                  </div>
                  {/* Mobile map placeholder when hidden */}
                  {isMobile && !showMap && (
                    <div className="h-[100px] rounded-xl glass flex items-center justify-center">
                      <p className="text-xs text-muted-foreground">Karte ausgeblendet</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </form>
        </Card>
      </motion.div>
    </section>
  );
}