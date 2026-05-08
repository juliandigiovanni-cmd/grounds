"use client";

import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import Map, { Marker, NavigationControl, GeolocateControl, type MapRef } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAPBOX_TOKEN, MAP_DEFAULTS } from "@/lib/mapbox";
import { SEED_CAFES, SEED_CITIES } from "@/lib/seed-data";
import { getScoreColor } from "@/lib/scoring";
import { CafeCard } from "@/components/cafe/CafeCard";
import { BottomSheet } from "@/components/cafe/BottomSheet";
import { TravelerModeSearch } from "@/components/ui/TravelerModeSearch";
import { BottomNav } from "@/components/ui/BottomNav";
import { SidePanel } from "@/components/cafe/SidePanel";
import { FilterBar } from "@/components/ui/FilterButton";
import { FilterModal, DEFAULT_FILTERS } from "@/components/ui/FilterModal";
import type { FilterState } from "@/components/ui/FilterModal";
import { Logo } from "@/components/ui/Logo";
import { NewsletterSignup } from "@/components/ui/NewsletterSignup";
import Link from "next/link";
import type { Cafe } from "@/types";

export function MapView() {
  const mapRef = useRef<MapRef>(null);
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [focusedCity, setFocusedCity] = useState<string | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Auto-focus nearest covered city on load
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const nearest = SEED_CITIES.reduce((best, city) => {
        const dist = Math.hypot(city.lat - coords.latitude, city.lng - coords.longitude);
        return dist < Math.hypot(best.lat - coords.latitude, best.lng - coords.longitude) ? city : best;
      });
      flyToCity(nearest.lat, nearest.lng, 12, nearest.name);
    }, () => { /* permission denied — leave globe view */ });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply filters to cafe list
  const filteredCafes = useMemo(() => {
    return SEED_CAFES.filter(cafe => {
      if (filters.minScore > 0 && (cafe.third_wave_score ?? 0) < filters.minScore) return false;
      if (filters.verifiedOnly && !cafe.verified) return false;
      if (filters.brewMethods.length > 0 && !filters.brewMethods.some(m => cafe.brew_methods.includes(m))) return false;
      if (filters.vibeTags.length > 0 && !filters.vibeTags.some(t => cafe.vibe_tags.includes(t))) return false;
      return true;
    });
  }, [filters]);

  // Cafes shown in sidebar: focused city only
  const sidebarCafes = useMemo(() => {
    if (!focusedCity) return [];
    const city = focusedCity.toLowerCase();
    return filteredCafes.filter(c =>
      c.city.toLowerCase().includes(city) || city.includes(c.city.toLowerCase())
    ).sort((a, b) => (b.third_wave_score ?? 0) - (a.third_wave_score ?? 0));
  }, [filteredCafes, focusedCity]);

  const flyToCity = useCallback((lat: number, lng: number, zoom = 12, cityName?: string) => {
    mapRef.current?.flyTo({ center: [lng, lat], zoom, duration: 1800, essential: true });
    if (cityName) setFocusedCity(cityName);
  }, []);

  const handleMarkerClick = useCallback((cafe: Cafe) => {
    setSelectedCafe(cafe);
    mapRef.current?.flyTo({
      center: [cafe.lng, cafe.lat],
      zoom: 15,
      offset: isMobile ? [0, -80] : [-200, 0],
      duration: 800,
      essential: true,
    });
  }, [isMobile]);

  const handleMapClick = useCallback(() => {
    setSelectedCafe(null);
  }, []);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-grounds-cream">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl font-serif font-bold text-grounds-espresso mb-4">Map Setup Required</h2>
          <p className="text-grounds-brown mb-4">Add your Mapbox token to <code className="bg-grounds-brown/10 px-1 rounded">.env.local</code> to load the map.</p>
          <code className="block bg-grounds-espresso text-grounds-cream p-4 rounded-lg text-sm text-left">
            NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_token_here
          </code>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex">
      {/* Desktop: left sidebar */}
      {!isMobile && (
        <div className="hidden lg:flex flex-col w-[380px] h-full bg-grounds-cream border-r border-grounds-brown/10 z-10 shrink-0">
          <div className="px-5 pt-4 pb-3 border-b border-grounds-brown/10">
            <h1 className="mb-1"><Logo variant="dark" size="md" /></h1>
            <p className="text-xs text-grounds-brown/60 mt-1 leading-relaxed">The specialty coffee map for travelers. Curated, scored, and editorially verified.</p>
            <div className="flex items-center gap-3 mt-2">
              <p className="text-xs text-grounds-gold">{SEED_CAFES.length} cafés · {new Set(SEED_CAFES.map(c => c.city)).size} cities</p>
              <Link href="/about" className="text-xs text-grounds-brown/40 hover:text-grounds-brown/70 transition-colors">About</Link>
            </div>
          </div>
          <div className="px-4 py-3 border-b border-grounds-brown/10">
            <TravelerModeSearch onCitySelect={flyToCity} variant="sidebar" />
          </div>
          {/* Today's pick — rotates daily, only shown on global view */}
          {!focusedCity && (() => {
            const topCafes = SEED_CAFES.filter(c => (c.third_wave_score ?? 0) >= 90);
            const pick = topCafes[Math.floor(Date.now() / 86400000) % topCafes.length];
            return pick ? (
              <div className="mx-4 my-3 p-3 rounded-xl border border-grounds-gold/25 bg-grounds-gold/5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-grounds-gold/70 mb-1">Today's pick</p>
                <button
                  className="text-left w-full"
                  onClick={() => { flyToCity(pick.lat, pick.lng, 15, pick.city); setSelectedCafe(pick); }}
                >
                  <p className="font-serif font-bold text-grounds-espresso text-sm leading-tight">{pick.name}</p>
                  <p className="text-xs text-grounds-brown/50 mt-0.5">{pick.city}, {pick.country}</p>
                  <p className="text-xs text-grounds-brown/70 mt-1.5 leading-relaxed italic line-clamp-2">"{pick.editorial_blurb}"</p>
                </button>
              </div>
            ) : null;
          })()}
          {/* GS explainer — visible upfront, no hover required */}
          {!focusedCity && (
            <div className="px-4 py-3 border-b border-grounds-brown/10 flex items-start gap-2">
              <span className="text-grounds-gold font-bold text-sm shrink-0">GS</span>
              <p className="text-xs text-grounds-brown/60 leading-relaxed">
                Every café is scored 0–100 on roaster identity, brew methods, independence, and press coverage.{" "}
                <Link href="/about/score" className="text-grounds-gold hover:underline">How it works →</Link>
              </p>
            </div>
          )}
          {/* City chips — browse by destination */}
          {!focusedCity && (
            <div className="border-b border-grounds-brown/10">
              <p className="px-4 pt-3 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-grounds-brown/40">Browse by city</p>
              <div className="flex gap-1.5 overflow-x-auto px-4 pb-3 scrollbar-hide">
                {SEED_CITIES.slice().sort((a, b) => a.name.localeCompare(b.name)).map(city => (
                  <button
                    key={city.id}
                    onClick={() => flyToCity(city.lat, city.lng, 12, city.name)}
                    className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-grounds-brown/8 hover:bg-grounds-gold/20 hover:text-grounds-espresso text-grounds-brown/70 border border-grounds-brown/10 hover:border-grounds-gold/40 transition-all whitespace-nowrap"
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex-1 overflow-y-auto">
            {/* City header when a city is focused */}
            {!focusedCity && (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-grounds-brown/50 leading-relaxed">Search a city above<br />or tap a marker on the map</p>
              </div>
            )}
            {focusedCity && (
              <div className="px-4 py-2 bg-grounds-gold/10 border-b border-grounds-brown/10 flex items-center justify-between">
                <p className="text-xs font-semibold text-grounds-espresso">
                  {sidebarCafes.length} café{sidebarCafes.length !== 1 ? "s" : ""} in {focusedCity}
                </p>
                <button
                  onClick={() => setFocusedCity(null)}
                  className="text-xs text-grounds-brown/50 hover:text-grounds-brown transition-colors"
                >
                  Show all
                </button>
              </div>
            )}
            {focusedCity && sidebarCafes.length === 0 ? (
              <div className="p-6 text-center text-sm text-grounds-brown/50">
                No curated cafés in {focusedCity} yet.{" "}
                <button onClick={() => { setFilters(DEFAULT_FILTERS); setFocusedCity(null); }} className="text-grounds-gold hover:underline">Clear filters</button>
              </div>
            ) : (
              sidebarCafes.map(cafe => (
                <div key={cafe.id} className="border-b border-grounds-brown/5 last:border-0">
                  <CafeCard
                    cafe={cafe}
                    onClick={() => {
                      setSelectedCafe(cafe);
                      mapRef.current?.flyTo({ center: [cafe.lng, cafe.lat], zoom: 15, offset: [-200, 0], duration: 800, essential: true });
                    }}
                    compact
                  />
                </div>
              ))
            )}
            <NewsletterSignup source="sidebar" />
            <div className="px-4 py-4 border-t border-grounds-brown/10">
              <Link
                href="/submit"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-grounds-gold/10 hover:bg-grounds-gold/20 text-grounds-gold font-medium text-sm border border-grounds-gold/20 hover:border-grounds-gold/40 transition-all"
              >
                + Add a café
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="flex-1 relative bg-grounds-cream">
        {/* Mobile top bar */}
        {isMobile && (
          <div className="absolute top-0 left-0 right-0 z-20 bg-grounds-cream/95 backdrop-blur-sm border-b border-grounds-brown/10 px-4 py-3 safe-area-inset-top">
            <div className="flex items-center gap-2">
              <h1 className="mr-2"><Logo variant="dark" size="sm" /></h1>
              <div className="flex-1">
                <TravelerModeSearch onCitySelect={flyToCity} variant="mobile" />
              </div>
              <FilterBar filters={filters} onOpen={() => setFilterOpen(true)} />
            </div>
          </div>
        )}

        <Map
          ref={mapRef}
          mapboxAccessToken={MAPBOX_TOKEN}
          initialViewState={MAP_DEFAULTS.initialViewState}
          style={{ width: "100%", height: "100%" }}
          mapStyle={MAP_DEFAULTS.style}
          onLoad={(evt) => {
            setMapLoaded(true);
            evt.target.setFog({
              'space-color': '#F5F0E8',
              'star-intensity': 0,
              'color': '#F5F0E8',
              'high-color': '#d4c9b8',
              'horizon-blend': 0.08,
            });
          }}
          onClick={handleMapClick}
          reuseMaps
        >
          {mapLoaded && filteredCafes.map(cafe => (
            <Marker
              key={cafe.id}
              longitude={cafe.lng}
              latitude={cafe.lat}
              anchor="bottom"
              onClick={(e) => { e.originalEvent.stopPropagation(); handleMarkerClick(cafe); }}
            >
              <ScoreMarker
                score={cafe.third_wave_score ?? 0}
                selected={selectedCafe?.id === cafe.id}
                name={cafe.name}
              />
            </Marker>
          ))}
          <NavigationControl position={isMobile ? "bottom-right" : "top-right"} style={{ bottom: isMobile ? "80px" : undefined }} />
          <GeolocateControl position={isMobile ? "bottom-right" : "top-right"} style={{ bottom: isMobile ? "140px" : undefined }} />
        </Map>

        {/* Desktop filter bar */}
        {!isMobile && (
          <div className="absolute top-4 left-4 z-10">
            <FilterBar filters={filters} onOpen={() => setFilterOpen(true)} />
          </div>
        )}

        {/* Filter modal */}
        {filterOpen && (
          <FilterModal
            filters={filters}
            onChange={setFilters}
            onClose={() => setFilterOpen(false)}
          />
        )}

        {/* Mobile: bottom sheet for selected cafe */}
        {isMobile && selectedCafe && (
          <BottomSheet onClose={() => setSelectedCafe(null)}>
            <CafeCard cafe={selectedCafe} />
          </BottomSheet>
        )}

        {/* Desktop: side panel for selected cafe */}
        {!isMobile && selectedCafe && (
          <SidePanel cafe={selectedCafe} onClose={() => setSelectedCafe(null)} />
        )}

        {/* Mobile bottom nav */}
        {isMobile && (
          <BottomNav />
        )}
      </div>
    </div>
  );
}

function ScoreMarker({ score, selected, name }: { score: number; selected: boolean; name: string }) {
  const color = getScoreColor(score);
  const size = score >= 80 ? 36 : score >= 65 ? 30 : 26;
  return (
    <div
      className="grounds-marker flex items-center justify-center rounded-full text-white font-bold shadow-lg border-2 border-white"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        fontSize: size * 0.38,
        transform: selected ? "scale(1.25)" : "scale(1)",
        transition: "transform 0.15s ease",
        boxShadow: selected ? `0 0 0 3px ${color}40` : "0 2px 8px rgba(0,0,0,0.3)",
        minWidth: 44,
        minHeight: 44,
      }}
      title={name}
    >
      {score}
    </div>
  );
}
