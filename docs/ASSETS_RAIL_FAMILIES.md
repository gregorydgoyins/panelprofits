# Assets Rail — Families & Sub-families (DRAFT for Greg's approval)

Built only from Greg's canon. Nothing here is invented; every line names its source.
Rule for every instrument on the rail: price = canon formula × real inputs. No hardcoded prices.
If a real input is missing the instrument is NOT issued ("no derivatives on vibes", I.1.11; "missing data is allowed, hallucination is not").

Sources: "Final 20 Asset Classes (LOCKED)" and bond/ETF/REIT definitions (Why the earlier models broke…pdf);
I.1.9 Bond Mathematics; I.1.10 Bonds Subdivided; I.1.11 Derivatives; I.1.12/13 Funds; I.1.14 Options; I.1.17 Structured;
I.1.18 Indices; I.1.22 Commodities & Currencies; I.1.24 Private Capital; I.1.26 Thematic Assets; I.1.27 SPACs;
I.1.28 Tokenization; Equity Math Canon; ETF Architecture; Developmental Blueprints & Formulas; Theorem VIII (Sidekick);
Theorem XII (Dimensional Hedging); Asset inventory (ticker prefixes, derivation chain, publisher tiers); Gemini formulas.

Canon locks the 20 classes in 8 groups. Merged to the six families Greg described:

| Family | Canon groups merged | Sub-families |
|---|---|---|
| 1 FIXED INCOME | I Sovereign & baselines + II Core credit | Treasuries · Money-market/Repo · Corporate (Publisher issuer bonds) · Municipal (location-backed) · Institutional Issue bonds (spine-backed) · Narrative/Attention bonds · Structured credit (ABS/CDO tranches) · Bond ETFs (ABND/SBND/BBND) · ABI-100 |
| 2 EQUITY CAPITAL | III Equity + VII Issuance | Common (raw issue) · Variant · Preferred (graded 9.8 IR-WAV) · Publisher equity · Private equity · IPO/primary issuance · SPAC / themed acquisition vehicles |
| 3 FUNDS & WRAPPERS | IV Fund structures | Sovereign Comic Funds (the 16 comic classes) · ETFs & index funds (MEQT, IEQT, BLND-60, CONS-40, AGGR-80, thematic) · REITs (equity wrapper over Location cash flows) · Mutual / closed-end funds (Teams, HHI) · Hedge-style funds · Indices (CE70, PPIX, PPIX Composite, era indices, GoCollect CPI) |
| 4 DERIVATIVES | V Derivatives | Options (calls/puts/LEAPs/straddle/spreads/butterfly) · Futures & forwards (incl. substrate futures: ink & paper) · Swaps (IRS, TRS, CDS, Creative-Team CDS) · Warrants (cross-media) · Convertibles · Volatility-linked · Census-gap · Sidekick derivatives · Meta-derivatives (options/futures on ETFs, indices) |
| 5 ALTERNATIVE & PHYSICAL | VI Alternative & physical | Commodities (paper, ink, print capacity) · Currencies/FX · IP objects: Gadgets, Weapons, Vehicles (Batmobile, scythes) as derivative claims on their owner · Locations (hard assets) · Crypto/NFT/FRAC/TOK |
| 6 NARRATIVE-LINKED | VIII Narrative-linked | Narrative equities (characters: heroes, villains, sidekicks, teams) · Narrative derivatives · Continuity/Provenance instruments (signature, pedigree, qualified, restored, conserved) · Media/Film adaptation · Creators |

## Formulas (canon, verbatim math) and the real inputs each needs

| Sub-family | Formula (source) | Inputs | Input status in DB |
|---|---|---|---|
| Equity price | P = P0·Vp·Vs·Vd·Mg·Mm·Ns·L·FX (Equity Math Canon). P0 = CGC 9.8 baseline. Share = WAV/100 | pp_ladder (9.8), cb_price, census | HAVE: 106,647 books with PP ladder, 411,335 with ComicBase history, 96,250 with census |
| Bonds | PV = Σ cP/(1+y)^k + P/(1+y)^T; ΣP ≤ φ·WAV; y = base + asset risk + liquidity spread (I.1.9) | WAV, σ, confidence, trade frequency, base rate | WAV HAVE. Base rate MISSING (see decisions) |
| Muni | Same PV, issuer = location; recovery by issuer class (I.1.10) | Location→anchor issues | Needs location↔issue mapping (MISSING) |
| Narrative bond | dτ = κ·dt (κ=2.5 hype, 0 locked) (Blueprints 1) | Regime state | Regime engine exists in canon; wiring MISSING |
| Options | Black–Scholes; σ_eff = σ_real·φ(L); eligibility: price conf ≥ 0.70, liquidity, non-stale (I.1.14, I.1.11) | S = share price, σ_real from log returns, r | S HAVE. σ_real: ComicBase annual 2021–24 (3 returns) PARTIAL; PP history = 1 snapshot (nightly load not running). r MISSING |
| Futures | F = S·e^((r+u−y)T) (I.1.11) | S, r, u, y | S HAVE; r,u,y MISSING |
| Swaps / CDS | IRS/TRS PV; CDS spread s solves PV_prem = PV_prot; hazard λ = governance state (I.1.11) | Curve, hazard, recovery | MISSING (policy tables) |
| Funds / ETF | NAV = Σ q·p − Fees − Liab − G(t); FSP = NAV/shares; ER 0.25/0.30/0.35/0.40%; drift ±5/±7% (I.1.12, ETF Architecture) | Constituent prices | HAVE once constituents exist |
| Index | I(t) = I(0)·Σ w·p(t)/p(0) (I.1.18) | Constituents, weights, base | CE70: 65 filled + 5 vacant; 42 matched to comics, 23 UNRESOLVED |
| REIT | Equity wrapper over location cash flows (canon: "REIT ≠ real estate") | Location cash flows | MISSING |
| Commodity | P_c = C_base·(D/S)·e^(κτ) (I.1.22) | Replacement cost, D, S | MISSING |
| IP objects (Batmobile etc.) | V_S = V_M·β·H, β<1; capped below mentor; γ≈2 decay (Theorem VIII) | Owner anchor-issue WAV | Derivable from real issue prices once owner→anchor mapping exists |
| Private capital | P = π·V_T/(1+r+λ)^T (I.1.24) | π, V_T, λ | MISSING |
| SPAC | P = T0·e^(−rt)·(1−∫π) (I.1.27) | Trust, deadline, failure density | MISSING (policy) |
| NFT/FRAC/TOK | P_NFT = P_u·λ_prov·λ_liq (I.1.28) | Underlying price | HAVE |
| Publisher cap | Composite publisher index → tier ×10/6/4/3; evidence-first, 3-AI, nulls allowed (Inventory) | 25–40 publisher dossiers | MISSING (tables specified, not built) |
| Thematic | P_theme = αS + βR + γU (I.1.26) | Scarcity, relevance, usability | Scarcity HAVE (census); R, U MISSING |

## Open decisions (Greg)
1. Base rate / risk-free r: canon says "system curve". Real Treasury yields (feed) or an internal curve defined in canon?
2. Real-world stocks to watch: canon's publisher valuation uses SEC filings/box office. A live market-data feed is not wired.
3. Canon contradiction: the locked 20-class list says characters/locations/gadgets are NOT assets (pricing inputs only); the Blueprints (Jan 2026) treat Locations as infrastructure assets and Theorem VIII prices gadgets/sidekicks as derivatives. Which governs?
