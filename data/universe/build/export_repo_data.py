#!/usr/bin/env python3
"""Export the whole-universe footprints for the app. Run after build_footprints.py (dc + marvel).
Writes <repo>/data/universe/character-footprints.json (top characters per universe, with their leading books)
and <repo>/data/universe/character-index.json.gz (every measured character, compact)."""
import csv, json, gzip, os, sys, re
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = sys.argv[1]
TOP = int(sys.argv[2]) if len(sys.argv) > 2 else 800
FD = os.path.expanduser('~/mnt/ingestion/FANDOM_ISSUES_2026-10-07')
MUST = {'bruce wayne','joker','harvey dent','harleen quinzel','kal-el','lex luthor','peter parker','norman osborn','matthew murdock',
        'wilson fisk','anthony stark','james howlett',"t'challa",'victor von doom','bruce banner'}
title = {}
with open(FD + '/FANDOM_MATCH.csv', newline='') as f:
    for r in csv.DictReader(f):
        if r['is_variant'] != '1': title.setdefault(r['pp_id'], r['page_title'])
chars = {}
for u in ('dc', 'marvel'):
    with open(f'{HERE}/characters_{u}.tsv', newline='') as f:
        for r in csv.DictReader(f, delimiter='\t', quoting=csv.QUOTE_NONE):
            r['nav'] = float(r['nav']); chars[(u, r['fkey'])] = r
    with open(f'{HERE}/character_books_{u}.tsv', newline='') as f:
        for r in csv.DictReader(f, delimiter='\t', quoting=csv.QUOTE_NONE):
            c = chars.get((u, r['fkey']))
            if c is not None: c.setdefault('b', []).append(r)

def compact(c, books):
    e = []
    for p in 'gsbm':
        e += [int(c[p + '_books']), round(float(c[p + '_nav']), 2)]
    out = {'k': c['fkey'], 'n': c['display'], 'u': 'DC' if c['universe'] == 'dc' else 'MARVEL', 'i': int(c['issues']), 'v': round(c['nav'], 2), 'e': e,
           'f': int(c['first_year']) if c['first_year'] else None}
    if c['debut_pp_id']: out['d'] = [int(c['debut_year']), int(c['debut_pp_id']), c['debut_page']]
    if books:
        out['b'] = []
        for b in c.get('b', []):
            sh = float(b['share'])
            out['b'].append([int(b['pp_id']), round(sh, 4), int(b['year']), title.get(b['pp_id'], ''), round(float(b['value']) / sh, 2) if sh else 0])
    return out

top = []
for u in ('dc', 'marvel'):
    ranked = sorted((c for (uu, _), c in chars.items() if uu == u), key=lambda c: -c['nav'])
    keep = ranked[:TOP] + [c for c in ranked[TOP:] if c['fkey'] in MUST]
    top += [compact(c, True) for c in keep]
os.makedirs(REPO + '/data/universe', exist_ok=True)
with open(REPO + '/data/universe/character-footprints.json', 'w') as o:
    json.dump(top, o, separators=(',', ':'))
allc = [compact(c, False) for c in chars.values()]
with gzip.open(REPO + '/data/universe/character-index.json.gz', 'wt') as o:
    json.dump(allc, o, separators=(',', ':'))
print(len(top), len(allc), os.path.getsize(REPO + '/data/universe/character-footprints.json'), os.path.getsize(REPO + '/data/universe/character-index.json.gz'))
