#!/usr/bin/env python3
"""Whole-universe character footprints from the local Fandom issue pages.

For every Fandom issue page matched to a Panel Profits book (FANDOM_MATCH.csv) with a price (PP_PRICE_DUMP):
  weight of a character in an issue = role weight (Featured 10, Antagonist 7, Supporting 4, Other 1.5, ...) summed over
  the issue's stories, x1.5 when the page flags it as a first appearance;
  share = weight / (sum of all character weights in the issue + PRIOR)     -> shares of one issue sum to < 1
  footprint NAV of a character = sum over books of share x book price.
Era (Golden/Silver/Bronze/Modern) is derived from the issue's publication year; nothing is stored per era tag.
Characters that differ only by reality suffix, "Bruce Wayne (Earth-Two)" / "Bruce Wayne (New Earth)", are one IP.
Usage: build_footprints.py <outdir>
"""
import csv, json, re, sys, os, collections, time

ING = os.path.expanduser('~/mnt/ingestion')
FD = ING + '/FANDOM_ISSUES_2026-10-07'
OUT = sys.argv[1]
ONLY = sys.argv[2]
PRIOR = 10.0
SHARE_CAP = 0.40   # no single character owns more than 40% of an issue
TOPK = 25

# ---- prices (px.tsv from price_table.py: PriceCharting 9.8, ComicBase when 9.8 is a reprint mismatch)
px = {}
with open(os.path.dirname(os.path.abspath(__file__)) + '/px.tsv') as f:
    for line in f:
        pid, v, _ = line.rstrip('\n').split('\t')
        px[int(pid)] = float(v)
print('priced pp_ids', len(px), flush=True)

# ---- match
match = {}
with open(FD + '/FANDOM_MATCH.csv', newline='') as f:
    for r in csv.DictReader(f):
        if r['is_variant'] == '1':
            continue
        k = (r['wiki'], r['page_title'])
        pid = int(r['pp_id'])
        if k not in match or (pid in px and match[k] not in px):
            match[k] = pid
print('matched pages', len(match), flush=True)

cover = {}
with open(os.path.dirname(os.path.abspath(__file__)) + '/cover.tsv') as f:
    for line in f:
        a, i, y, v = line.rstrip('\n').split('\t')
        cover[(a, i, int(y))] = float(v)
print('cover prices', len(cover), flush=True)
norm = lambda s: re.sub(r'[^a-z0-9]+', '', re.sub(r'^the\s+', '', (s or '').lower().strip()))
def wiki_cover(s):
    # the wiki's own printed cover price, US dollars only: "$0.12", "12¢ US", "12c", "$0.12 US $0.15 CAN"
    if not s: return None
    m = re.search(r'\$\s*([0-9]+(?:\.[0-9]+)?)', s)
    if m: return float(m.group(1)) or None
    m = re.search(r'(?<![0-9£])\b([0-9]*\.?[0-9]+)\s*(?:¢|c\b)', s)
    if m: return float(m.group(1)) / 100 or None
    return None

def cover_price(r, y):
    w = wiki_cover(r.get('price'))
    if w: return w
    if y is None or not r.get('series'): return None
    iss = (r.get('issue') or '').strip().lower()
    for dy in (0, -1, 1):
        v = cover.get((norm(r['series']), iss, y + dy))
        if v: return v
    return None

REALITY = re.compile(r'\s*\(([^()]*(Earth|Universe|Reality|Multiverse|Prime|Crisis|Flashpoint|DCAU|Ultimate|MC2|Zombie|Timeline|Dimension|Elseworlds|Pre-|Post-|New 52|Rebirth)[^()]*)\)\s*$', re.I)
def base(target, name):
    s = target or name or ''
    s = re.sub(r'\s+', ' ', s).strip()
    for _ in range(2):
        s = REALITY.sub('', s)
    return s

def role(sec):
    s = sec.lower()
    if re.search(r'location|item|vehicle|concept|event|race|species|realit|map|vessel|flying|era\b|deit|invocation|organization|team', s):
        return 0
    if 'feature' in s: return 10
    if 'antagon' in s or 'villain' in s: return 7
    if 'support' in s: return 4
    if 'cameo' in s or 'mention' in s: return 0.5
    if 'other' in s: return 1.5
    if 'narrator' in s or 'animal' in s: return 1
    if s.strip() in ('characters', 'cast of characters', 'character', 'flashback'): return 4
    return 0

def yr(v):
    m = re.search(r'[0-9]{4}', v or '')
    if not m: return None
    y = int(m.group(0))
    return y if 1930 <= y <= 2026 else None

