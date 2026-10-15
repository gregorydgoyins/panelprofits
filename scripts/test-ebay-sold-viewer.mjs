/** Run against the deployed runtime so Vercel keeps the developer credentials server-side. */
const query = process.argv.slice(2).join(" ") || "Amazing Spider-Man 300 CGC 9.8";
const url = new URL("https://comicbookstockexchange.com/api/sniper/ebay-sales");
url.searchParams.set("q", query);
const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
if (!response.ok) throw new Error(`Viewer API HTTP ${response.status}`);
const result = await response.json();
console.log(JSON.stringify(result, null, 2));
process.exitCode = result.available ? 0 : 2;
