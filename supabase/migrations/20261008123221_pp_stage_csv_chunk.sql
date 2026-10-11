create or replace function public.pp_money(t text) returns numeric language sql immutable as $$
  select case when regexp_replace(coalesce(t,''), '[$",[:space:]]', '', 'g') ~ '^-?[0-9]+(\.[0-9]+)?$'
              then regexp_replace(t, '[$",[:space:]]', '', 'g')::numeric end
$$;

-- Parses a chunk of raw price-guide CSV text (whole lines) into public.pp_price_stage. Column mapping (1-based CSV position):
-- loose 4=RAW, cib 5=4.0, new 6=6.0, graded 7=8.0, box-only 8=9.2, manual-only 9=9.8, bgs-10 10=10.0,
-- condition-9 11=2.0, condition-10 12=9.6, condition-13 13=3.0, condition-14 14=5.0, condition-15 15=7.0, condition-16 16=9.0,
-- condition-17 17=9.4, condition-18 18=9.8 sell, retail-loose 25/26, retail-cib 27/28, retail-new 29/30, sales-volume 32.
create or replace function public.pp_stage_csv_chunk(p_label text, p_chunk text, p_skip_header boolean default false)
returns integer language plpgsql security definer set search_path = public set statement_timeout = '600s' as $$
declare n integer;
begin
  insert into public.pp_price_stage (run_label, pp_id, pp_sales_volume, pp_price_raw, pp_price_2_0, pp_price_3_0, pp_price_4_0, pp_price_5_0,
    pp_price_6_0, pp_price_7_0, pp_price_8_0, pp_price_9_0, pp_price_9_2, pp_price_9_4, pp_price_9_6, pp_price_9_8, pp_price_9_8_sell, pp_price_10_0,
    pp_retail_raw_buy, pp_retail_raw_sell, pp_retail_4_0_buy, pp_retail_4_0_sell, pp_retail_6_0_buy, pp_retail_6_0_sell)
  select p_label, btrim(a[1]),
    case when a[32] ~ '^\s*[0-9]+(\.[0-9]+)?\s*$' then trunc(a[32]::numeric)::int end,
    pp_money(a[4]), pp_money(a[11]), pp_money(a[13]), pp_money(a[5]), pp_money(a[14]), pp_money(a[6]), pp_money(a[15]), pp_money(a[7]),
    pp_money(a[16]), pp_money(a[8]), pp_money(a[17]), pp_money(a[12]), pp_money(a[9]), pp_money(a[18]), pp_money(a[10]),
    pp_money(a[25]), pp_money(a[26]), pp_money(a[27]), pp_money(a[28]), pp_money(a[29]), pp_money(a[30])
  from (
    select case when position('"' in ln) = 0 then string_to_array(ln, ',')
                else array(select m[1] from regexp_matches(ln, '("(?:[^"]|"")*"|[^,]*)(?:,|$)', 'g') as m) end as a
    from regexp_split_to_table(p_chunk, E'\r?\n') with ordinality as t(ln, ord)
    where ln <> '' and not (p_skip_header and ord = 1)
  ) f
  where array_length(a, 1) >= 32 and btrim(a[1]) <> '';
  get diagnostics n = row_count;
  return n;
end $$;
revoke all on function public.pp_stage_csv_chunk(text, text, boolean) from public, anon, authenticated;
grant execute on function public.pp_stage_csv_chunk(text, text, boolean) to service_role;
revoke all on function public.pp_money(text) from public, anon, authenticated;
grant execute on function public.pp_money(text) to service_role;
