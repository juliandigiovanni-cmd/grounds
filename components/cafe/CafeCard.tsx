"use client";

import { Cafe } from "@/types";
import { ScoreBadge } from "@/components/map/ScoreBadge";
import { DirectionsButton } from "@/components/cafe/DirectionsButton";
import { FeaturedBadges } from "@/components/ui/FeaturedBadges";
import { ReportButton } from "@/components/ui/ReportButton";
import { GroundsExclusiveBadge } from "@/components/ui/GroundsExclusiveBadge";
import { VerificationPrompt } from "@/components/cafe/VerificationPrompt";
import { SponsoredBadge } from "@/components/cafe/SponsoredBadge";
import { withAffiliateParams } from "@/lib/affiliate";
import Link from "next/link";

interface Props {
  cafe: Cafe;
  onClick?: () => void;
  compact?: boolean;
}

export function CafeCard({ cafe, onClick, compact = false }: Props) {
  const verifiedDate = cafe.last_verified_at
    ? new Date(cafe.last_verified_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : null;

  const isRecentlyVerified = (() => {
    if (!cafe.last_verified_at) return false;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return new Date(cafe.last_verified_at) >= sixMonthsAgo;
  })();

  return (
    <div
      className={`${onClick ? "cursor-pointer hover:bg-grounds-cream/60" : ""} ${compact ? "p-3" : "p-4"} transition-colors`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`font-serif font-bold text-grounds-espresso truncate ${compact ? "text-base" : "text-lg"}`}>
              {cafe.name}
            </h3>
            <ScoreBadge score={cafe.third_wave_score ?? 0} size={compact ? "sm" : "md"} />
            <span className="text-sm" title="Specialty coffee">☕</span>
            {cafe.sponsored && <SponsoredBadge />}
          </div>
          <p className="text-xs text-grounds-brown/60 mt-0.5">
            {cafe.city}, {cafe.country}
          </p>
          {!compact && (
            <p className="text-sm text-grounds-brown/80 mt-2 leading-relaxed italic">
              &ldquo;{cafe.editorial_blurb}&rdquo;
            </p>
          )}
        </div>
      </div>

      {!compact && (
        <>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {cafe.brew_methods.slice(0, 3).map(method => (
              <span key={method} className="text-xs bg-grounds-brown/10 text-grounds-brown px-2 py-0.5 rounded-full capitalize">
                {method.replace(/-/g, " ")}
              </span>
            ))}
            {cafe.vibe_tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-xs bg-grounds-sage/10 text-grounds-sage px-2 py-0.5 rounded-full capitalize">
                {tag.replace(/-/g, " ")}
              </span>
            ))}
          </div>

          {cafe.featured_in.length > 0 && (
            <div className="mt-2">
              <FeaturedBadges featured={cafe.featured_in} />
            </div>
          )}

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <DirectionsButton cafe={cafe} />
            <Link
              href={`/cafe/${cafe.slug}`}
              className="text-sm text-grounds-gold font-medium hover:underline"
              onClick={e => e.stopPropagation()}
            >
              Full profile →
            </Link>
            <span className="ml-auto flex items-center gap-1.5 flex-wrap justify-end">
              {!cafe.google_place_id && <GroundsExclusiveBadge />}
              <span className="flex items-center gap-1 text-xs">
                <span
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${verifiedDate ? (isRecentlyVerified ? "bg-green-500" : "bg-amber-400") : "bg-grounds-brown/30"}`}
                />
                <span className="text-grounds-brown/40">
                  {verifiedDate ? `Verified ${verifiedDate}` : "Unverified"}
                </span>
              </span>
            </span>
          </div>
          <div className="mt-2">
            <ReportButton cafeId={cafe.id} cafeName={cafe.name} />
          </div>
          <VerificationPrompt cafeId={cafe.id} lastVerifiedAt={cafe.last_verified_at} />
          {cafe.affiliate_links?.beans_url && (
            <div className="mt-3 pt-3 border-t border-grounds-brown/10">
              <a
                href={withAffiliateParams(cafe.affiliate_links.beans_url)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="text-sm text-grounds-gold font-medium hover:underline flex items-center gap-1"
              >
                ☕ Buy their beans →
              </a>
            </div>
          )}
        </>
      )}

      {compact && (
        <p className="text-xs text-grounds-brown/60 mt-1 truncate italic">{cafe.editorial_blurb}</p>
      )}
    </div>
  );
}
