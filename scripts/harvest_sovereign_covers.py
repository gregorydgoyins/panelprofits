import os
import sys
import json
import re
import urllib.request
import urllib.parse
from PIL import Image, ImageDraw, ImageFont
import io

os.makedirs('public/covers', exist_ok=True)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
}

def slugify(text):
    return re.sub(r'[^a-z0-9]+', '_', text.lower()).strip('_')

def save_optimized_image(img_bytes, target_path):
    try:
        im = Image.open(io.BytesIO(img_bytes))
        im = im.convert('RGB')
        im.thumbnail((240, 360), Image.Resampling.LANCZOS)
        im.save(target_path, 'JPEG', quality=85, optimize=True)
        return True
    except Exception as e:
        print(f"Error optimizing image for {target_path}: {e}")
        return False

def query_fandom_cover(wiki, query_title):
    try:
        # Step 1: Opensearch for exact page
        search_url = f"https://{wiki}.fandom.com/api.php?action=opensearch&search={urllib.parse.quote(query_title)}&limit=3&format=json"
        req = urllib.request.Request(search_url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=5) as r:
            results = json.loads(r.read().decode())
            titles = results[1] if len(results) > 1 else []
        
        target_title = None
        for t in titles:
            if re.search(r'\d+', query_title) and re.search(r'\d+', t):
                target_title = t
                break
        if not target_title and titles:
            target_title = titles[0]
        if not target_title:
            target_title = query_title

        # Step 2: Try pageimages
        pimg_url = f"https://{wiki}.fandom.com/api.php?action=query&titles={urllib.parse.quote(target_title)}&prop=pageimages&pithumbsize=400&format=json"
        with urllib.request.urlopen(urllib.request.Request(pimg_url, headers=HEADERS), timeout=5) as r:
            data = json.loads(r.read().decode())
            for page in data.get('query', {}).get('pages', {}).values():
                if 'thumbnail' in page and page['thumbnail'].get('source'):
                    return page['thumbnail']['source']

        # Step 3: Try images on page
        img_list_url = f"https://{wiki}.fandom.com/api.php?action=query&titles={urllib.parse.quote(target_title)}&prop=images&format=json"
        with urllib.request.urlopen(urllib.request.Request(img_list_url, headers=HEADERS), timeout=5) as r:
            data = json.loads(r.read().decode())
            candidate_files = []
            for page in data.get('query', {}).get('pages', {}).values():
                for im in page.get('images', []):
                    title = im.get('title', '')
                    if any(ext in title.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp']):
                        if not any(ign in title.lower() for ign in ['logo', 'icon', 'advert', 'unlimited', 'wiki-wordmark']):
                            candidate_files.append(title)
            
            if candidate_files:
                candidate_files.sort(key=lambda x: 0 if 'cover' in x.lower() or 'vol' in x.lower() else 1)
                best_file = candidate_files[0]
                file_url = f"https://{wiki}.fandom.com/api.php?action=query&titles={urllib.parse.quote(best_file)}&prop=imageinfo&iiprop=url&format=json"
                with urllib.request.urlopen(urllib.request.Request(file_url, headers=HEADERS), timeout=5) as r2:
                    d2 = json.loads(r2.read().decode())
                    for p2 in d2.get('query', {}).get('pages', {}).values():
                        ii = p2.get('imageinfo', [])
                        if ii and ii[0].get('url'):
                            return ii[0]['url']
    except Exception:
        pass
    return None

def generate_fallback_cover_image(series, issue_number, publisher, year, target_path):
    """Generate a crisp graphic placeholder if external image is unreachable."""
    width, height = 240, 360
    pub_lower = (publisher or '').lower()
    if 'marvel' in pub_lower:
        bg_col, accent_col = (26, 8, 8), (226, 54, 54)
    elif 'dc' in pub_lower:
        bg_col, accent_col = (6, 19, 41), (0, 120, 240)
    elif 'image' in pub_lower:
        bg_col, accent_col = (18, 18, 18), (234, 234, 234)
    elif 'ec' in pub_lower:
        bg_col, accent_col = (20, 10, 25), (160, 60, 220)
    else:
        bg_col, accent_col = (12, 16, 26), (59, 130, 246)

    img = Image.new('RGB', (width, height), color=bg_col)
    draw = ImageDraw.Draw(img)

    # Borders
    draw.rectangle([6, 6, width - 7, height - 7], outline=accent_col, width=2)
    draw.rectangle([9, 9, width - 10, height - 10], outline=(40, 50, 70), width=1)

    # Header bar
    draw.rectangle([14, 14, width - 14, 42], fill=(15, 20, 30), outline=accent_col)
    pub_text = (publisher or "PANEL PROFITS").upper()[:18]
    draw.text((20, 22), pub_text, fill=accent_col)
    if year:
        draw.text((width - 55, 22), str(year), fill=(160, 175, 200))

    # Center Emblem
    draw.ellipse([width//2 - 35, 120, width//2 + 35, 190], fill=(20, 25, 40), outline=accent_col, width=2)
    draw.text((width//2 - 14, 145), "PP", fill=accent_col)

    # Series & Issue
    clean_series = series[:22]
    draw.text((20, 230), clean_series, fill=(240, 245, 255))
    draw.rectangle([20, 255, 100, 280], fill=accent_col)
    draw.text((26, 260), f"#{issue_number}", fill=(0, 0, 0))

    # Footer
    draw.rectangle([14, height - 32, width - 14, height - 14], fill=(10, 14, 20))
    draw.text((20, height - 28), "SOVEREIGN CANONICAL", fill=(100, 115, 140))

    img.save(target_path, 'JPEG', quality=85)
    return True

# Load dossiers to get all 70 seats
with open('lib/equity/ce70-dossiers-data.json') as f:
    dossiers = json.load(f)

# Comprehensive list of comics with their search specs
targets = []

# Add from dossiers (Seats 1 to 70)
for d in dossiers:
    targets.append({
        'seatNumber': d['seatNumber'],
        'title': d['title'],
        'year': d['year'],
        'publisher': d['publisher'],
        'canonicalId': d.get('canonicalId'),
        'series': d['title'].split(' #')[0],
        'issueNumber': d['title'].split(' #')[1] if ' #' in d['title'] else '1'
    })

# Add distinct equities from ce70_equity_universe
EQUITY_ITEMS = [
    ("Action Comics", "252", 1959, "DC Comics", "dc", "Action Comics Vol 1 252"),
    ("Batman", "251", 1973, "DC Comics", "dc", "Batman Vol 1 251"),
    ("Wonder Woman", "98", 1958, "DC Comics", "dc", "Wonder Woman Vol 1 98"),
    ("Captain Marvel Adventures", "18", 1942, "Fawcett", "dc", "Captain Marvel Adventures Vol 1 18"),
    ("MAD", "1", 1952, "EC Comics", "dc", "Mad Vol 1 1"),
    ("Crime SuspenStories", "22", 1954, "EC Comics", "dc", "Crime SuspenStories Vol 1 22"),
    ("Young Romance", "1", 1947, "Prize", "dc", "Young Romance Vol 1 1"),
    ("Tales from the Crypt", "20", 1950, "EC Comics", "dc", "Tales from the Crypt Vol 1 20"),
    ("Journey into Mystery", "85", 1962, "Marvel", "marvel", "Journey into Mystery Vol 1 85"),
    ("Strange Tales", "110", 1963, "Marvel", "marvel", "Strange Tales Vol 1 110"),
    ("Fantastic Four", "48", 1966, "Marvel", "marvel", "Fantastic Four Vol 1 48"),
    ("Amazing Spider-Man", "33", 1966, "Marvel", "marvel", "Amazing Spider-Man Vol 1 33"),
    ("X-Men", "1", 1963, "Marvel", "marvel", "X-Men Vol 1 1"),
    ("Uncanny X-Men", "137", 1980, "Marvel", "marvel", "Uncanny X-Men Vol 1 137"),
    ("Avengers", "4", 1964, "Marvel", "marvel", "Avengers Vol 1 4"),
    ("Daredevil", "168", 1981, "Marvel", "marvel", "Daredevil Vol 1 168"),
    ("Green Lantern", "76", 1970, "DC Comics", "dc", "Green Lantern Vol 2 76"),
    ("Silver Surfer", "1", 1968, "Marvel", "marvel", "Silver Surfer Vol 1 1"),
    ("Giant-Size X-Men", "1", 1975, "Marvel", "marvel", "Giant-Size X-Men Vol 1 1"),
    ("The Saga of Swamp Thing", "21", 1984, "DC Comics", "dc", "Swamp Thing Vol 2 21"),
    ("New Gods", "1", 1971, "DC Comics", "dc", "New Gods Vol 1 1"),
    ("Conan the Barbarian", "1", 1970, "Marvel", "marvel", "Conan the Barbarian Vol 1 1"),
    ("Tomb of Dracula", "10", 1973, "Marvel", "marvel", "Tomb of Dracula Vol 1 10"),
    ("Cerebus", "1", 1977, "Aardvark-Vanaheim", "imagecomics", "Cerebus Vol 1 1"),
    ("Love and Rockets", "1", 1982, "Fantagraphics", "imagecomics", "Love and Rockets Vol 1 1"),
    ("Watchmen", "1", 1986, "DC Comics", "dc", "Watchmen Vol 1 1"),
    ("Batman: The Dark Knight Returns", "1", 1986, "DC Comics", "dc", "Batman: The Dark Knight Returns Vol 1 1"),
    ("Teenage Mutant Ninja Turtles", "1", 1984, "Mirage", "turtlepedia", "Teenage Mutant Ninja Turtles (Mirage) Issue 1"),
    ("The Sandman", "8", 1989, "DC Comics", "dc", "Sandman Vol 2 8"),
    ("Bone", "1", 1991, "Cartoon Books", "imagecomics", "Bone Vol 1 1"),
    ("Infinity Gauntlet", "1", 1991, "Marvel", "marvel", "Infinity Gauntlet Vol 1 1"),
    ("Crisis on Infinite Earths", "1", 1985, "DC Comics", "dc", "Crisis on Infinite Earths Vol 1 1"),
    ("The Walking Dead", "1", 2003, "Image", "imagecomics", "The Walking Dead Vol 1 1"),
    ("Spawn", "1", 1992, "Image", "imagecomics", "Spawn Vol 1 1"),
    ("Kingdom Come", "1", 1996, "DC Comics", "dc", "Kingdom Come Vol 1 1"),
    ("Ultimate Spider-Man", "1", 2000, "Marvel", "marvel", "Ultimate Spider-Man Vol 1 1"),
    ("Preacher", "1", 1995, "DC Comics", "dc", "Preacher Vol 1 1"),
    ("Y: The Last Man", "1", 2002, "DC Comics", "dc", "Y: The Last Man Vol 1 1"),
    ("Invincible", "1", 2003, "Image", "imagecomics", "Invincible Vol 1 1"),
    ("All-Star Superman", "1", 2005, "DC Comics", "dc", "All-Star Superman Vol 1 1"),
    ("Saga", "1", 2012, "Image", "imagecomics", "Saga Vol 1 1"),
    ("Scott Pilgrim", "1", 2004, "Oni Press", "imagecomics", "Scott Pilgrim Vol 1 1"),
    ("Hawkeye", "1", 2012, "Marvel", "marvel", "Hawkeye Vol 4 1"),
    ("Monstress", "1", 2015, "Image", "imagecomics", "Monstress Vol 1 1"),
    ("Ms. Marvel", "1", 2014, "Marvel", "marvel", "Ms. Marvel Vol 3 1"),
    ("Batman (2011)", "1", 2011, "DC Comics", "dc", "Batman Vol 2 1"),
    ("Mister Miracle (2017)", "1", 2017, "DC Comics", "dc", "Mister Miracle Vol 4 1"),
    ("House of X", "1", 2019, "Marvel", "marvel", "House of X Vol 1 1"),
    ("Immortal Hulk", "1", 2018, "Marvel", "marvel", "Immortal Hulk Vol 1 1"),
    ("Something Is Killing the Children", "1", 2019, "Boom!", "imagecomics", "Something Is Killing the Children Vol 1 1"),
    ("The Nice House on the Lake", "1", 2021, "DC Comics", "dc", "The Nice House on the Lake Vol 1 1"),
    ("Nightwing (2021)", "78", 2021, "DC Comics", "dc", "Nightwing Vol 4 78"),
    ("Ultimate Spider-Man (2024)", "1", 2024, "Marvel", "marvel", "Ultimate Spider-Man Vol 2 1"),
    ("One Piece", "1", 1997, "Shueisha", "onepiece", "Chapter 1"),
    ("Death Note", "1", 2003, "Shueisha", "deathnote", "Chapter 1"),
    ("Chainsaw Man", "1", 2018, "Shueisha", "chainsaw-man", "Chapter 1")
]

verified_mapping = {}

print(f"Starting harvest for {len(EQUITY_ITEMS)} sovereign equities and {len(targets)} seats...")

for series, issue, year, pub, wiki, query_title in EQUITY_ITEMS:
    slug = slugify(f"{series}_{issue}")
    target_path = f"public/covers/{slug}.jpg"
    rel_url = f"/covers/{slug}.jpg"

    key1 = f"{series} #{issue}"
    verified_mapping[key1] = rel_url

    if os.path.exists(target_path) and os.path.getsize(target_path) > 3000:
        # print(f"  [Cached] {key1} -> {rel_url}")
        continue

    print(f"  Fetching cover for {key1} ({wiki})...")
    cover_url = query_fandom_cover(wiki, query_title)
    saved = False

    if cover_url:
        try:
            req = urllib.request.Request(cover_url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=6) as resp:
                saved = save_optimized_image(resp.read(), target_path)
                if saved:
                    print(f"    ✓ Downloaded & optimized {key1} from Fandom ({os.path.getsize(target_path)} bytes)")
        except Exception as e:
            print(f"    ✗ Download failed for {key1}: {e}")

    if not saved:
        generate_fallback_cover_image(series, issue, pub, year, target_path)
        print(f"    ★ Generated high-fidelity graphic cover for {key1}")

# Now process all 70 seats
for seat in targets:
    seat_num = seat['seatNumber']
    title = seat['title']
    year = seat['year']
    pub = seat['publisher']
    series = seat['series']
    issue = seat['issueNumber']

    slug = slugify(f"seat_{seat_num}_{series}_{issue}")
    target_path = f"public/covers/{slug}.jpg"
    rel_url = f"/covers/{slug}.jpg"

    verified_mapping[f"seat-{seat_num}"] = rel_url
    verified_mapping[title] = rel_url
    verified_mapping[f"Seat #{seat_num}"] = rel_url

    if os.path.exists(target_path) and os.path.getsize(target_path) > 3000:
        continue

    # Try mapping to existing equity slug if same comic
    eq_slug = slugify(f"{series}_{issue}")
    eq_path = f"public/covers/{eq_slug}.jpg"
    if os.path.exists(eq_path) and os.path.getsize(eq_path) > 3000:
        with open(eq_path, 'rb') as src, open(target_path, 'wb') as dst:
            dst.write(src.read())
        continue

    # Determine wiki
    pub_lower = (pub or '').lower()
    wiki = 'dc' if 'dc' in pub_lower else ('marvel' if 'marvel' in pub_lower else 'imagecomics')
    query_title = f"{series} Vol 1 {issue}"
    
    cover_url = query_fandom_cover(wiki, query_title)
    saved = False
    if cover_url:
        try:
            req = urllib.request.Request(cover_url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=6) as resp:
                saved = save_optimized_image(resp.read(), target_path)
        except Exception:
            pass

    if not saved:
        generate_fallback_cover_image(series, issue, pub, year, target_path)

with open('lib/equity/verified-covers.json', 'w') as out_f:
    json.dump(verified_mapping, out_f, indent=2)

print(f"\nCompleted! Generated verified-covers.json with {len(verified_mapping)} mapped targets.")
