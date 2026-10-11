create or replace function public.pp_prev_snapshot_rows() returns bigint language sql stable security definer set search_path to 'public' as $function$
  select coalesce((select c from (select snapshot_date, count(*) c from public.pp_price_history where snapshot_date is not null group by snapshot_date having count(*) >= 100000 order by snapshot_date desc limit 1) s), 0);
$function$;
