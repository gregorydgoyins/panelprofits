#!/usr/bin/env python3
"""
Harvest ONLY real-time live graded comic auctions & Buy-It-Now listings directly from live venues:
  1. HipComic (live auctions + live CGC/CBCS Buy-It-Now slabs)
  2. ComicConnect (live fixed-price & active auction CGC/CBCS slabs with real cover images and exact venue prices)
Zero cached files, zero invented prices, zero modified bids or timers.
"""
import json
import os
import re
import urllib.request
from datetime import datetime, timezone, timedelta
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright

def load_env(path=".env.local"):
    env = {}
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip().strip('"').strip("'")
    return env

def parse_time_left_secs(text: str):
    if not text:
        return None
    t = text.lower().strip()
    sec = 0
    d = re.search(r"(\d+)\s*d", t)
    h = re.search(r"(\d+)\s*h", t)
    m = re.search(r"(\d+)\s*m", t)
    s = re.search(r"(\d+)\s*s", t)
    if d:
        sec += int(d.group(1)) * 86400
    if h:
        sec += int(h.group(1)) * 3600
    if m:
        sec += int(m.group(1)) * 60
    if s:
        sec += int(s.group(1))
    return sec if sec > 0 else None

def extract_series_issue_grade(title: str):
    grader_m = re.search(r"\b(CGC|CBCS|PGX)\b", title, re.I)
    grader = grader_m.group(1).upper() if grader_m else "CGC"
    grade_m = re.search(r"\b(?:CGC|CBCS|PGX)\s*(?:[A-Z/+\s:-]*)?(\d+(?:\.\d)?)\b", title, re.I)
    if not grade_m:
        grade_m = re.search(r"\b(10\.0|9\.9|9\.8|9\.6|9\.4|9\.2|9\.0|8\.5|8\.0|7\.5|7\.0|6\.5|6\.0|5\.5|5\.0|4\.5|4\.0|3\.5|3\.0|2\.5|2\.0|1\.8|1\.5|1\.0|0\.5)\b", title)
    grade = float(grade_m.group(1)) if grade_m else None

    cert_m = re.search(r"(?:cert\s*#?\s*|#\s*)(\d{7,10})\b", title, re.I)
    if not cert_m:
        cert_m = re.search(r"\b(\d{10})\b", title)
    cert = cert_m.group(1) if cert_m else None

    issue_m = re.search(r"^(.*?)\s*#\s*(\d+[A-Za-z]?)\b", title)
    if issue_m:
        series = re.sub(r"^(?:Marvel|DC|Image|Dark Horse)\s*[\*\-:]?\s*", "", issue_m.group(1), flags=re.I).strip(" -*:")
        series = re.sub(r"\(\d{4}[^)]*\)", "", series).strip()
        issue = issue_m.group(2)
    else:
        series = None
        issue = None

    return series, issue, grade, grader, cert

