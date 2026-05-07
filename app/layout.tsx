import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { BRAND_NAME, BRAND_TAGLINE, BRAND_URL } from "@/lib/brand";
import { CookieConsent } from "@/components/ui/CookieConsent";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: { default: `${BRAND_NAME} — ${BRAND_TAGLINE}`, template: `%s | ${BRAND_NAME}` },
  description: "The world's curated specialty coffee map for travelers. Find the best 3rd wave cafés in Tokyo, Copenhagen, Melbourne, NYC, and beyond.",
  metadataBase: new URL(BRAND_URL),
  openGraph: {
    type: "website",
    siteName: BRAND_NAME,
    title: `${BRAND_NAME} — ${BRAND_TAGLINE}`,
    description: "Curated specialty coffee for curious travelers.",
    images: [{ url: "/og-default.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
  manifest: "/manifest.json",
  // Google AdSense — uncomment to activate (requires cookie consent check)
  // verification: { google: "YOUR_ADSENSE_ID" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#3D1F00",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192.png" />
        {/* Google AdSense — gated behind cookie consent, activate when ready:
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossOrigin="anonymous"></script>
        */}
      </head>
      <body className="font-sans antialiased">
        <CookieConsent />
        {children}
        <Footer />
        {/* Google Analytics — gated behind cookie consent, activate when ready:
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
        */}
      </body>
    </html>
  );
}
