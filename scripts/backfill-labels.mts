import { createClient } from "@supabase/supabase-js";
import { captureLabels } from "./lib/sniper/label-capture";
const db: any = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
for (let n = 0; n < 40; n++) {
  const r = await captureLabels(db, 60, 8);
  console.log(n, r);
  if (r.read + r.failed === 0) break;
}
