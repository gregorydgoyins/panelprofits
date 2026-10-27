-- Remove 10 columns that are empty in every row of public.comics. They are PriceCharting source-format
-- (condition-19..22, gamestop) or never-built placeholders (ebay_*, volatility_30d) and are not produced by
-- the PriceCharting -> pp translation layer (pp_price_stage / pp_price_history). No data is lost: all 10 were
-- verified 100% empty across 355,692 rows. The PriceCharting intake header check in pp_fetch_stage is intentionally unchanged.
begin;

drop view if exists public.panel_profits_comics;

alter table public.comics
  drop column if exists "condition-19-price",
  drop column if exists "condition-20-price",
  drop column if exists "condition-21-price",
  drop column if exists "condition-22-price",
  drop column if exists "gamestop-price",
  drop column if exists "gamestop-trade-price",
  drop column if exists ebay_last_sold_price,
  drop column if exists ebay_last_sold_date,
  drop column if exists ebay_country,
  drop column if exists volatility_30d;

create view public.panel_profits_comics as
select id, series, title, raw, "4.0", "6.0", "8.0", "9.2", "9.8", "10.0", "2.0", "9.6", "3.0", "5.0", "7.0", "9.0", "9.4",
       "9.8_sell", retail_raw_buy, retail_raw_sell, "retail_4.0_buy", "retail_4.0_sell", "retail_6.0_buy", "retail_6.0_sell",
       upc, sales_volume, issue_number, direct, variant, variant_type, release_date, tier, gcd_issue_id, gcd_series_id,
       comicbase_item_id, highres_cover_url, market_cap_9_8, spread_raw_to_98, ratio_raw_to_98, ratio_96_to_98,
       liquidity_velocity_score, summary, why_i_should_invest_in_this_comic, videos
from public.comics;

grant select on public.panel_profits_comics to anon, authenticated;
grant all on public.panel_profits_comics to service_role;

commit;
