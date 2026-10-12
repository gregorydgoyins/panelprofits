#!/usr/bin/env python3
"""One market price per Panel Profits book, by the platform rule: PriceCharting 9.8 unless it is under 10% of the
ComicBase value (a reprint matched to the wrong book), then ComicBase; no 9.8 -> ComicBase -> PriceCharting raw.
ComicBase is joined to PriceCharting books by series + issue + year (direct, first printing). Writes px.tsv."""
import csv, os, re, sys, collections
csv.field_size_limit(10**9)
H = os.path.expanduser('~/mnt')
norm = lambda s: re.sub(r'[^a-z0-9]+', '', (s or '').lower())
cb = {}
n = 0
with open(H + '/Desktop/COMICBASE_NORMALIZED_1258799_ROWS_58_FIELDS.csv', newline='') as f:
    for r in csv.DictReader(f):
        if r['Direct or Variant'] not in ('Direct', '') or r['Cover Variant'] or r['Printing'] not in ('1', ''): continue
        m = re.match(r'([0-9]{4})', r['Publication Date'] or '')
        if not m: continue
        try: v = float(r['Value Year 4 (2024)'] or 0)
        except ValueError: continue
        if v <= 0: continue
        k = (norm(r['Series']), r['Issue Number'].strip().lower(), int(m.group(1)))
        if v > cb.get(k, 0): cb[k] = v
        n += 1
print('comicbase keys', len(cb), n, flush=True)
px = {}
src = collections.Counter()
def num(x):
    try:
        v = float(x); return v if v > 0 else None
    except (TypeError, ValueError): return None
with open(H + '/ingestion/PP_TRANSLATION_OUTPUT_FULL_2026-10-06/PP_TRANSLATED_ALL_SERIES_V2.csv', newline='') as f:
    for r in csv.DictReader(f):
        pid = r['source_product_id']
        y = re.match(r'([0-9]{4})', r['publication_year'] or '')
        c = None
        if y:
            iss = (r['issue'] or '').strip().lower()
            for dy in (0, -1, 1):
                c = cb.get((norm(r['series']), iss, int(y.group(1)) + dy))
                if c: break
        p98 = num(r['price_9_8']); raw = num(r['price_raw'])
        if p98 and (not c or p98 >= 0.1 * c): v, s = p98, 'pp98'
        elif c: v, s = c, 'cb'
        elif raw: v, s = raw, 'raw'
        else: continue
        px[pid] = (v, s); src[s] += 1
print(len(px), dict(src), flush=True)
with open('px.tsv', 'w') as o:
    for pid, (v, s) in px.items(): o.write(f'{pid}\t{v}\t{s}\n')
