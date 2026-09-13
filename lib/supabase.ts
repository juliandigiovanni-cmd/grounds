import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy singleton: createClient() only runs on first real use, not at module import time.
// Next.js imports every route module during build (page-data collection), in every
// environment — evaluating createClient() eagerly here meant a missing env var (e.g. no
// Preview-scoped Supabase vars) crashed the whole build, not just requests to routes that
// actually need it.
let _client: SupabaseClient | undefined;
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    if (!_client) {
      _client = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
    }
    return Reflect.get(_client, prop, receiver);
  },
});

export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
}
