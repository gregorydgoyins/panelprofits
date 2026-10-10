import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const CACHE_FILE = "/tmp/real_live_auctions.json";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const shouldRefresh = searchParams.get("refresh") === "true";

  try {
    let shouldRunScrape = shouldRefresh;

    if (!shouldRunScrape) {
      if (fs.existsSync(CACHE_FILE)) {
        const stats = fs.statSync(CACHE_FILE);
        const ageSec = (Date.now() - stats.mtimeMs) / 1000;
        if (ageSec > 120) {
          shouldRunScrape = true; // Auto-refresh if older than 2 minutes
        }
      } else {
        shouldRunScrape = true;
      }
    }

    if (shouldRunScrape) {
      // Execute AppleScript dump from active Safari session & parse live auctions
      const extractScript = path.resolve(process.cwd(), "scripts/extract_live_auctions.py");
      const safariScript = "/tmp/get_safari_source.scpt";
      
      if (!fs.existsSync(safariScript)) {
        fs.writeFileSync(
          safariScript,
          'tell application "Safari"\n  tell current tab of window 1\n    return source\n  end tell\nend tell\n'
        );
      }

      try {
        await execAsync(`osascript ${safariScript} > /tmp/live_safari.html && python3 "${extractScript}"`, {
          timeout: 15000,
        });
      } catch (err: unknown) {
        console.warn("Live Safari scrape background refresh note:", (err as Error)?.message || err);
      }
    }

    if (fs.existsSync(CACHE_FILE)) {
      const rawData = fs.readFileSync(CACHE_FILE, "utf-8");
      const auctions = JSON.parse(rawData);
      return NextResponse.json({
        success: true,
        count: auctions.length,
        auctions,
        source: "live_safari_ebay_stream",
        fetchedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      count: 0,
      auctions: [],
      source: "empty",
      fetchedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error("Live auctions route error:", error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error)?.message || "Failed to load live auctions",
        auctions: [],
      },
      { status: 500 }
    );
  }
}
