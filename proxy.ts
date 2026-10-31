import { NextResponse, type NextRequest } from "next/server";
import { refreshSupabaseSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  request.headers.set("x-panel-profits-path", request.nextUrl.pathname);
  if (request.nextUrl.pathname.startsWith("/api/sniper/game")) {
    return refreshSupabaseSession(request);
  }

  // Public routes without an active user auth cookie do not need network auth refresh overhead.
  const hasAuthCookie = request.cookies.getAll().some((c) => c.name.startsWith("sb-") || c.name.includes("auth-token"));
  if (
    !hasAuthCookie ||
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname === "/equities" ||
    request.nextUrl.pathname === "/assets" ||
    request.nextUrl.pathname === "/market" ||
    request.nextUrl.pathname.startsWith("/comics") ||
    request.nextUrl.pathname === "/wiki" ||
    request.nextUrl.pathname.startsWith("/wiki/") ||
    request.nextUrl.pathname === "/api/mcp" ||
    request.nextUrl.pathname.startsWith("/api/mcp/") ||
    request.nextUrl.pathname === "/sniper" ||
    (request.nextUrl.pathname.startsWith("/api/sniper/") && !request.nextUrl.pathname.startsWith("/api/sniper/game"))
  ) {
    return NextResponse.next({ request });
  }
  return refreshSupabaseSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
