create table if not exists public.ppix_composite_constituents (
  class_id      text primary key,
  short_code    text not null,
  comics_id     text,
  series        text,
  issue_number  text,
  year          integer,
  variant_label text,
  price_source  text,           -- 'PP' (PriceCharting ladder) or 'CB' (ComicBase)
  price_basis   text,           -- 'RAW', '9.8' or 'CB'
  base_price    numeric,
  base_date     date,
  status        text not null,  -- 'ACTIVE' or 'NO_DATA_SOURCE'
  selection_rule text,
  created_at    timestamptz default now()
);
alter table public.ppix_composite_constituents enable row level security;

with base as (
  select b.*, (b.pp_ladder->>'RAW')::numeric raw, (b.pp_ladder->>'9.8')::numeric g98
  from public.rail_books b
  where b.pp_ladder is not null and b.issue_number <> '' and b.year is not null and b.series !~ '#|"'
    and b.pp_ladder ? 'RAW' and b.pp_ladder ? '9.8'),
cls as (
  select *, case
    when edition_form='NEWSSTAND' then 'NEWSSTAND_EDITION'
    when variant_label ~* '(misprint|miscut|mis-cut|print error|^error|error\M)' and variant_label !~* 'terror' then 'ERROR_PRINTING'
    when variant_label ~* '(ashcan|prototype)' then 'PROTOTYPE_ASHCAN'
    when variant_label ~ '^1\s*:\s*\d+' then 'RATIO_INCENTIVE_VARIANT'
    when variant_label ~* '^(uk|canadian( price)?)$' then 'PRICE_VARIANT'
    when printing ~ '^([2-9]|1[0-9])$' then 'SUBSEQUENT_PRINTING'
    when edition_form='VARIANT' and variant_label ~* '(virgin|foil|sketch|blank)' then 'COVER_ART_VARIANT'
    when edition_form='DIRECT' and variant_label is null and (printing='1' or printing is null) then 'DIRECT_POOL'
  end c from base),
ranked as (select *, row_number() over (partition by c order by raw desc, comics_id) rn from cls where c is not null),
direct3 as (select *, case rn when 1 then 'GRADED_UNIVERSAL' when 2 then 'RAW_UNGRADED' when 3 then 'DIRECT_EDITION' end cid from ranked where c='DIRECT_POOL' and rn<=3),
picks as (
  select c cid, comics_id, series, issue_number, year, variant_label, 'PP' src,
         null::text basis, raw, g98 from ranked where c<>'DIRECT_POOL' and rn=1
  union all
  select cid, comics_id, series, issue_number, year, variant_label, 'PP', null, raw, g98 from direct3
),
foreign_pick as (
  select 'FOREIGN_TRANSLATION' cid, comics_id, series, issue_number, year, variant_label, 'CB' src, 'CB' basis, cb_price raw, null::numeric g98
  from public.rail_books
  where cb_price is not null and pp_ladder is null and issue_number <> '' and year is not null and series !~ '#|"'
    and publisher in ('Editormex','D.C. Thomson','Editorial Novaro','Editorial Bruguera','IPC','Bastei Verlag','Amalgamated Press','Ediciones Toray','Editorial Valenciana','Editorial Ejea S.A. de C.V.','Novedades','Dupuis','Editora Abril','Editora Cinco','Editorial Sayrols','Editorial Toukan','Agência Portuguesa de Revistas','Ediperiodici','Elvifrance','Cinebook')
  order by cb_price desc, comics_id limit 1
),
allp as (select * from picks union all select * from foreign_pick)
insert into public.ppix_composite_constituents (class_id, short_code, comics_id, series, issue_number, year, variant_label, price_source, price_basis, base_price, base_date, status, selection_rule)
select a.cid,
  (array['SOV','SIG','PED','NEW','PRV','RAT','RAW','VAR','DIR','QLF','RST','CNS','PRN','INT','ERR','ASH'])[array_position(array['GRADED_UNIVERSAL','SIGNATURE_SERIES','PEDIGREE_PROVENANCE','NEWSSTAND_EDITION','PRICE_VARIANT','RATIO_INCENTIVE_VARIANT','RAW_UNGRADED','COVER_ART_VARIANT','DIRECT_EDITION','QUALIFIED_LABEL','RESTORED_LABEL','CONSERVED_LABEL','SUBSEQUENT_PRINTING','FOREIGN_TRANSLATION','ERROR_PRINTING','PROTOTYPE_ASHCAN'], a.cid)],
  a.comics_id, a.series, a.issue_number, a.year, a.variant_label, a.src,
  case when a.cid='GRADED_UNIVERSAL' then '9.8' when a.src='CB' then 'CB' else 'RAW' end,
  case when a.cid='GRADED_UNIVERSAL' then a.g98 else a.raw end,
  date '2026-10-06', 'ACTIVE',
  'Highest-priced well-formed member of the class (PriceCharting ladder with RAW and 9.8, issue number and year present); ComicBase price for the foreign class.'
from allp a;

insert into public.ppix_composite_constituents (class_id, short_code, status, selection_rule)
values
 ('SIGNATURE_SERIES','SIG','NO_DATA_SOURCE','No source in the database records signature-series labels.'),
 ('PEDIGREE_PROVENANCE','PED','NO_DATA_SOURCE','No source in the database records pedigree provenance.'),
 ('QUALIFIED_LABEL','QLF','NO_DATA_SOURCE','No source in the database records qualified labels.'),
 ('RESTORED_LABEL','RST','NO_DATA_SOURCE','No source in the database records restored labels.'),
 ('CONSERVED_LABEL','CNS','NO_DATA_SOURCE','No source in the database records conserved labels.')
on conflict (class_id) do nothing;
