/**
 * PSA comics population crawler. Paste into the DevTools console on https://www.psacard.com/pop/comics
 * (PSA blocks server requests, so this runs in your own browser tab). It walks every publisher and every page,
 * reads the table exactly as printed (no inference), and downloads psa_comics_pop_<n>.json.
 * Row: { publisher, series (as printed, e.g. "Absolute Batman #4 (2024 Series)"), grades: { "9.8": 12, ... }, total }
 */
(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const out = [];
  const sel = document.getElementById("base");
  if (!sel) return console.error("publisher select #base not found — open https://www.psacard.com/pop/comics");

  const tableText = () => document.querySelector("table")?.innerText ?? "";
  const waitChange = async (before, ms = 8000) => {
    const t0 = Date.now();
    while (Date.now() - t0 < ms) { await sleep(150); if (tableText() !== before) return true; }
    return false;
  };
  const readRows = (publisher) => {
    const t = document.querySelector("table");
    if (!t) return [];
    const hdr = [...t.querySelectorAll("thead th")].map((h) => h.innerText.trim());
    const rows = [];
    for (const tr of t.querySelectorAll("tbody tr")) {
      const c = [...tr.querySelectorAll("td")].map((x) => x.innerText.replace(/\s+/g, " ").trim());
      if (c.length < hdr.length || !c[0]) continue;
      const grades = {};
      hdr.forEach((h, i) => { if (i > 0 && h !== "Total" && c[i]) grades[h] = Number(c[i].replace(/,/g, "")); });
      rows.push({ publisher, series: c[0], grades, total: Number((c[hdr.indexOf("Total")] || "").replace(/,/g, "")) || null });
    }
    return rows;
  };
  const nextBtn = () => document.querySelector('button[aria-label="Next"]');
  const download = (name) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(out)], { type: "application/json" }));
    a.download = name; a.click();
  };

  const publishers = [...sel.options].map((o) => o.value).filter(Boolean);
  console.log(`PSA crawler: ${publishers.length} publishers`);
  let n = 0;
  for (const pub of publishers) {
    const before = tableText();
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value").set.call(sel, pub);
    sel.dispatchEvent(new Event("change", { bubbles: true }));
    await waitChange(before);
    await sleep(300);
    let pages = 0, last = "";
    while (true) {
      const rows = readRows(pub);
      const sig = rows.map((r) => r.series).join("|");
      if (sig === last) break; // page did not change
      last = sig; out.push(...rows); pages++;
      const nb = nextBtn();
      if (!nb || nb.disabled || nb.getAttribute("aria-disabled") === "true") break;
      const b = tableText(); nb.click(); await waitChange(b); await sleep(200);
    }
    n++;
    console.log(`${n}/${publishers.length} ${pub}: ${pages} page(s), ${out.length} rows total`);
    if (n % 40 === 0) download(`psa_comics_pop_partial_${n}.json`);
  }
  download("psa_comics_pop_all.json");
  console.log(`DONE: ${out.length} rows`);
})();
