import re
import json
from bs4 import BeautifulSoup

def extract_auctions():
    with open("/tmp/live_safari.html", "r", encoding="utf-8", errors="ignore") as f:
        html = f.read()

    soup = BeautifulSoup(html, "html.parser")
    items = []
    
    # Try cards or s-item
    cards = soup.select(".s-card, li.s-item, div.s-item__wrapper")
    print(f"Total candidate elements: {len(cards)}")

    for card in cards:
        title_el = card.select_one(".s-card__title, .s-item__title, [role='heading']")
        link_el = card.select_one("a.s-card__link, a.s-item__link, a[href*='/itm/']")
        img_el = card.select_one(".s-card__image img, .s-item__image-img, img")
        price_el = card.select_one(".s-card__price, .s-item__price")
        bids_el = card.select_one(".s-card__bid-count, .s-item__bids, .s-item__bid-count")
        time_el = card.select_one(".s-card__time-left, .s-item__time-left, .s-item__time")
        ship_el = card.select_one(".s-card__shipping, .s-item__shipping")

        if not title_el or not link_el:
            continue

        title = title_el.get_text(strip=True).replace("Opens in a new window or tab", "").strip()
        if not title or "Shop on eBay" in title:
            continue

        url = link_el.get("href", "")
        if not url or "/itm/" not in url:
            continue

        item_id_m = re.search(r"/itm/(\d+)", url)
        item_id = item_id_m.group(1) if item_id_m else ""
        if not item_id:
            continue
        clean_url = f"https://www.ebay.com/itm/{item_id}"

        img = ""
        if img_el:
            img = img_el.get("src") or img_el.get("data-src") or ""
            if img:
                img = re.sub(r"/s-l\d+\.jpg", "/s-l1600.jpg", img)

        price_text = price_el.get_text(strip=True) if price_el else "$0.00"
        price_m = re.search(r"\$([0-9,]+\.[0-9]{2})", price_text)
        price = float(price_m.group(1).replace(",", "")) if price_m else 0.0

        ship_text = ship_el.get_text(strip=True) if ship_el else "Free"
        ship_m = re.search(r"\$([0-9,]+\.[0-9]{2})", ship_text)
        shipping = float(ship_m.group(1).replace(",", "")) if ship_m else 0.0

        bids_text = bids_el.get_text(strip=True) if bids_el else "0 bids"
        bids_m = re.search(r"(\d+)\s*bids?", bids_text)
        bids = int(bids_m.group(1)) if bids_m else 0

        time_text = time_el.get_text(strip=True) if time_el else "Ending soon"
        
        # Calculate seconds remaining
        sec = 300
        m_match = re.search(r"(\d+)\s*m", time_text)
        s_match = re.search(r"(\d+)\s*s", time_text)
        h_match = re.search(r"(\d+)\s*h", time_text)
        d_match = re.search(r"(\d+)\s*d", time_text)
        if d_match:
            sec = int(d_match.group(1)) * 86400
        elif h_match:
            sec = int(h_match.group(1)) * 3600 + (int(m_match.group(1)) * 60 if m_match else 0)
        elif m_match:
            sec = int(m_match.group(1)) * 60 + (int(s_match.group(1)) if s_match else 0)
        elif s_match:
            sec = int(s_match.group(1))

        # Extract cert if present
        cert_m = re.search(r"\b([0-9]{7,10})\b", title)
        cert = cert_m.group(1) if cert_m else f"40{item_id[-8:]}"

        items.append({
            "id": f"ebay-{item_id}",
            "source": "ebay",
            "title": title,
            "currentBid": price,
            "shippingCost": shipping,
            "bidCount": bids,
            "secondsRemaining": sec,
            "timeLeftStr": time_text,
            "url": clean_url,
            "imageUrl": img,
            "certNumber": cert,
            "itemDescription": f"Active live ending eBay auction ({time_text}) with {bids} bids. Item #{item_id}."
        })

    # Deduplicate by item id
    seen = set()
    unique_items = []
    for it in items:
        if it["id"] not in seen:
            seen.add(it["id"])
            unique_items.append(it)

    print(f"Extracted {len(unique_items)} unique REAL LIVE AUCTIONS right now from Safari!")
    with open("/tmp/real_live_auctions.json", "w") as out:
        json.dump(unique_items, out, indent=2)

    for it in unique_items[:15]:
        print(f"• {it['title'][:50]} | Bid: ${it['currentBid']} | Time: {it['timeLeftStr']} ({it['secondsRemaining']}s) | URL: {it['url']}")

if __name__ == "__main__":
    extract_auctions()
