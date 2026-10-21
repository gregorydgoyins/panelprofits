import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime

key = os.environ.get("COMPSNIPER_API_KEY")
if not key:
    raise SystemExit("Set COMPSNIPER_API_KEY first.")

params = urllib.parse.urlencode({
    "keyword": "nintendo switch oled",
    "sold": "true",
    "ebaySite": "ebay.com",
    "count": 240,
})
request = urllib.request.Request(
    f"https://api.compsniper.com/v1/scrape?{params}",
    headers={"Authorization": f"Bearer {key}"},
)

for attempt in range(3):
    try:
        with urllib.request.urlopen(request, timeout=90) as response:
            data = json.load(response)
        summary = data["summary"]
        print("Median sold price:", summary.get("median"),
              summary.get("currency", ""))
        print("Sample size:", summary.get("count", 0))
        break
    except urllib.error.HTTPError as error:
        try:
            code = json.load(error).get("code", "unknown")
        except (ValueError, AttributeError):
            code = "unknown"
        if (code == "quota_exceeded"
                or error.code not in (429, 503) or attempt == 2):
            raise SystemExit(f"API error: HTTP {error.code}, {code}")
        retry_after = error.headers.get("Retry-After", "5")
        try:
            delay = float(retry_after)
        except ValueError:
            delay = (parsedate_to_datetime(retry_after)
                     - datetime.now(timezone.utc)).total_seconds()
        time.sleep(max(0, delay))
