import type { Metadata } from "next";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `For Cafés | ${BRAND_NAME}`,
  alternates: { canonical: "/for-cafes" },
};

export default function ForCafesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
