-- Give the 4 reserved columns real types. All are empty in every row, so the type change loses nothing.
-- ebay_last_sold_price: sold price in USD; ebay_last_sold_date: sale date; ebay_country: ISO 3166-1 alpha-2 code
-- (e.g. US); volatility_30d: numeric, equation still to be defined.
begin;

drop view if exists public.panel_profits_comics;

alter table public.comics
  alter column ebay_last_sold_price type numeric(12,2) using null,
  alter column ebay_last_sold_date  type date          using null,
  alter column ebay_country         type char(2)       using null,
  alter column volatility_30d       type numeric       using null;

alter table public.comics drop constraint if exists comics_ebay_country_alpha2;
alter table public.comics add constraint comics_ebay_country_alpha2
  check (ebay_country is null or ebay_country ~ '^[A-Z]{2}$');

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
