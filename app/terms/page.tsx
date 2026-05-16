import type { Metadata } from "next";
import { BRAND_NAME } from "@/lib/brand";
import Link from "next/link";

export const metadata: Metadata = {
  title: `Terms of Use | ${BRAND_NAME}`,
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-grounds-cream">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Link href="/" className="text-grounds-gold hover:underline text-sm mb-8 block">← Back to map</Link>
        <h1 className="font-serif text-4xl font-bold text-grounds-espresso mb-2">Terms of Use</h1>
        <p className="text-grounds-brown/50 text-sm mb-12">Last updated: May 2026</p>

        <div className="prose prose-sm max-w-none space-y-8 text-grounds-brown">
          <section>
            <h2 className="font-serif text-2xl font-bold text-grounds-espresso mb-3">1. Acceptance</h2>
            <p>By using Know your Grounds, you agree to these terms. If you disagree, please stop using the service.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-grounds-espresso mb-3">2. User-Submitted Content</h2>
            <p>When you submit a cafe listing or review, you:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Grant Know your Grounds a perpetual, royalty-free license to display and distribute your submission</li>
              <li>Confirm the information is accurate to the best of your knowledge</li>
              <li>Agree not to submit spam, malicious content, or content you don&apos;t have rights to</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-grounds-espresso mb-3">3. No Warranty on Cafe Data</h2>
            <p>Know your Grounds makes no warranty that cafe information (hours, addresses, quality scores) is accurate, complete, or current. Coffee shops open, close, and change — always verify before traveling. We are not liable for any loss arising from reliance on our data.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-grounds-espresso mb-3">4. The Grounds Score</h2>
            <p>The Grounds Score is an editorial tool, not a guarantee of quality. Scores reflect our curation criteria and are subject to change. Cafes do not pay for scores.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-grounds-espresso mb-3">5. DMCA / Copyright</h2>
            <p>If you believe content on Know your Grounds infringes your copyright, contact us at dmca@knowyourgrounds.com with a description of the content and your ownership claim. We will respond within 10 business days.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-grounds-espresso mb-3">6. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Know your Grounds is not liable for any indirect, incidental, or consequential damages arising from use of this service.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-grounds-espresso mb-3">7. Changes</h2>
            <p>We may update these terms. Continued use of Know your Grounds after changes constitutes acceptance of the new terms.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
