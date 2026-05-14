import { SEED_CAFES, SEED_CITIES } from "@/lib/seed-data";
import { BRAND_NAME } from "@/lib/brand";
import { ScoreBadge } from "@/components/map/ScoreBadge";
import { DirectionsButton } from "@/components/cafe/DirectionsButton";
import { FeaturedBadges } from "@/components/ui/FeaturedBadges";
import { ClosedBanner } from "@/components/cafe/ClosedBanner";
import { VerificationPrompt } from "@/components/cafe/VerificationPrompt";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamicParams = false;

export async function generateStaticParams() {
  return SEED_CAFES.map(c => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const cafe = SEED_CAFES.find(c => c.slug === params.slug);
  if (!cafe) return { title: "Cafe Not Found" };
  return {
    title: `${cafe.name} — Best 3rd Wave Coffee in ${cafe.city} | ${BRAND_NAME}`,
    description: cafe.editorial_blurb,
    openGraph: {
      images: [{
        url: `/api/og?title=${encodeURIComponent(cafe.name)}&subtitle=${encodeURIComponent(cafe.editorial_blurb.slice(0, 60))}&score=${cafe.third_wave_score}&city=${encodeURIComponent(cafe.city)}`,
        width: 1200,
        height: 630,
      }],
    },
  };
}

export default function CafePage({ params }: { params: { slug: string } }) {
  const cafe = SEED_CAFES.find(c => c.slug === params.slug);
  if (!cafe) notFound();

  const citySlug = SEED_CITIES.find(c => c.name === cafe.city)?.slug;

  return (
    <div className="min-h-screen bg-grounds-cream">
      <header className="bg-grounds-espresso text-grounds-cream px-6 py-4 flex items-center gap-4">
        <Link href={citySlug ? `/city/${citySlug}` : "/"} className="text-grounds-cream/70 hover:text-grounds-cream">← Map</Link>
        <h1 className="font-serif text-xl font-bold">{cafe.name}</h1>
      </header>
      <div className="max-w-2xl mx-auto px-6 py-8">
        {cafe.permanently_closed === true && (
          <ClosedBanner closureDate={cafe.closure_reported_at} />
        )}
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h2 className="font-serif text-3xl font-bold text-grounds-espresso">{cafe.name}</h2>
              <ScoreBadge score={cafe.third_wave_score ?? 0} size="lg" />
            </div>
            <p className="text-grounds-brown/60">{cafe.address}</p>
          </div>
        </div>
        <blockquote className="border-l-4 border-grounds-gold pl-4 italic text-grounds-brown/80 mb-6">
          {cafe.editorial_blurb}
        </blockquote>
        {cafe.featured_in.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-grounds-brown/60 uppercase tracking-wide mb-2">As Seen In</h3>
            <FeaturedBadges featured={cafe.featured_in} />
          </div>
        )}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-grounds-brown/60 uppercase tracking-wide mb-2">Brew Methods</h3>
          <div className="flex flex-wrap gap-2">
            {cafe.brew_methods.map(m => (
              <span key={m} className="bg-grounds-brown/10 text-grounds-brown px-3 py-1 rounded-full text-sm capitalize">{m.replace(/-/g, " ")}</span>
            ))}
          </div>
        </div>
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-grounds-brown/60 uppercase tracking-wide mb-2">Vibe</h3>
          <div className="flex flex-wrap gap-2">
            {cafe.vibe_tags.map(t => (
              <span key={t} className="bg-grounds-sage/10 text-grounds-sage px-3 py-1 rounded-full text-sm capitalize">{t.replace(/-/g, " ")}</span>
            ))}
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          <DirectionsButton cafe={cafe} />
          {cafe.website && (
            <a href={cafe.website} target="_blank" rel="noopener noreferrer"
              className="text-sm text-grounds-gold font-medium hover:underline flex items-center gap-1">
              Website ↗
            </a>
          )}
        </div>
        <VerificationPrompt cafeId={cafe.id} lastVerifiedAt={cafe.last_verified_at} />
        {/* Buy their beans — reserved for affiliate activation */}
        <div className="mt-8 p-4 border border-dashed border-grounds-brown/20 rounded-xl text-center text-grounds-brown/40 text-sm">
          Buy their beans — coming soon
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CafeOrCoffeeShop",
            name: cafe.name,
            address: {
              "@type": "PostalAddress",
              streetAddress: cafe.address,
              addressLocality: cafe.city,
              addressCountry: cafe.country,
            },
            geo: {
              "@type": "GeoCoordinates",
              latitude: cafe.lat,
              longitude: cafe.lng,
            },
            url: cafe.website,
            aggregateRating: cafe.overall_rating ? {
              "@type": "AggregateRating",
              ratingValue: cafe.overall_rating.toFixed(1),
              reviewCount: cafe.review_count,
              bestRating: "5",
            } : undefined,
          }),
        }}
      />
    </div>
  );
}
