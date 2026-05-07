// Supabase Edge Function — runs on weekly cron
// Checks Google Places API business_status for each cafe with a google_place_id
// If CLOSED_PERMANENTLY: sets permanently_closed=true, sends admin alert
// If CLOSED_TEMPORARILY: sets a temporary closure flag

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GOOGLE_API_KEY = Deno.env.get("GOOGLE_PLACES_API_KEY")!;
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") ?? "admin@grounds.coffee";

Deno.serve(async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Fetch cafes with a Google Place ID that aren't already marked closed
  const { data: cafes, error } = await supabase
    .from("cafes")
    .select("id, name, google_place_id, city")
    .not("google_place_id", "is", null)
    .eq("permanently_closed", false);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const results = { checked: 0, closed_permanently: 0, closed_temporarily: 0, errors: 0 };

  for (const cafe of cafes ?? []) {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${cafe.google_place_id}&fields=business_status&key=${GOOGLE_API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      const status = data.result?.business_status;
      results.checked++;

      if (status === "CLOSED_PERMANENTLY") {
        await supabase
          .from("cafes")
          .update({
            permanently_closed: true,
            closure_reported_at: new Date().toISOString(),
            verified: false,
          })
          .eq("id", cafe.id);

        // Send admin alert via Supabase email (configure SMTP in Supabase dashboard)
        await fetch(`${SUPABASE_URL}/functions/v1/send-admin-alert`, {
          method: "POST",
          headers: { Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            subject: `[Grounds] Cafe permanently closed: ${cafe.name}`,
            body: `${cafe.name} in ${cafe.city} has been marked CLOSED_PERMANENTLY by Google Places. Review at /admin/flags.`,
          }),
        }).catch(() => {}); // Non-blocking

        results.closed_permanently++;
      } else if (status === "CLOSED_TEMPORARILY") {
        await supabase
          .from("cafes")
          .update({ flagged: true, flag_reason: "Temporarily closed per Google Places" })
          .eq("id", cafe.id);
        results.closed_temporarily++;
      }
    } catch {
      results.errors++;
    }
  }

  return new Response(JSON.stringify(results), {
    headers: { "Content-Type": "application/json" },
  });
});

// Suppress unused variable warning — ADMIN_EMAIL used when wiring send-admin-alert
void ADMIN_EMAIL;
