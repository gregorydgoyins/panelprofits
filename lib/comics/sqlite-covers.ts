let dbInstance: any = null;

function getSqliteDb() {
  if (typeof window !== "undefined") return null;
  if (dbInstance) return dbInstance;
  try {
    // eval('require') completely hides node native modules from webpack client bundle analysis
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
        const absPath = path.resolve(p);
        try {
          const uri = `file:${absPath}?mode=ro&immutable=1`;
          dbInstance = new DatabaseSync(uri, { readOnly: true });
        } catch (_) {
          dbInstance = new DatabaseSync(absPath, { readOnly: true });
        }
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
 * Retrieves authentic Supabase Storage WebP covers and verified GCS covers.
 * Strictly avoids Cloudflare 403 GCD hotlinks and broken 526.jpg placeholders.
 */
export function lookupSqliteCover(series: string, issueNumber: string | number): string | null {
  if (typeof window !== "undefined") return null;
  const db = getSqliteDb();
  if (!db) return null;
  try {
    const cleanSeries = String(series || "").replace(/^the\s+/i, "").trim();
    const cleanIssue = String(issueNumber || "1").replace(/^#/, "").trim();

    // 1. Try verified_equities (Audited 42k sovereign & market assets with authentic WebP covers)
    const ve = db.prepare(
      `SELECT cover_url FROM verified_equities 
       WHERE (series LIKE ? OR series LIKE ?) AND issue_number = ? 
       AND cover_url IS NOT NULL AND cover_url != ''
       LIMIT 1`
    ).get(cleanSeries, "%" + cleanSeries + "%", cleanIssue);

    if (ve && ve.cover_url && !ve.cover_url.includes("526.jpg") && !ve.cover_url.includes("files1.comics.org")) {
      return ve.cover_url;
    }

    // 2. Try highres_covers (Prioritizing high-resolution Supabase Storage WebP)
    const hr = db.prepare(
      `SELECT cover_url FROM highres_covers 
       WHERE (series LIKE ? OR series LIKE ?) AND issue_number = ? 
       AND cover_url NOT LIKE '%526.jpg%'
       AND cover_url NOT LIKE '%files1.comics.org%'
       ORDER BY CASE WHEN cover_url LIKE '%supabase.co%' THEN 0 ELSE 1 END 
       LIMIT 1`
    ).get(cleanSeries, "%" + cleanSeries + "%", cleanIssue);

    if (hr && hr.cover_url) {
      return hr.cover_url;
    }

    // 3. Try comics table (filtering out broken 526.jpg or files1.comics.org 403 links)
    const c = db.prepare(
      `SELECT cover_url FROM comics 
       WHERE (series LIKE ? OR series LIKE ?) AND issue_number = ? 
       AND cover_url NOT LIKE '%526.jpg%'
       AND cover_url NOT LIKE '%files1.comics.org%'
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
