/**
 * Reads a graded slab's own label from the listing photo. Everything returned is transcribed from the
 * label as printed (cert number, title, issue, date, publisher, grade, edition); a field that is not
 * legible is null. Nothing is inferred, so a null means "not read", never a guess.
 */
export interface SlabLabel {
  grader: "CGC" | "CBCS" | "PGX" | "EGS" | "PSA" | "OTHER" | null;
  certNumber: string | null;
  title: string | null;
  issueNumber: string | null;
  /** Cover date exactly as printed, e.g. "5/86". */
  issueDate: string | null;
  publisher: string | null;
  grade: number | null;
  /** Edition/variant line printed on the label (e.g. "ComicXposure Edition"); null when the label has none. */
  edition: string | null;
  labelType: string | null;
  pageQuality: string | null;
}

const MODEL = "gemini-flash-latest";

const PROMPT = `You are reading the label at the top of a graded comic book slab (CGC, CBCS, PGX, EGS or similar).
Transcribe ONLY what is printed on the label. If a field is not visible or not legible, return null. Never infer or guess.
Return JSON with exactly these keys:
grader (CGC|CBCS|PGX|EGS|PSA|OTHER), certNumber (digits only, from the printed number or barcode), title (series title exactly as printed),
issueNumber (the number after #, as printed), issueDate (cover date exactly as printed, like 5/86), publisher (exactly as printed),
grade (number like 9.6), edition (the extra edition/variant text line on the label such as "ComicXposure Edition" or "Canadian Price Variant"; null if the label has no such line),
labelType (Universal, Signature Series, Restored, Qualified, etc., as printed in the label header), pageQuality (e.g. White Pages).`;

export async function readSlabLabel(imageUrl: string, apiKey = process.env.GEMINI_API_KEY): Promise<SlabLabel | null> {
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  const img = await fetch(imageUrl, { headers: { "user-agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(15000) });
  if (!img.ok) return null;
  const mime = img.headers.get("content-type")?.split(";")[0] || "image/jpeg";
  const data = Buffer.from(await img.arrayBuffer()).toString("base64");

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
    signal: AbortSignal.timeout(30000),
    body: JSON.stringify({
      contents: [{ parts: [{ text: PROMPT }, { inline_data: { mime_type: mime, data } }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0 },
    }),
  });
  if (!res.ok) throw new Error(`gemini ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;
  const o = JSON.parse(text);
  const s = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
  const grade = typeof o.grade === "number" ? o.grade : parseFloat(String(o.grade ?? ""));
  return {
    grader: s(o.grader) as SlabLabel["grader"],
    certNumber: s(o.certNumber)?.replace(/\D/g, "") || null,
    title: s(o.title),
    issueNumber: s(o.issueNumber)?.replace(/^#/, "") ?? null,
    issueDate: s(o.issueDate),
    publisher: s(o.publisher),
    grade: Number.isFinite(grade) ? grade : null,
    edition: s(o.edition),
    labelType: s(o.labelType),
    pageQuality: s(o.pageQuality),
  };
}
