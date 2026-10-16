import { NextResponse, type NextRequest } from "next/server";
import { refreshSupabaseSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  request.headers.set("x-panel-profits-path", request.nextUrl.pathname);
  // This page has its own Sniper gate; render it without a Supabase round trip.
  // API routes still run their existing session refresh and server-side checks.
  if (request.nextUrl.pathname === "/sniper") return NextResponse.next({ request });
  return refreshSupabaseSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
