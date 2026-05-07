export interface VerificationEmailData {
  cafeName: string;
  cafeSlug: string;
  cafeWebsite?: string;
  brandUrl: string;
}

export function buildVerificationEmail(data: VerificationEmailData): { subject: string; html: string; text: string } {
  const listingUrl = `${data.brandUrl}/cafe/${data.cafeSlug}`;

  const subject = `Quick check-in from Grounds — ${data.cafeName}`;

  const text = `
Hi ${data.cafeName} team,

We feature your café on Grounds (${data.brandUrl}) — a curated specialty
coffee map used by travelers worldwide.

We'd love to confirm your listing is still accurate. Could you check:
${listingUrl}

If anything needs updating, just reply to this email.

Thanks for being part of Grounds.
— The Grounds Team
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1A0A00; background: #F5F0E8;">
  <h2 style="font-size: 24px; margin-bottom: 8px;">Quick check-in from Grounds</h2>
  <p style="color: #666; margin-bottom: 24px;">The world's curated specialty coffee map</p>

  <p>Hi <strong>${data.cafeName}</strong> team,</p>

  <p>We feature your café on <a href="${data.brandUrl}" style="color: #C8972A;">Grounds</a> — a curated specialty coffee map used by travelers worldwide.</p>

  <p>We'd love to confirm your listing is still accurate. Could you take 30 seconds to check:</p>

  <a href="${listingUrl}" style="display: inline-block; background: #1A0A00; color: #F5F0E8; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
    View Your Listing →
  </a>

  <p>If anything needs updating (hours, address, brew methods), just reply to this email and we'll update it immediately.</p>

  <p>Thanks for being part of Grounds.</p>
  <p>— The Grounds Team</p>

  <hr style="border: none; border-top: 1px solid #ddd; margin: 32px 0;" />
  <p style="font-size: 12px; color: #999;">You're receiving this because your café is listed on <a href="${data.brandUrl}" style="color: #C8972A;">grounds.coffee</a>. To remove your listing, reply to this email.</p>
</body>
</html>
  `.trim();

  return { subject, html, text };
}