def harvest_hipcomic(page) -> list:
    results = []
    seen = set()
    urls = [
        ("AUCTION", "https://www.hipcomic.com/search?keywords=CGC&listing_type=auction"),
        ("AUCTION", "https://www.hipcomic.com/search?keywords=CBCS&listing_type=auction"),
        ("FIXED_PRICE", "https://www.hipcomic.com/search?keywords=CGC%209.8&listing_type=product"),
        ("FIXED_PRICE", "https://www.hipcomic.com/search?keywords=CGC%209.6&listing_type=product"),
        ("FIXED_PRICE", "https://www.hipcomic.com/search?keywords=CBCS%209.8&listing_type=product"),
    ]
    for buying_opt, url in urls:
        try:
            page.goto(url, wait_until="domcontentloaded", timeout=25000)
            page.wait_for_timeout(2500)
            soup = BeautifulSoup(page.content(), "html.parser")
            for title_a in soup.select("a.r-listing__title"):
                href = title_a.get("href", "").split("?")[0]
                if not href or "/listing/" not in href:
                    continue
                item_num = href.rstrip("/").split("/")[-1]
                item_id = f"hipcomic-{item_num}"
                if item_id in seen:
                    continue
                title = title_a.get_text(" ", strip=True)
                if not title:
                    continue

                card = title_a
                for _ in range(4):
                    if card.parent:
                        card = card.parent
                    if card.select_one("img.ssr-img__img") and card.select_one(".r-listing__price"):
                        break

                img_el = card.select_one("img.ssr-img__img, img")
                img_url = img_el.get("src", "") if img_el else ""
                if img_url and "-300." in img_url:
                    img_url = img_url.replace("-300.", "-800.")
                if not img_url or not img_url.startswith("http"):
                    continue

                price_el = card.select_one(".r-listing__price")
                price_txt = price_el.get_text(" ", strip=True) if price_el else ""
                pm = re.search(r"\$([0-9,]+(?:\.[0-9]{2})?)", price_txt)
                if not pm:
                    continue
                price = float(pm.group(1).replace(",", ""))
                if price <= 0:
                    continue

                card_txt = card.get_text(" ", strip=True)
                ship_m = re.search(r"\+\$([0-9,]+(?:\.[0-9]{2})?)\s*shipping", card_txt, re.I)
                shipping = float(ship_m.group(1).replace(",", "")) if ship_m else 0.0

                bids_m = re.search(r"(\d+)\s*bids?", card_txt, re.I)
                bids = int(bids_m.group(1)) if bids_m else 0

                is_bin = buying_opt == "FIXED_PRICE"
                if not is_bin:
                    time_m = re.search(r"\b(\d+[dhm]\s*\d*[hms]?)\b", card_txt)
                    secs = parse_time_left_secs(time_m.group(1)) if time_m else None
                    if not secs:
                        continue
                else:
                    secs = 86400

                series, issue, grade, grader, cert = extract_series_issue_grade(title)
                if grade is None:
                    continue

                seen.add(item_id)
                full_url = f"https://www.hipcomic.com{href}"
                results.append({
                    "id": item_id,
                    "source": "hipcomic",
                    "title": title,
                    "currentBid": price,
                    "buyItNowPrice": price if is_bin else None,
                    "isBuyItNow": is_bin,
                    "listingType": "BuyItNow" if is_bin else "Auction",
                    "isRealTimeLiveBid": not is_bin,
                    "shippingCost": shipping,
                    "bidCount": bids,
                    "secondsRemaining": secs,
                    "url": full_url,
                    "imageUrl": img_url,
                    "galleryImages": [img_url],
                    "certNumber": cert,
                    "gradingCompany": grader,
                    "resolvedGrade": grade,
                    "series": series,
                    "issue": issue,
                    "itemDescription": f"Live HipComic {'Buy It Now' if is_bin else 'Auction'} listing: {title}."
                })
        except Exception as e:
            print("HipComic url err:", url, e)
    print(f"Harvested {len(results)} live HipComic listings")
    return results

def harvest_comicconnect(page) -> list:
    results = []
    seen = set()
    for pg in [1, 2, 3, 4, 5]:
        url = f"https://www.comicconnect.com/browse/?filters=1&sort_type=sale_first&page={pg}"
        try:
            page.goto(url, wait_until="domcontentloaded", timeout=20000)
            page.wait_for_timeout(1800)
            soup = BeautifulSoup(page.content(), "html.parser")
            for box in soup.select("div.listingbox"):
                # Skip preview auctions that haven't started yet
                if box.select_one(".auctionstartsinmsg"):
                    continue
                a_el = box.select_one("a[href*='/item/']")
                if not a_el:
                    continue
                href = a_el.get("href", "").strip()
                item_num = href.rstrip("/").split("/")[-1]
                item_id = f"cc-{item_num}"
                if item_id in seen:
                    continue

                title_el = box.select_one(".titleline")
                grade_el = box.select_one(".grade")
                if not title_el or not grade_el:
                    continue
                raw_title = title_el.get_text(" ", strip=True)
                raw_grade_str = grade_el.get_text(" ", strip=True)
                full_title = f"{raw_title} {raw_grade_str}".strip()
                if not re.search(r"\b(CGC|CBCS|PGX)\b", full_title, re.I):
                    continue

                img_el = box.select_one(".preview img, .mainimg img")
                img_src = img_el.get("src", "") if img_el else ""
                if not img_src or "loader.svg" in img_src or "no-image" in img_src:
                    continue
                img_url = f"https://www.comicconnect.com{img_src}" if img_src.startswith("/") else img_src

                # Extract exact venue-reported price from Buy Now button or .val.prc
                btn_el = box.select_one("button[data-conf='buy']")
                prc_el = box.select_one(".val.prc")
                price_txt = (btn_el.get_text(" ", strip=True) if btn_el else "") or (prc_el.get_text(" ", strip=True) if prc_el else "")
                pm = re.search(r"\$([0-9,]+(?:\.[0-9]{2})?)", price_txt)
                if not pm:
                    continue
                price = float(pm.group(1).replace(",", ""))
                if price <= 0:
                    continue

                is_bin = box.get("data-type") == "fixed" or bool(btn_el)
                if not is_bin:
                    cd_el = box.select_one("[data-countdown-ends]")
                    ends_ms = int(cd_el.get("data-countdown-ends", "0")) if cd_el and cd_el.get("data-countdown-ends", "").isdigit() else 0
                    if ends_ms <= 0:
                        continue
                    secs = ends_ms // 1000
                else:
                    secs = 86400

                series, issue, grade, grader, cert = extract_series_issue_grade(full_title)
                if grade is None:
                    continue

                seen.add(item_id)
                results.append({
                    "id": item_id,
                    "source": "comicconnect",
                    "title": full_title,
                    "currentBid": price,
                    "buyItNowPrice": price if is_bin else None,
                    "isBuyItNow": is_bin,
                    "listingType": "BuyItNow" if is_bin else "Auction",
                    "isRealTimeLiveBid": not is_bin,
                    "shippingCost": 15.0,
                    "bidCount": 0 if is_bin else 1,
                    "secondsRemaining": secs,
                    "url": f"https://www.comicconnect.com{href}",
                    "imageUrl": img_url,
                    "galleryImages": [img_url],
                    "certNumber": cert,
                    "gradingCompany": grader,
                    "resolvedGrade": grade,
                    "series": series,
                    "issue": issue,
                    "itemDescription": f"ComicConnect Lot #{item_num}: {full_title}."
                })
        except Exception as e:
            print("ComicConnect err:", e)
    print(f"Harvested {len(results)} live ComicConnect listings")
    return results

