import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DEFAULT_LOCAL_PATHS = [
  process.env.COMICBASE_MEDIA_PATH,
  "/Users/macuser/Downloads/Media",
  path.join(process.cwd(), "media"),
  path.join(process.cwd(), "public", "media", "comicbase"),
].filter(Boolean) as string[];

const MEDIA_ROOT = DEFAULT_LOCAL_PATHS.find((p) => fs.existsSync(p)) || "/Users/macuser/Downloads/Media";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await props.params;
  if (!slug || !slug.length) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const filePath = path.normalize(path.join(MEDIA_ROOT, ...slug));

  // Security check: ensure path is within MEDIA_ROOT
  if (!filePath.startsWith(MEDIA_ROOT) || !fs.existsSync(filePath)) {
    return new NextResponse("Video Not Found", { status: 404 });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.get("range");

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const fileStream = fs.createReadStream(filePath, { start, end });

    // Node readable to Web ReadableStream
    const readable = new ReadableStream({
      start(controller) {
        fileStream.on("data", (chunk) => controller.enqueue(chunk));
        fileStream.on("end", () => controller.close());
        fileStream.on("error", (err) => controller.error(err));
      },
    });

    return new NextResponse(readable, {
      status: 206,
      headers: {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": String(chunksize),
        "Content-Type": "video/mp4",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } else {
    const fileStream = fs.createReadStream(filePath);
    const readable = new ReadableStream({
      start(controller) {
        fileStream.on("data", (chunk) => controller.enqueue(chunk));
        fileStream.on("end", () => controller.close());
        fileStream.on("error", (err) => controller.error(err));
      },
    });

    return new NextResponse(readable, {
      status: 200,
      headers: {
        "Content-Length": String(fileSize),
        "Content-Type": "video/mp4",
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  }
}
