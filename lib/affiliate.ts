// Affiliate link helper — appends affiliate tracking params to outbound links
// Wire up affiliate partner IDs when activating (currently pass-through)

export interface AffiliateLinks {
  beans_url?: string;
  gear_url?: string;
}

const AFFILIATE_PARAMS: Record<string, string> = {
  // Add partner IDs here when activating:
  // "stumptowncoffee.com": "ref=grounds&aff=001",
  // "bluebottlecoffee.com": "ref=grounds",
};

export function withAffiliateParams(url: string): string {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    const domain = parsed.hostname.replace("www.", "");
    const params = AFFILIATE_PARAMS[domain];
    if (params) {
      params.split("&").forEach(p => {
        const [key, val] = p.split("=");
        parsed.searchParams.set(key, val);
      });
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

export function buildShopLink(cafeSlug: string, type: "beans" | "gear"): string {
  // Placeholder — returns internal page until affiliate links are activated
  return `/cafe/${cafeSlug}#shop`;
}
