-- Fill the six pp grade-price columns that were never loaded (pp_price_2_0, 3_0, 5_0, 7_0, 9_0, 9_6).
-- Source: the Oct 6 PriceCharting load, via quarantine.comics_20261026 (values verified equal to the source file):
--   condition-9 -> 2.0, condition-13 -> 3.0, condition-14 -> 5.0, condition-15 -> 7.0, condition-16 -> 9.0, condition-10 -> 9.6.
-- Only NULL cells are filled; blank source cells stay NULL (unpriced). No estimates.
begin;
set local statement_timeout = '900s';
update public.pp_series_rows_full f set
  pp_price_2_0 = coalesce(f.pp_price_2_0, nullif(regexp_replace(c."2.0", '[^0-9.]', '', 'g'), '')::numeric),
  pp_price_3_0 = coalesce(f.pp_price_3_0, nullif(regexp_replace(c."3.0", '[^0-9.]', '', 'g'), '')::numeric),
  pp_price_5_0 = coalesce(f.pp_price_5_0, nullif(regexp_replace(c."5.0", '[^0-9.]', '', 'g'), '')::numeric),
  pp_price_7_0 = coalesce(f.pp_price_7_0, nullif(regexp_replace(c."7.0", '[^0-9.]', '', 'g'), '')::numeric),
  pp_price_9_0 = coalesce(f.pp_price_9_0, nullif(regexp_replace(c."9.0", '[^0-9.]', '', 'g'), '')::numeric),
  pp_price_9_6 = coalesce(f.pp_price_9_6, nullif(regexp_replace(c."9.6", '[^0-9.]', '', 'g'), '')::numeric)
from quarantine.comics_20261026 c
where c.id = f.pp_id::text;
commit;
