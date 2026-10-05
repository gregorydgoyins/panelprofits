let dbInstance: any = null;

function getSqliteDb() {
  if (typeof window !== "undefined") return null;
  if (dbInstance) return dbInstance;
  try {
    // eval('require') completely hides node native modules from webpack client bundle analysis
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const req = eval("require");
    const fs = req("fs");
    const path = req("path");
    const { DatabaseSync } = req("node:sqlite");

    const candidates = [
      path.join(process.cwd(), "data", "pp115k.sqlite"),
      path.join(process.cwd(), "panel-profits", "data", "pp115k.sqlite"),
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) {
        dbInstance = new DatabaseSync(p);
        return dbInstance;
      }
    }
  } catch (err) {
    console.warn("node:sqlite bypassed in current execution environment:", err);
  }
  return null;
}

/**
 * High-speed authoritative cover lookup from the 115k catalog SQLite index.
 * Retrieves authentic Supabase Storage WebP covers and verified GCD covers.
 */
export function lookupSqliteCover(series: string, issueNumber: string | number): string | null {
  if (typeof window !== "undefined") return null;
  const db = getSqliteDb();
  if (!db) return null;
  try {
    const cleanSeries = String(series || "").replace(/^the\s+/i, "").trim();
    const cleanIssue = String(issueNumber || "1").replace(/^#/, "").trim();

    // 1. Try highres_covers (Prioritizing high-resolution Supabase Storage WebP)
    const hr = db.prepare(
      `SELECT cover_url FROM highres_covers 
       WHERE (series LIKE ? OR series LIKE ?) AND issue_number = ? 
       ORDER BY CASE WHEN cover_url LIKE '%supabase.co%' THEN 0 ELSE 1 END 
       LIMIT 1`
    ).get(cleanSeries, "%" + cleanSeries + "%", cleanIssue);

    if (hr && hr.cover_url) {
      return hr.cover_url;
    }

    // 2. Try comics table (GCD & ComicBase authoritative covers)
    const c = db.prepare(
      `SELECT cover_url FROM comics 
       WHERE (series LIKE ? OR series LIKE ?) AND issue_number = ? 
       LIMIT 1`
    ).get(cleanSeries, "%" + cleanSeries + "%", cleanIssue);

    if (c && c.cover_url) {
      return c.cover_url;
    }
  } catch (e) {
    console.warn("Sqlite cover lookup error:", e);
  }
  return null;
}
