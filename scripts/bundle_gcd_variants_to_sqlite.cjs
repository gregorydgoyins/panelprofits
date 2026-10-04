const { DatabaseSync } = require("node:sqlite");
const fs = require("fs");
const path = require("path");

const gcdPath = "/Users/macuser/Downloads/gcd-full-As1Act/2026-09-15.db";
const targetPath = path.join(process.cwd(), "data", "pp115k.sqlite");

console.log("Starting GCD variant & foreign edition bundling into", targetPath);

const gcdDb = new DatabaseSync(gcdPath, { readOnly: true });
const targetDb = new DatabaseSync(targetPath);

targetDb.exec("PRAGMA synchronous = OFF; PRAGMA journal_mode = MEMORY;");

// Get all distinct gcd_ids from pp115k.sqlite
const gcdIdsRows = targetDb.prepare("SELECT DISTINCT gcd_id FROM comics WHERE gcd_id IS NOT NULL AND gcd_id != ''").all();
console.log(`Found ${gcdIdsRows.length} distinct gcd_ids in catalog.`);

const issueIdSet = new Set();
for (const r of gcdIdsRows) {
  const n = parseInt(r.gcd_id, 10);
  if (!isNaN(n)) issueIdSet.add(n);
}

// Also get the base IDs for these issues
const baseIdSet = new Set(issueIdSet);
console.log("Resolving base issue IDs...");
for (const id of issueIdSet) {
  const row = gcdDb.prepare("SELECT variant_of_id FROM gcd_issue WHERE id = ?").get(id);
  if (row && row.variant_of_id) {
    baseIdSet.add(row.variant_of_id);
  }
}
console.log(`Resolved ${baseIdSet.size} total base and variant issue IDs.`);

const insertVariant = targetDb.prepare(`
  INSERT OR REPLACE INTO gcd_variants (base_issue_id, variant_issue_id, number, publication_date, variant_name, price, barcode)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const insertForeign = targetDb.prepare(`
  INSERT OR REPLACE INTO gcd_foreign_editions (reprint_id, origin_issue_id, target_issue_id, number, series_name, country, language, publication_date)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

targetDb.exec("BEGIN TRANSACTION;");

let varCount = 0;
let forCount = 0;
let processed = 0;

for (const baseId of baseIdSet) {
  processed++;
  if (processed % 5000 === 0) {
    console.log(`Processed ${processed}/${baseIdSet.size} issues... (Variants: ${varCount}, Foreign: ${forCount})`);
  }

  // 1. Get variants
  const variants = gcdDb.prepare(`
    SELECT id, number, publication_date, variant_name, price, barcode
    FROM gcd_issue
    WHERE variant_of_id = ? OR id = ?
  `).all(baseId, baseId);

  for (const v of variants) {
    insertVariant.run(
      baseId,
      v.id,
      String(v.number || ""),
      String(v.publication_date || ""),
      String(v.variant_name || ""),
      String(v.price || ""),
      String(v.barcode || "")
    );
    varCount++;
  }

  // 2. Get foreign reprints
  const foreign = gcdDb.prepare(`
    SELECT r.id as reprint_id, r.target_issue_id, i.number, s.name as series_name, c.name as country, l.name as language, i.publication_date
    FROM gcd_reprint r
    JOIN gcd_issue i ON r.target_issue_id = i.id
    JOIN gcd_series s ON i.series_id = s.id
    JOIN stddata_country c ON s.country_id = c.id
    JOIN stddata_language l ON s.language_id = l.id
    WHERE r.origin_issue_id = ?
  `).all(baseId);

  for (const f of foreign) {
    insertForeign.run(
      f.reprint_id,
      baseId,
      f.target_issue_id,
      String(f.number || ""),
      String(f.series_name || ""),
      String(f.country || ""),
      String(f.language || ""),
      String(f.publication_date || "")
    );
    forCount++;
  }
}

targetDb.exec("COMMIT;");
console.log(`FINISHED! Bundled ${varCount} variant records and ${forCount} foreign edition records into data/pp115k.sqlite.`);