def era(y):
    return 0 if y < 1956 else 1 if y < 1970 else 2 if y < 1986 else 3

class C:
    __slots__ = ('disp', 'u', 'issues', 'books', 'nav', 'ebooks', 'enav', 'top', 'first', 'firstflag')
    def __init__(s, disp, u):
        s.disp = disp; s.u = u; s.issues = 0; s.books = 0; s.nav = 0.0
        s.ebooks = [0, 0, 0, 0]; s.enav = [0.0] * 4; s.top = []; s.first = None; s.firstflag = None

chars = {}
issues_total = issues_priced = issues_floor = 0
t0 = time.time()
for wiki, fn in (('dc', 'dc_issues.jsonl'), ('marvel', 'marvel_issues.jsonl')):
    if wiki != ONLY: continue
    with open(f'{FD}/{fn}') as f:
        for line in f:
            r = json.loads(line)
            issues_total += 1
            y = yr(r.get('cover_year')) or yr(r.get('pub_year'))
            pid = match.get((wiki, r['page_title']))
            price = px.get(pid) if pid else None
            floor = False
            if price is None:
                price = cover_price(r, y)
                floor = price is not None
            w = {}      # key -> [weight, display, first_flag]
            for st in r['stories']:
                for a in st['appearances']:
                    rw = role(a['section'])
                    if rw <= 0: continue
                    if a['depth'] > 1: rw *= 0.5
                    k = base(a['target'], a['name'])
                    if len(k) < 2 or not re.search(r'[A-Za-z]', k): continue
                    kk = k.lower()
                    e = w.get(kk)
                    if e is None:
                        e = w[kk] = [0.0, k, False]
                    e[0] += rw
                    if a['first_appearance']: e[2] = True
            if not w: continue
            tot = sum(e[0] * (1.5 if e[2] else 1.0) for e in w.values()) + PRIOR
            for kk, (wt, disp, fl) in w.items():
                c = chars.get(kk)
                if c is None:
                    c = chars[kk] = C(disp, wiki)
                c.issues += 1
                if y is not None:
                    if c.first is None or y < c.first: c.first = y
                    if fl and (c.firstflag is None or y < c.firstflag[0]): c.firstflag = (y, pid, r['page_title'])
                if price is None or y is None: continue
                share = min(SHARE_CAP, wt * (1.5 if fl else 1.0) / tot)
                v = share * price
                e = era(y)
                c.books += 1; c.nav += v; c.ebooks[e] += 1; c.enav[e] += v
                if pid: c.top.append((v, pid, share, y))
                if len(c.top) > 4 * TOPK:
                    c.top.sort(reverse=True); del c.top[TOPK:]
            issues_priced += 1 if price is not None else 0
            if floor: issues_floor += 1
            if issues_total % 20000 == 0:
                print(issues_total, issues_priced, len(chars), round(time.time() - t0), flush=True)

print('done parse', issues_total, issues_priced, 'of which cover-price floor', issues_floor, len(chars), flush=True)
os.makedirs(OUT, exist_ok=True)
with open(OUT + '/characters_' + ONLY + '.tsv', 'w') as o, open(OUT + '/character_books_' + ONLY + '.tsv', 'w') as b:
    o.write('fkey\tdisplay\tuniverse\tissues\tbooks\tnav\tg_books\tg_nav\ts_books\ts_nav\tb_books\tb_nav\tm_books\tm_nav\tfirst_year\tdebut_year\tdebut_pp_id\tdebut_page\n')
    b.write('fkey\tpp_id\tshare\tyear\tvalue\n')
    for kk, c in chars.items():
        if c.books == 0: continue
        fl = c.firstflag or ('', '', '')
        clean = lambda x: re.sub(r'[\t\r\n]+', ' ', str(x))
        o.write('\t'.join(map(str, [clean(kk), clean(c.disp), c.u, c.issues, c.books, round(c.nav, 2),
            c.ebooks[0], round(c.enav[0], 2), c.ebooks[1], round(c.enav[1], 2), c.ebooks[2], round(c.enav[2], 2), c.ebooks[3], round(c.enav[3], 2),
            c.first or '', fl[0], fl[1] or '', clean(fl[2])])) + '\n')
        c.top.sort(reverse=True)
        for v, pid, share, y in c.top[:TOPK]:
            b.write(f'{clean(kk)}\t{pid}\t{share:.5f}\t{y}\t{v:.2f}\n')
print('written', sum(1 for c in chars.values() if c.books), flush=True)
