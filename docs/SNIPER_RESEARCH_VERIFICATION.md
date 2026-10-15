# Sniper saved research verification

Existing Supabase lots only. No auction ingestion, new listings, CompSniper acquisition, or web-search generation was run during this verification.

## Implemented

- Publisher-independent GCD story crosswalk supplies stored plots where available; a missing listing year resolves only if the stored title/issue has one unambiguous publication year.
- Worker reads the private imported issue records through a service-role-only indexed RPC, then saves source evidence in the existing issue summary cache.
- PPCF identities connect exact edition/year matches to recorded pricing observations; each provider, currency and date stays separate. Cover prices, costs, spread quotes and historical value fields are excluded from guide comparisons. ComicBase Price follows the project's 9.8 reference convention.
- Stored GoCollect last-sale data requires the actual grader, label and grade. CGC and PSA retain their existing census resolvers. CBCS copies do not inherit CGC populations.
- Worker saves per-lot evidence and original analysis in sniper_listing_writeup. Opening research reads those saved records. The comps GET no longer triggers a paid vendor refresh or waits eight seconds.
- Existing financial dictionary entries link into research; /learn#sniper-practice provides an applied paper-trading syllabus and renders the course catalog.
- Snapshot and local-research cron paths both enrich existing stored lots. Only the snapshot path acquires listings; it was not invoked in testing.

## Verified

- Next dev started locally with .env.local, binding 127.0.0.1.
- GET /api/sniper/listing-writeup returned HTTP 200, state ready, for saved Mace Windu research; 123 total CGC copies, 83 at 9.8 across label types, ten stored price comparisons, two dictionary links.
- /learn and /lexicon/fair-market-value-fmv-benchmark returned HTTP 200 with actual content.
- Batman #251 imported source hydrated successfully. Its older summary cache contained stray template fields; imported evidence replaces that invalid text.
- Thirty additional existing lots enriched from stored data without vendor acquisition or AI calls: 30 checked, zero errors. All retained explicit missing-field status; none was falsely reported complete.
- Private import RPC: anon/authenticated cannot execute; service_role can.

- Final checks: `npx tsc --noEmit` passed; `npx vitest run` passed (415 tests, five skipped).

## Generation and source limits

The actual Gemini call for the existing Batman slab returned this response:

```json
{"error":{"code":403,"message":"Lightning dunning decision is deny for project: projects/364716569405","status":"PERMISSION_DENIED"}}
```

No successful Gemini response is claimed. Mace Windu and Batman analyses were written by ChatGPT from the retrieved stored evidence and saved with that attribution. Automatic generation uses the existing free AI Gateway model when authenticated, otherwise Gemini with source evidence and search disabled. The Gemini denial triggers a shared cooldown; no repeated billing-denied calls are needed.

The imported private issue table currently contains Marvel/DC records. Registry support for Star Wars, Dark Horse, Image and other publishers does not mean their complete issue dumps have been found or imported on this remote workspace. Their character metadata is present in the wiki store. The Last Ronin #1 base Cover A resolves to PPCF-0000472764 and a recorded guide comparison; no usable local issue synopsis or matching main-series census was found. Those gaps remain explicit. A MyComicShop price observation store was not found; no MyComicShop price is invented or attributed to another provider.

## Example saved response

