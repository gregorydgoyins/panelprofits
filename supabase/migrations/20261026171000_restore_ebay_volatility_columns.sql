-- Owner decision: ebay_last_sold_price, ebay_last_sold_date, ebay_country and volatility_30d STAY on public.comics
-- (eBay prices must be acquired from eBay; volatility definition still to be designed). They were dropped by
-- 20261026170000 in error. They were empty in every row, so re-adding them as empty text columns (their original type)
-- restores the prior state. Only the 6 PriceCharting-format columns (condition-19..22, gamestop x2) remain removed.
begin;

alter table public.comics
  add column if not exists volatility_30d text,
  add column if not exists ebay_last_sold_price text,
  add column if not exists ebay_last_sold_date text,
  add column if not exists ebay_country text;

drop view if exists public.panel_profits_comics;

create view public.panel_profits_comics as
select id, series, title, raw, "4.0", "6.0", "8.0", "9.2", "9.8", "10.0", "2.0", "9.6", "3.0", "5.0", "7.0", "9.0", "9.4",
       "9.8_sell", retail_raw_buy, retail_raw_sell, "retail_4.0_buy", "retail_4.0_sell", "retail_6.0_buy", "retail_6.0_sell",
       upc, sales_volume, issue_number, direct, variant, variant_type, release_date, tier, gcd_issue_id, gcd_series_id,
       comicbase_item_id, highres_cover_url, market_cap_9_8, spread_raw_to_98, ratio_raw_to_98, ratio_96_to_98,
       volatility_30d, ebay_last_sold_price, ebay_last_sold_date, ebay_country,
       liquidity_velocity_score, summary, why_i_should_invest_in_this_comic, videos
from public.comics;

grant select on public.panel_profits_comics to anon, authenticated;
grant all on public.panel_profits_comics to service_role;

commit;
