create table public.rail_equities as
with good as (
  select distinct on (pp_id) * from public.pp_series_rows
  where keep_row = 'yes' and pp_quarantine_class is null
  order by pp_id, row_id
), priced as (
  select g.*,
    case when pp_price_9_8 is not null then '9.8' when pp_price_9_4 is not null then '9.4' when pp_price_9_2 is not null then '9.2'
         when pp_price_8_0 is not null then '8.0' when pp_price_6_0 is not null then '6.0' when pp_price_4_0 is not null then '4.0'
         when pp_price_raw is not null then 'RAW' end as ref_grade,
    coalesce(pp_price_9_8, pp_price_9_4, pp_price_9_2, pp_price_8_0, pp_price_6_0, pp_price_4_0, pp_price_raw) as fmv,
    coalesce(pp_publication_year, extract(year from pp_publication_date)::int) as yr
  from good g
)
select
  'pp-' || p.pp_id as id,
  p.pp_id as source_product_id,
  p.pp_series as series,
  p.pp_issue as issue_number,
  p.pp_title as title,
  p.yr as publication_year,
  p.pp_publication_date as publication_date,
  nullif(trim(c.publisher), '') as publisher,
  p.fmv as fmv_usd,
  p.ref_grade as reference_grade,
  c.cover_url as cover_url,
  case when p.yr is null then null
       when p.yr < 1938 then 'platinum' when p.yr <= 1945 then 'golden' when p.yr <= 1955 then 'atomic'
       when p.yr <= 1969 then 'silver' when p.yr <= 1983 then 'bronze' when p.yr <= 1991 then 'copper'
       when p.yr <= 2003 then 'modern' when p.yr <= 2016 then 'independent' else 'postmodern' end as production_age,
  p.pp_variant as variant,
  (p.pp_direct is not null) as is_direct,
  c.id as comic_id,
  'ACTIVE'::text as status
from priced p
join public.comics c on c.pp_source_id = p.pp_id
where p.fmv is not null
  and c.cover_url is not null and c.cover_url <> ''
  and c.cover_url not like '%files1.comics.org%' and c.cover_url not like '%526.jpg%';

alter table public.rail_equities add primary key (id);
create index rail_equities_order_idx on public.rail_equities (is_direct, publication_year, fmv_usd desc, id);
create index rail_equities_age_idx on public.rail_equities (production_age);
alter table public.rail_equities enable row level security;
comment on table public.rail_equities is 'Rail source: confirmed single-issue books from pp_series_rows (keep_row=yes, not quarantined) joined to comics for cover/publisher. fmv_usd is the best available PriceCharting grade, labeled in reference_grade. id = pp-<pp_id> (unique detail-page key).';
