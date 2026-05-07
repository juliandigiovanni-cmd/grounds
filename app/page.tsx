import { MapView } from "@/components/map/MapView";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${BRAND_NAME} — ${BRAND_TAGLINE}`,
};

export default function HomePage() {
  return (
    <main className="relative w-full" style={{ height: "100dvh" }}>
      <MapView />
    </main>
  );
}
