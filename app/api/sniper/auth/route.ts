import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSniperSigningSecret, verifySniperSessionToken } from "@/lib/sniper/session";

export const dynamic = "force-dynamic";

const COOKIE_NAME = "pp_sniper_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours


function getAllowedPasscodes(): string[] {
  const configured = process.env.SNIPER_PASSCODES;
  if (configured && configured.trim().length > 0) {
    return configured
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  }
  return ["cgc98", "sniper2026", "panelprofits", "admin"];
}

function signToken(payload: string): string {
  const sig = createHmac("sha256", getSniperSigningSecret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}


export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return NextResponse.json({ authenticated: verifySniperSessionToken(token) });
}

export async function POST(req: Request) {
  let body: { passcode?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ authenticated: false, error: "Invalid request body." }, { status: 400 });
  }

  const normalized = String(body.passcode || "").trim().toLowerCase();
  const allowed = getAllowedPasscodes();
  const matched = allowed.some((candidate) => {
    const a = Buffer.from(normalized);
    const b = Buffer.from(candidate);
    return a.length === b.length && timingSafeEqual(a, b);
  });

  if (!matched) {
    return NextResponse.json(
      { authenticated: false, error: "Access denied. Invalid executive passcode." },
      { status: 401 }
    );
  }

  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const token = signToken(`sniper:${expiresAt}`);
  const res = NextResponse.json({ authenticated: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ authenticated: false });
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}
