import { createHmac, timingSafeEqual } from "node:crypto";
export function getSniperSigningSecret(): string {
  return (
    process.env.SNIPER_AUTH_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "pp-sniper-server-gate-secret-v1"
  );
}

export function verifySniperSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const dotIdx = token.lastIndexOf(".");
  if (dotIdx <= 0) return false;
  const payload = token.slice(0, dotIdx);
  const providedSig = token.slice(dotIdx + 1);
  const expectedSig = createHmac("sha256", getSniperSigningSecret()).update(payload).digest("hex");
  try {
    const a = Buffer.from(providedSig, "hex");
    const b = Buffer.from(expectedSig, "hex");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }
  const exp = Number(payload.split(":")[1] || 0);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  return true;
}