```json
{
  "state": "ready",
  "writeup": {
    "model": "ChatGPT editorial analysis from stored evidence",
    "edition": "Star Wars: Mace Windu #1 (2017); cover edition unconfirmed",
    "sources": [
      {
        "uri": "https://starwars.fandom.com/wiki/Jedi_of_the_Republic_%E2%80%93_Mace_Windu_1",
        "title": "Wookieepedia (Fandom)"
      }
    ],
    "learning": [
      {
        "url": "/lexicon/fair-market-value-fmv-benchmark",
        "term": "Fair Market Value (FMV Benchmark)",
        "definition": "The normalized, source-isolated consensus price for an exact comic issue and certified grade, backed by verifiable recorded public auction sales (CGC/GPA, Heritage, ComicConnect)."
      },
      {
        "url": "/lexicon/price-discovery",
        "term": "Price Discovery",
        "definition": "Price discovery in Panel Profits is the process by which a comic issue's true current market price becomes known through actual clearing transactions, rather than through listings, asks, or model estimates. A thinly-traded key issue has poor price discovery -- its FMV benchmark rests on few, possibly stale, observations -- while a heavily-traded modern key has continuous, reliable price discovery."
      }
    ],
    "synopsis": {
      "intro": "Matt Owens and Denys Cowan open Mace Windu\u2019s mission with a question that follows the Jedi into battle: what happens when peacekeepers become soldiers?",
      "points": [
        {
          "refs": [
            0
          ],
          "text": "The outbreak of the Clone Wars places Mace Windu\u2019s faith in Jedi duty under pressure. His concern is not simply how to win a fight, but what the Order\u2019s new military role will demand of it.",
          "label": "After Geonosis"
        },
        {
          "refs": [
            0
          ],
          "text": "Windu heads toward Hissrich with Kit Fisto, Prosset Dibs and Rissa Mano. The mission gives the issue a distinct ensemble while keeping Windu\u2019s judgment and responsibilities at its center.",
          "label": "The Hissrich assignment"
        }
      ]
    },
    "writtenAt": "2026-10-15T22:26:45.522Z",
    "investment": {
      "points": [
        {
          "refs": [
            0
          ],
          "text": "The appeal supported by this story is a sustained look at Windu as a leader facing the Jedi\u2019s wartime compromises. That gives a Windu-focused collection a clearer reason to include the issue than treating every Star Wars first issue as interchangeable.",
          "label": "A focused Windu collecting thesis"
        },
        {
          "refs": [
            0
          ],
          "text": "Kit Fisto, Prosset Dibs and Rissa Mano connect this opener to an ensemble mission. Their involvement helps explain the book\u2019s place in a character collection; an appearance alone does not establish a debut or a market premium.",
          "label": "The team is part of the appeal"
        },
        {
          "refs": [
            0
          ],
          "text": "The saved story establishes the issue, while this lot\u2019s cover edition remains unconfirmed. Compare the actual slab and cover with the edition record before using a guide value. If the case for buying depends on an unverified cover premium, pass until that distinction is resolved.",
          "label": "Keep the cover decision separate"
        }
      ],
      "heading": "Why consider this Mace Windu edition?"
    }
  },
  "localResearch": {
    "ppcfId": "PPCF-0000405236",
    "census": {
      "year": 2017,
      "issue": "1",
      "lower": 40,
      "title": "Star Wars: Mace Windu",
      "total": 123,
      "higher": 0,
      "atGrade": 83,
      "byGrade": {
        "0.5": 0,
        "1.0": 0,
        "1.5": 0,
        "1.8": 0,
        "2.0": 0,
        "2.5": 0,
        "3.0": 0,
        "3.5": 0,
        "4.0": 0,
        "4.5": 0,
        "5.0": 2,
        "5.5": 0,
        "6.0": 1,
        "6.5": 0,
        "7.0": 0,
        "7.5": 1,
        "8.0": 2,
        "8.5": 9,
        "9.0": 2,
        "9.2": 2,
        "9.4": 7,
        "9.6": 14,
        "9.8": 83,
        "9.9": 0,
        "10.0": 0
      },
      "atOrAbove": 83
    },
    "prices": [
      {
        "url": "/wiki/PPCF-0000405236",
        "kind": "guide",
        "grade": "9.8",
        "amount": 12,
        "source": "COMICBASE \u00b7 Price",
        "currency": "USD",
        "observedAt": "2017-08-30"
      },
      {
        "url": "/comics/91488d406c97a484f4c704e2e696940be8675485cfafc90f16df593787ade450",
        "grade": "RAW",
        "amount": 3.15,
        "source": "Stored price guide"
      },
      {
        "url": "/comics/91488d406c97a484f4c704e2e696940be8675485cfafc90f16df593787ade450",
        "grade": "4.0",
        "amount": 1.62,
        "source": "Stored price guide"
      },
      {
        "url": "/comics/91488d406c97a484f4c704e2e696940be8675485cfafc90f16df593787ade450",
        "grade": "6.0",
        "amount": 6.83,
        "source": "Stored price guide"
      },
      {
        "url": "/comics/91488d406c97a484f4c704e2e696940be8675485cfafc90f16df593787ade450",
        "grade": "8.0",
        "amount": 25,
        "source": "Stored price guide"
      },
      {
        "url": "/comics/91488d406c97a484f4c704e2e696940be8675485cfafc90f16df593787ade450",
        "grade": "9.2",
        "amount": 33,
        "source": "Stored price guide"
      },
      {
        "url": "/comics/91488d406c97a484f4c704e2e696940be8675485cfafc90f16df593787ade450",
        "grade": "9.4",
        "amount": 19.99,
        "source": "Stored price guide"
      },
      {
        "url": "/comics/91488d406c97a484f4c704e2e696940be8675485cfafc90f16df593787ade450",
        "grade": "9.6",
        "amount": 75,
        "source": "Stored price guide"
      },
      {
        "url": "/comics/91488d406c97a484f4c704e2e696940be8675485cfafc90f16df593787ade450",
        "grade": "9.8",
        "amount": 68,
        "source": "Stored price guide"
      },
      {
        "url": "/comics/91488d406c97a484f4c704e2e696940be8675485cfafc90f16df593787ade450",
        "grade": "10.0",
        "amount": 88,
        "source": "Stored price guide"
      }
    ],
    "missing": []
  }
}
```