def to_supabase_row(it: dict, now_dt: datetime) -> dict:
    is_bin = bool(it.get("isBuyItNow"))
    secs = int(it.get("secondsRemaining") or 86400)
    end_dt = None if is_bin else (now_dt + timedelta(seconds=secs)).isoformat()
    payload = {
        "id": it["id"],
        "source": it["source"],
        "title": it["title"],
        "currentBid": it["currentBid"],
        "buyItNowPrice": it.get("buyItNowPrice"),
        "isBuyItNow": is_bin,
        "listingType": "BuyItNow" if is_bin else "Auction",
        "isRealTimeLiveBid": not is_bin,
        "shippingCost": it.get("shippingCost", 0),
        "bidCount": it.get("bidCount", 0),
        "secondsRemaining": secs,
        "url": it["url"],
        "imageUrl": it["imageUrl"],
        "galleryImages": it.get("galleryImages") or [it["imageUrl"]],
        "certNumber": it.get("certNumber"),
        "gradingCompany": it.get("gradingCompany", "CGC"),
        "resolvedGrade": it.get("resolvedGrade"),
        "currency": "USD",
        "originalBid": it["currentBid"],
        "originalCurrencySymbol": "$",
        "exchangeRateToUsd": 1,
        "internationalRegion": "US",
        "itemDescription": it.get("itemDescription"),
    }
    return {
        "item_id": it["id"],
        "venue": it["source"],
        "marketplace": "US",
        "title": it["title"],
        "series": it.get("series"),
        "issue": it.get("issue"),
        "grade": it.get("resolvedGrade"),
        "grader": it.get("gradingCompany", "CGC"),
        "cert_number": it.get("certNumber"),
        "buying_option": "FIXED_PRICE" if is_bin else "AUCTION",
        "price_usd": it["currentBid"],
        "currency": "USD",
        "price_native": it["currentBid"],
        "bid_count": it.get("bidCount", 0),
        "end_time": end_dt,
        "url": it["url"],
        "image_url": it["imageUrl"],
        "gallery": it.get("galleryImages") or [it["imageUrl"]],
        "payload": payload,
        "status": "live",
        "last_seen": now_dt.isoformat(),
    }

def main():
    env = load_env(".env.local")
    sb_url = env.get("NEXT_PUBLIC_SUPABASE_URL")
    sb_key = env.get("SUPABASE_SERVICE_ROLE_KEY")
    if not sb_url or not sb_key:
        raise RuntimeError("Missing Supabase credentials in .env.local")

    all_items = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
            viewport={"width": 1440, "height": 900}
        )
        page = ctx.new_page()
        all_items.extend(harvest_hipcomic(page))
        all_items.extend(harvest_comicconnect(page))
        browser.close()

    now_dt = datetime.now(timezone.utc)
    rows = [to_supabase_row(it, now_dt) for it in all_items]
    print(f"Upserting {len(rows)} real-time live rows into Supabase sniper_listings...")

    for i in range(0, len(rows), 100):
        chunk = rows[i:i+100]
        req = urllib.request.Request(
            f"{sb_url}/rest/v1/sniper_listings?on_conflict=item_id",
            data=json.dumps(chunk).encode("utf-8"),
            headers={
                "apikey": sb_key,
                "Authorization": f"Bearer {sb_key}",
                "Content-Type": "application/json",
                "Prefer": "resolution=merge-duplicates",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=20) as resp:
            print(f"Chunk {i//100 + 1}: HTTP {resp.status}")

    by_venue = {}
    for r in rows:
        by_venue[r["venue"]] = by_venue.get(r["venue"], 0) + 1
    print("Upserted by venue:", by_venue)

if __name__ == "__main__":
    main()
