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

function CupIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="52" height="56" viewBox="0 0 52 56" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Steam */}
      <path d="M17 10 C16 7.5 18 5 17 2" stroke="#C8973E" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M26 8 C25 5.5 27 3 26 0" stroke="#C8973E" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M35 10 C34 7.5 36 5 35 2" stroke="#C8973E" strokeWidth="1.6" strokeLinecap="round"/>
      {/* Cup body */}
      <path d="M8 14 Q8 12 10 12 L42 12 Q44 12 44 14 L40 46 Q40 48 38 48 L14 48 Q12 48 12 46 Z" fill="#3D1C00"/>
      {/* Rim highlight */}
      <rect x="8" y="11" width="36" height="5" rx="2.5" fill="#2C1200"/>
      {/* Coffee surface */}
      <ellipse cx="26" cy="14" rx="14" ry="3" fill="#7B4A28"/>
      {/* Handle */}
      <path d="M44 20 Q52 20 52 28 Q52 36 44 36" stroke="#2C1200" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      {/* Saucer */}
      <ellipse cx="26" cy="50" rx="20" ry="3.5" fill="#2C1200"/>
      <ellipse cx="26" cy="49" rx="16" ry="2.5" fill="#4D2800"/>
    </svg>
  );
}

export function MapView() {
  const mapRef = useRef<MapRef>(null);
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [focusedCity, setFocusedCity] = useState<string | null>(null);
  const [locating, setLocating] = useState<'idle' | 'loading' | 'denied'>("idle");
  const [mobileCityListOpen, setMobileCityListOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
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
    if (cityName) { setFocusedCity(cityName); setMobileCityListOpen(false); }
  }, []);

  const locateMe = useCallback(() => {
    if (!navigator.geolocation) { setLocating('denied'); return; }
    setLocating('loading');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const nearest = SEED_CITIES.reduce((best, city) => {
          const dist = Math.hypot(city.lat - coords.latitude, city.lng - coords.longitude);
          return dist < Math.hypot(best.lat - coords.latitude, best.lng - coords.longitude) ? city : best;
        });
        setLocating('idle');
        flyToCity(nearest.lat, nearest.lng, 12, nearest.name);
      },
      () => setLocating('denied')
    );
  }, [flyToCity]);

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

  const handleCafeSelect = useCallback((cafe: Cafe) => {
    setSelectedCafe(cafe);
    setFocusedCity(cafe.city);
    setMobileCityListOpen(false);
    mapRef.current?.flyTo({
      center: [cafe.lng, cafe.lat],
      zoom: 15,
      offset: isMobile ? [0, -80] : [-200, 0],
      duration: 1200,
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
          <div className="px-5 pt-5 pb-4 border-b border-grounds-brown/10">
            <div className="flex items-center gap-4">
              <CupIcon className="shrink-0" />
              <div className="flex-1 min-w-0">
                <h1 className="mb-2"><Logo variant="dark" size="md" showMark={false} /></h1>
                <p className="text-base font-semibold text-grounds-espresso leading-snug">The specialty coffee map for travelers.</p>
                <p className="text-sm text-grounds-brown/55 mt-1 leading-relaxed">Curated, scored, and editorially verified.</p>
                <div className="flex items-center gap-3 mt-2.5">
                  <p className="text-xs text-grounds-gold font-medium">{SEED_CAFES.length} cafés · {new Set(SEED_CAFES.map(c => c.city)).size} cities</p>
                  <Link href="/about" className="text-xs text-grounds-brown/40 hover:text-grounds-brown/70 transition-colors">About</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="px-4 py-3 border-b border-grounds-brown/10">
            <TravelerModeSearch onCitySelect={flyToCity} onCafeSelect={handleCafeSelect} variant="sidebar" />
          </div>
          {/* Location button — shown immediately when no city focused */}
          {!focusedCity && (
            <div className="px-4 pt-3 pb-1">
              <button
                onClick={locateMe}
                disabled={locating === 'loading'}
                className="w-full py-2 rounded-lg bg-grounds-gold/10 hover:bg-grounds-gold/20 border border-grounds-gold/20 hover:border-grounds-gold/40 text-grounds-gold text-xs font-medium transition-all disabled:opacity-50"
              >
                {locating === 'loading' ? 'Locating…' : '⌖ Use my location'}
              </button>
              {locating === 'denied' && (
                <p className="text-xs text-red-400 mt-1.5 text-center">Location blocked — enable it in your browser settings</p>
              )}
            </div>
          )}
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
          <div className="absolute top-0 left-0 right-0 z-20 bg-grounds-cream/95 backdrop-blur-sm border-b border-grounds-brown/10 px-4 pt-3 pb-2 safe-area-inset-top">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h1><Logo variant="dark" size="sm" /></h1>
                <p className="text-[11px] text-grounds-brown/55 font-medium tracking-wide mt-0.5">Specialty coffee for travelers</p>
              </div>
              <FilterBar filters={filters} onOpen={() => setFilterOpen(true)} />
            </div>
            <div className="mt-2">
              <TravelerModeSearch onCitySelect={flyToCity} onCafeSelect={handleCafeSelect} variant="mobile" />
            </div>
            {/* City chips — horizontal scroll */}
            <div className="flex gap-1.5 overflow-x-auto mt-2 -mx-1 px-1 pb-0.5 scrollbar-hide">
              {SEED_CITIES.slice().sort((a, b) => a.name.localeCompare(b.name)).map(city => (
                <button
                  key={city.id}
                  onClick={() => flyToCity(city.lat, city.lng, 12, city.name)}
                  className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-all whitespace-nowrap ${
                    focusedCity === city.name
                      ? "bg-grounds-gold/25 text-grounds-espresso border-grounds-gold/50 font-medium"
                      : "bg-grounds-brown/8 text-grounds-brown/70 border-grounds-brown/10"
                  }`}
                >
                  {city.name}
                </button>
              ))}
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
            evt.target.setProjection({ name: 'globe' });
            evt.target.setFog({
              'space-color': '#1a1a2e',
              'star-intensity': 0.15,
              'color': '#F5F0E8',
              'high-color': '#d4c9b8',
              'horizon-blend': 0.06,
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

        {/* Mobile: score legend — shown on global view before any city is focused */}
        {isMobile && !focusedCity && !selectedCafe && (
          <div className="absolute bottom-[88px] left-3 z-20">
            <ScoreLegend />
          </div>
        )}

        {/* Mobile: floating "Browse cafés" pill when city is focused */}
        {isMobile && focusedCity && !selectedCafe && !mobileCityListOpen && (
          <div className="absolute bottom-20 left-4 right-4 z-20">
            <button
              onClick={() => setMobileCityListOpen(true)}
              className="w-full py-3.5 bg-grounds-espresso text-grounds-cream rounded-2xl font-medium text-sm shadow-xl flex items-center justify-between px-5"
            >
              <span>{sidebarCafes.length} café{sidebarCafes.length !== 1 ? "s" : ""} in {focusedCity}</span>
              <span className="text-grounds-gold">↑ Browse</span>
            </button>
          </div>
        )}

        {/* Mobile: city cafe list bottom sheet */}
        {isMobile && mobileCityListOpen && (
          <BottomSheet onClose={() => setMobileCityListOpen(false)}>
            <div className="px-4 pt-1 pb-2 border-b border-grounds-brown/10 flex items-center justify-between">
              <p className="font-serif font-bold text-grounds-espresso">{focusedCity}</p>
              <p className="text-xs text-grounds-brown/50">{sidebarCafes.length} cafés</p>
            </div>
            <div className="overflow-y-auto">
              {sidebarCafes.map(cafe => (
                <div key={cafe.id} className="border-b border-grounds-brown/5 last:border-0">
                  <CafeCard
                    cafe={cafe}
                    onClick={() => {
                      setMobileCityListOpen(false);
                      handleMarkerClick(cafe);
                    }}
                    compact
                  />
                </div>
              ))}
              {sidebarCafes.length === 0 && (
                <p className="p-6 text-center text-sm text-grounds-brown/50">No cafés found with current filters.</p>
              )}
            </div>
          </BottomSheet>
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

const SCORE_TIERS = [
  { min: 85, label: 'Exceptional', color: '#22c55e' },
  { min: 70, label: 'Very Good',   color: '#C8972A' },
  { min: 55, label: 'Good',        color: '#f97316' },
  { min: 0,  label: 'Unrated',     color: '#94a3b8' },
] as const;

function ScoreLegend() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 bg-grounds-cream/92 backdrop-blur-sm rounded-full shadow-md px-3 py-1.5 border border-grounds-brown/10 active:scale-95 transition-transform"
        aria-label="Show score guide"
      >
        <span className="flex gap-0.5 items-center">
          {SCORE_TIERS.map(t => (
            <span key={t.min} className="w-2.5 h-2.5 rounded-full block" style={{ backgroundColor: t.color }} />
          ))}
        </span>
        <span className="text-[11px] text-grounds-brown/70 font-medium">What are these?</span>
      </button>
    );
  }

  return (
    <div className="bg-grounds-cream/96 backdrop-blur-sm rounded-2xl shadow-xl border border-grounds-brown/10 p-3 w-52">
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-xs font-semibold text-grounds-espresso">Grounds Score</p>
        <button
          onClick={() => setOpen(false)}
          className="text-grounds-brown/40 hover:text-grounds-brown text-sm leading-none px-1"
          aria-label="Close"
        >✕</button>
      </div>
      <div className="space-y-2">
        {SCORE_TIERS.map(({ min, label, color }, i) => {
          const next = SCORE_TIERS[i - 1];
          const range = next ? `${min}–${next.min - 1}` : `<${SCORE_TIERS[SCORE_TIERS.length - 2].min}`;
          const displayScore = min === 0 ? '40' : String(min);
          return (
            <div key={min} className="flex items-center gap-2.5">
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-[10px] shrink-0 shadow-sm"
                style={{ backgroundColor: color }}
              >{displayScore}</span>
              <div>
                <p className="text-[11px] font-semibold text-grounds-espresso leading-tight">{label}</p>
                <p className="text-[10px] text-grounds-brown/50 leading-tight">{min === 0 ? 'below 55' : `${min}+`} pts</p>
              </div>
            </div>
          );
        })}
      </div>
      <a href="/about/score" className="mt-2.5 pt-2 border-t border-grounds-brown/10 text-[10px] text-grounds-gold flex items-center gap-1 hover:underline">
        How scores are calculated →
      </a>
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
