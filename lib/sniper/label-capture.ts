import { readSlabLabel } from "./label-reader";

/**
 * Reads the slab label from the photo of listings that have not been read yet and stores the exact
 * transcription on sniper_listings.label. `label_at` is set even when nothing was legible, so an
 * unreadable photo is never retried in a loop. No eBay API calls are made.
 */
export async function captureLabels(db: any, limit = 30, concurrency = 6): Promise<{ read: number; legible: number; failed: number }> {
  if (!process.env.GEMINI_API_KEY) return { read: 0, legible: 0, failed: 0 };
  const { data } = await db
    .from("sniper_listings")
    .select("item_id,image_url")
    .eq("status", "live")
    .is("label_at", null)
    .not("image_url", "is", null)
    .order("first_seen", { ascending: false })
    .limit(limit);
  const rows: Array<{ item_id: string; image_url: string }> = data ?? [];
  let legible = 0;
  let failed = 0;
  let i = 0;
  const worker = async () => {
    while (i < rows.length) {
      const r = rows[i++];
      try {
        const label = await readSlabLabel(r.image_url);
        const ok = Boolean(label && (label.certNumber || label.title));
        if (ok) legible++;
        await db
          .from("sniper_listings")
          .update({ label: ok ? label : null, label_at: new Date().toISOString(), census_at: null, ...(ok && label!.certNumber ? { cert_number: label!.certNumber } : {}) })
          .eq("item_id", r.item_id);
      } catch (e) {
        failed++; // transient (network/quota): leave label_at null so it is retried next run
        console.error("[sniper] label read failed:", (e as Error).message);
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, rows.length) }, worker));
  return { read: rows.length - failed, legible, failed };
}
