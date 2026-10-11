create table if not exists public.cb_cover_match as
with g0 as (select key, string_to_array(key,'/') p from public.gcs_cover_keys where key ~ '\.jpg$'),
g1 as (select key, case when array_length(p,1)=6 then p[5] else p[4] end series_raw, regexp_replace(p[array_length(p,1)],'\.jpg$','') iss from g0 where array_length(p,1) in (5,6)),
g as (select key,
  regexp_replace(regexp_replace(lower(regexp_replace(series_raw,'\s*\((?:[^)]*series|vol[^)]*)\)\s*$','','i')),'\mthe\M',' ','g'),'[^a-z0-9]','','g') nser,
  coalesce(substring(series_raw from '\((\d+)(?:st|nd|rd|th) Series\)\s*$')::int,1) vol,
  regexp_replace(iss,'^0+(?=[0-9])','') nissue from g1 where iss ~ '^[0-9]+(\.[0-9]+)?$'),
c as (select id,
  regexp_replace(regexp_replace(lower(series),'\mthe\M',' ','g'),'[^a-z0-9]','','g') nser,
  regexp_replace(issue_number,'^0+(?=[0-9])','') nissue,
  case when volume ~ '^[0-9]+$' then volume::int end volnum
  from public.comics where comicbase_source_id like 'CBROW-%'),
j as (select g.key, c.id, count(*) over (partition by g.key) n_per_cover, count(*) over (partition by c.id) n_per_row
  from g join c on c.nser=g.nser and c.nissue=g.nissue and c.volnum=g.vol)
select key as gcs_key, id as comics_id from j where n_per_cover=1 and n_per_row=1;
alter table public.cb_cover_match add primary key (gcs_key);
alter table public.cb_cover_match enable row level security;
