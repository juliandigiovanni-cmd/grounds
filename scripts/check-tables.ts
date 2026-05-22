import { createServerClient } from '../lib/supabase';

async function main() {
  const sb = createServerClient();
  const { error: e1 } = await sb.from('newsletter_subscribers').select('id').limit(1);
  console.log('newsletter_subscribers:', e1 ? 'MISSING — ' + e1.message : 'OK');
  const { error: e2 } = await sb.from('advertiser_inquiries').select('id').limit(1);
  console.log('advertiser_inquiries:', e2 ? 'MISSING — ' + e2.message : 'OK');
  const { error: e3 } = await sb.from('verified_waitlist').select('id').limit(1);
  console.log('verified_waitlist:', e3 ? 'MISSING — ' + e3.message : 'OK');
}
main();
