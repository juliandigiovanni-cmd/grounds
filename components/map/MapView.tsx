"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Map, { Marker, NavigationControl, GeolocateControl, type MapRef } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAPBOX_TOKEN, MAP_DEFAULTS } from "@/lib/mapbox";
import { SEED_CAFES } from "@/lib/seed-data";
import { getScoreColor } from "@/lib/scoring";
import { CafeCard } from "@/components/cafe/CafeCard";
import { BottomSheet } from "@/components/cafe/BottomSheet";
import { TravelerModeSearch } from "@/components/ui/TravelerModeSearch";
import { BottomNav } from "@/components/ui/BottomNav";
import { SidePanel } from "@/components/cafe/SidePanel";
import { FilterButton } from "@/components/ui/FilterButton";
import { Logo } from "@/components/ui/Logo";
import Link from "next/link";
import type { Cafe } from "@/types";

export function MapView() {
  const mapRef = useRef<MapRef>(null);
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const flyToCity = useCallback((lat: number, lng: number, zoom = 12) => {
    mapRef.current?.flyTo({ center: [lng, lat], zoom, duration: 1800, essential: true });
  }, []);

  const handleMarkerClick = useCallback((cafe: Cafe, e: React.MouseEvent) => {
    e.stopPropagation();
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
          <div className="p-4 border-b border-grounds-brown/10">
            <h1 className="mb-0.5"><Logo variant="dark" size="md" /></h1>
            <p className="text-sm text-grounds-brown/70 mt-0.5">Find great coffee, anywhere.</p>
            <p className="text-xs text-grounds-gold mt-1">{SEED_CAFES.filter(c => !c.google_place_id).length} cafés you won&apos;t find anywhere else</p>
            <Link href="/about" className="text-xs text-grounds-brown/40 hover:text-grounds-brown/70 mt-1 block">About Grounds</Link>
          </div>
          <div className="p-4">
            <TravelerModeSearch onCitySelect={flyToCity} variant="sidebar" />
          </div>
          <div className="flex-1 overflow-y-auto">
            {SEED_CAFES.slice(0, 10).map(cafe => (
              <div key={cafe.id} className="border-b border-grounds-brown/5 last:border-0">
                <CafeCard
                  cafe={cafe}
                  onClick={() => {
                    setSelectedCafe(cafe);
                    flyToCity(cafe.lat, cafe.lng, 15);
                  }}
                  compact
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Map */}
      <div className="flex-1 relative">
        {/* Mobile top bar */}
        {isMobile && (
          <div className="absolute top-0 left-0 right-0 z-20 bg-grounds-cream/95 backdrop-blur-sm border-b border-grounds-brown/10 px-4 py-3 safe-area-inset-top">
            <div className="flex items-center gap-2">
              <h1 className="mr-2"><Logo variant="dark" size="sm" /></h1>
              <div className="flex-1">
                <TravelerModeSearch onCitySelect={flyToCity} variant="mobile" />
              </div>
              <FilterButton />
            </div>
          </div>
        )}

        <Map
          ref={mapRef}
          mapboxAccessToken={MAPBOX_TOKEN}
          initialViewState={MAP_DEFAULTS.initialViewState}
          style={{ width: "100%", height: "100%" }}
          mapStyle={MAP_DEFAULTS.style}
          onLoad={() => setMapLoaded(true)}
          onClick={handleMapClick}
          reuseMaps
        >
          {mapLoaded && SEED_CAFES.map(cafe => (
            <Marker
              key={cafe.id}
              longitude={cafe.lng}
              latitude={cafe.lat}
              anchor="bottom"
              onClick={(e) => handleMarkerClick(cafe, e as unknown as React.MouseEvent)}
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
          <div className="absolute top-4 left-4 right-4 z-10 flex gap-2">
            <FilterButton />
          </div>
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
