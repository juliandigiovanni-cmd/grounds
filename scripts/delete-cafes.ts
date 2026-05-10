import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const slugs = process.argv.slice(2);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function main() {
  const { error, count } = await supabase
    .from("cafes")
    .delete({ count: "exact" })
    .in("slug", slugs);
  console.log(error ? `ERROR: ${error.message}` : `Deleted ${count} cafes`);
}

main();
