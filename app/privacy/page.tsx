import type { Metadata } from "next";
import { BRAND_NAME, BRAND_URL } from "@/lib/brand";
import Link from "next/link";

export const metadata: Metadata = {
  title: `Privacy Policy | ${BRAND_NAME}`,
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-grounds-cream">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Link href="/" className="text-grounds-gold hover:underline text-sm mb-8 block">← Back to map</Link>
        <h1 className="font-serif text-4xl font-bold text-grounds-espresso mb-2">Privacy Policy</h1>
        <p className="text-grounds-brown/50 text-sm mb-12">Last updated: May 2026</p>

        <div className="prose prose-sm max-w-none space-y-8 text-grounds-brown">
          <section>
            <h2 className="font-serif text-2xl font-bold text-grounds-espresso mb-3">1. Data We Collect</h2>
            <p>When you use Grounds, we may collect:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Usage data (pages visited, search queries) — via Google Analytics, if you consent</li>
              <li>Account data (email, display name) — only if you create an account</li>
              <li>Saved cafes — stored locally or in your account</li>
              <li>Submitted cafe listings — publicly attributed to your account username</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-grounds-espresso mb-3">2. Cookies</h2>
            <p>We use:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li><strong>Essential cookies</strong>: authentication session (always active)</li>
              <li><strong>Analytics cookies</strong>: Google Analytics (only with your consent)</li>
              <li><strong>Advertising cookies</strong>: Google AdSense (only with your consent, when active)</li>
            </ul>
            <p className="mt-2">You can withdraw consent at any time by clearing your browser storage for this site.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-grounds-espresso mb-3">3. Third-Party APIs</h2>
            <p>Grounds surfaces data from third-party sources. Their privacy policies apply to their data:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Google Places API — reviews fetched at request time, not stored</li>
              <li>Yelp Fusion API — reviews fetched at request time, not stored</li>
              <li>Foursquare API — data displayed with attribution, not stored</li>
              <li>Mapbox — map tile requests include your IP address (see Mapbox privacy policy)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-grounds-espresso mb-3">4. User Submissions</h2>
            <p>When you submit a cafe listing, you grant Grounds a non-exclusive license to display that information. We reserve the right to edit or remove submissions that violate our content guidelines.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-grounds-espresso mb-3">5. Your GDPR Rights (EU Users)</h2>
            <p>If you are in the European Union, you have the right to:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Access the personal data we hold about you</li>
              <li>Request deletion of your account and associated data</li>
              <li>Withdraw consent for analytics/advertising at any time</li>
              <li>Lodge a complaint with your local data protection authority</li>
            </ul>
            <p className="mt-2">To exercise these rights, email us at privacy@grounds.coffee</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-grounds-espresso mb-3">6. Data Retention</h2>
            <p>Account data is retained until you delete your account. Analytics data is retained for 14 months per Google Analytics default settings. Submitted listings may be retained indefinitely as part of our public database.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
