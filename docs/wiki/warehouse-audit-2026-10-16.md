# Panel Profits knowledge warehouse — 2026-10-16

Inspected the CLEAN production database. These counts describe existing imports, not a completed reconciliation against every original source dump.

## Imported records

Exact `ppcf_wiki_pages` counts: Marvel 131,972; Star Wars 44,160; DC 39,125; financial 4,653; Image 2,361; Transformers 1,316; Dark Horse 332; Spawn 201. Total 224,120.

Exact `quarantine.fandom_issue` counts: DC 43,162; Marvel 41,614. No other wiki values occur in this issue-import table. An entity article import is not evidence that issue synopses for that universe were imported.

Postgres catalog estimates: `ppcf_gcd_stories` 4,283,402; `ppcf_gcd_story_credits` 11,544,787; `ppcf_gcd_series` 232,820; `ppcf_gcd_creators` 113,499; `ppcf_gcd_publishers` 17,698. These estimates do not establish that the complete original GCD dump is present.

`ppcf_wiki_entity_links` has exactly zero rows. Some other source matching exists (`fandom_pp_match`, verified GCD identity links), but the dedicated wiki relationship table is unpopulated. Do not represent the warehouse as fully crosswalked.

## Verified faults and repairs

- `ppcf_wiki_pages` had RLS enabled with an existing public SELECT policy but no anon/authenticated table SELECT privilege. Restored that read privilege without granting writes or exposing raw import tables. Verified public-client category reads and production category HTTP 200.
- ASM #692's listing lacked publication year and label metadata. Catalog uses `The Amazing Spider-Man`; listing uses `Amazing Spider-Man`. Exact indexed title aliases now include the leading article, allowing unambiguous 2012 resolution.
- The Marvel issue import already contains `Alpha, Part 1: Point of Origin`, three story records, characters and release metadata. Hydrated the saved issue summary and authored source-based editorial analysis for the existing pictured lot.
- The pictured Campbell cover's existing local guide record is PriceCharting ID 3374611. Stored observation date is unknown. Do not substitute these historical stored numbers for a fresh guide quote or infer a CGC 9.2 value.
- Imported observation grade labels include underscores and UNGRADED. Normalize these labels before filtering valid prices.

## Attached archives

Both `wikia_pages_full.xml (1).7z` and `wikia_pages_current.xml (1).7z` identify their site as Community Central (`dbname=wikia`, community.fandom.com). The full XML is 12,761,094,803 bytes and includes repeated revisions. Current XML is 1,989,947,699 bytes. They are not separate Marvel/DC/Star Wars comic wikis. Use their help/category/template conventions as technical references; do not merge their user discussions or revision history into comic articles or add their page totals together as unique content.

The streaming audit script counts pages, revisions, redirects and namespaces without materializing the expanded XML. Missing publisher-specific issue dumps still require inventory before import. No new auction listings or bulk comic pages were acquired for this repair.

## Shared structure

Existing edition URLs `/wiki/PPCF-…` and entity URLs `/wiki/entry/…` remain stable. Shared wiki navigation links categories, issues/editions, the financial glossary, help and Sniper. Category pages read the original encyclopedia with bounded pagination. Edition pages read saved issue stories and preserve attribution. Editing, talk pages, revision history, complete source-category trees and a MediaWiki-compatible API are not implemented by this navigation change.

## Technical documentation review

Reviewed official Fandom technical help covering namespaces, category trees, template reuse, infoboxes, links/redirects, database downloads, import/export, licensing and starting a community, plus MediaWiki's API Sandbox and redirect-query documentation. Direct help-index and Sandbox retrieval was blocked by the retrieval service; indexed official topic pages were available. This is a focused technical review, not a claim that every page on Fandom has been crawled.

Relevant requirements beyond navigation:

1. Keep the source wiki, page ID/title, revision ID/time, raw wikitext and per-source license when importing. Retain template/module dependencies separately from article prose. Current `ppcf_wiki_pages` has no dedicated source revision or license fields: complete provenance cannot be reconstructed from its summaries alone.
2. Treat namespaces as content types. Category membership and parent categories are explicit relationships; publisher/universe filters are useful entry points but do not reconstruct the original source category tree.
3. Persist redirects and disambiguation. Normalize aliases without merging different universes, volumes, publication years, variants or translated editions. Remove invented fallback articles when an identity is not found.
4. Structured infobox fields should come from the stored source, omit unknown values and use reusable display components. Do not execute imported MediaWiki/Lua/JavaScript as application code.
5. Prefer current-page dumps for primary content and retain full revisions as history. Fandom's database-download guide states that these XML dumps contain text, not image binaries. File descriptions and image attribution need separate handling.
6. Use `api.php` query modules for targeted validation, revision metadata, redirect resolution and incremental updates; ApiSandbox is an interactive request builder, not an independent data store. Follow continuation tokens. Do not replace local reads with per-view API crawling.
7. Preserve attribution/license separately from original PP editorial analysis. No licensing assumptions should be derived merely from a site's hostname.
8. Add measured import manifests, source-by-source coverage, unresolved identity reports and broken-link checks before calling a source fully migrated.

Reference pages:
- https://community.fandom.com/wiki/Help:Namespaces
- https://community.fandom.com/wiki/Help:Categories
- https://community.fandom.com/wiki/Help:Templates
- https://community.fandom.com/wiki/Help:Infoboxes
- https://community.fandom.com/wiki/Help:Redirects
- https://community.fandom.com/wiki/Help:Database_download
- https://community.fandom.com/wiki/Help:Importing_and_exporting_pages
- https://community.fandom.com/wiki/Help:Licensing
- https://community.fandom.com/wiki/Help:Start_a_new_community
- https://www.mediawiki.org/wiki/Help:ApiSandbox
- https://www.mediawiki.org/wiki/API:Redirects

## Complete current-archive scan

The streaming scan read all 1,989,947,699 XML bytes: 1,872,670 pages and the same number of current revisions, with 50,702 redirects. Namespace counts include 1,373 Help pages, 11,511 Templates, 793 Categories, 71 Modules and 507 main-namespace pages. Large user and discussion namespaces account for much of the archive. These are useful technical and community records, not 1.87 million comic articles. The full-history archive overlaps this same Community Central site; unique counts across both are not summed.
