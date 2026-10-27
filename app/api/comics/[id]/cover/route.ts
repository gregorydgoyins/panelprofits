import { NextResponse } from "next/server";
import { createCleanReadOnlyServerClient } from "@/lib/supabase/admin";
import { resolveComicCover, generateDynamicCoverSvg } from "@/lib/comics/cover-resolver";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return new NextResponse("Comic ID required", { status: 400 });
  }

  const cleanId = id.trim();
  const db = createCleanReadOnlyServerClient();

  const { data: comic, error } = await db
    .from("pp_comics")
    .select(
      "id,series,issue_number,publication_year,cover_url,gcd_source_id"
    )
    .eq("id", cleanId)
    .maybeSingle();

  if (error || !comic) {
    // If not found in database, return dynamic generic badge SVG
    const svgData = generateDynamicCoverSvg("Unknown Comic", "—", "Panel Profits", null);
    const svgContent = decodeURIComponent(svgData.replace("data:image/svg+xml;utf8,", ""));
    return new NextResponse(svgContent, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  }

  const resolved = resolveComicCover(comic);

  if (resolved.isFallback) {
    // Return SVG directly with SVG content-type
    const svgContent = decodeURIComponent(resolved.url.replace("data:image/svg+xml;utf8,", ""));
    return new NextResponse(svgContent, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  }

  // Redirect to resolved CDN / storage URL
  return NextResponse.redirect(resolved.url, {
    status: 307,
    headers: {
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
