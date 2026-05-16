import dynamic from "next/dynamic";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${BRAND_NAME} — ${BRAND_TAGLINE}`,
};

const MapView = dynamic(
  () => import("@/components/map/MapView").then(m => ({ default: m.MapView })),
  { ssr: false }
);

export default function HomePage() {
  return (
    <main className="relative w-full" style={{ height: "100dvh" }}>
      <MapView />
    </main>
  );
}
