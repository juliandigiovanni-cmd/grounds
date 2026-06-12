import type { Metadata } from "next";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Submit a Café | ${BRAND_NAME}`,
  alternates: { canonical: "/submit" },
};

export default function SubmitLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
