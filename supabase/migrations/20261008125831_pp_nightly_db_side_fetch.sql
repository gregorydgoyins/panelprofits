-- Only Comic Books rows are staged (the download link also carries other PriceCharting categories).
create or replace function public.pp_stage_csv_chunk(p_label text, p_chunk text, p_skip_header boolean default false)
 returns integer language plpgsql security definer set search_path to 'public' set statement_timeout to '600s'
as $function$
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
  where array_length(a, 1) >= 32 and btrim(a[1]) <> '' and btrim(a[2], '" ') like 'Comic Books%';
  get diagnostics n = row_count;
  return n;
end $function$;

-- Download inside Postgres (http extension) and stage in slices; the edge function only passes the link in.
create or replace function public.pp_fetch_stage(p_url text, p_label text)
 returns jsonb language plpgsql security definer set search_path to 'public', 'extensions' set statement_timeout to '900s'
as $function$
declare
  r extensions.http_response; body text; len int; pos int := 1; cut int; piece text; staged int := 0; first boolean := true;
  hdr text; expected text := 'id,console-name,product-name,loose-price,cib-price,new-price,graded-price,box-only-price,manual-only-price,bgs-10-price,condition-9-price,condition-10-price,condition-13-price,condition-14-price,condition-15-price,condition-16-price,condition-17-price,condition-18-price,condition-19-price,condition-20-price,condition-21-price,condition-22-price,gamestop-price,gamestop-trade-price,retail-loose-buy,retail-loose-sell,retail-cib-buy,retail-cib-sell,retail-new-buy,retail-new-sell,upc,sales-volume,genre,tcg-id,asin,epid,release-date';
  step constant int := 2000000; t0 timestamptz := clock_timestamp(); lines int;
begin
  begin
    perform extensions.http_set_curlopt('CURLOPT_TIMEOUT', '420');
    r := extensions.http_get(p_url);
  exception when others then
    return jsonb_build_object('ok', false, 'stage', 'download', 'error', replace(sqlerrm, p_url, '<link>'));
  end;
  if r.status <> 200 then return jsonb_build_object('ok', false, 'stage', 'download', 'http_status', r.status); end if;
  body := r.content; len := length(body);
  if len > 0 and ascii(substr(body, 1, 1)) = 65279 then body := substr(body, 2); len := len - 1; end if;
  hdr := btrim(split_part(body, E'\n', 1), E'\r ');
  if hdr <> expected then return jsonb_build_object('ok', false, 'stage', 'header', 'error', 'header differs from the 37-column layout', 'bytes', len); end if;
  lines := len - length(replace(body, E'\n', ''));
  while pos <= len loop
    if pos + step > len then piece := substr(body, pos); pos := len + 1;
    else
      cut := position(E'\n' in substr(body, pos + step, 400000));
      if cut = 0 then piece := substr(body, pos); pos := len + 1;
      else piece := substr(body, pos, step + cut); pos := pos + step + cut; end if;
    end if;
    staged := staged + pp_stage_csv_chunk(p_label, piece, first);
    first := false;
  end loop;
  return jsonb_build_object('ok', true, 'bytes', len, 'file_lines', lines, 'comic_rows_staged', staged, 'seconds', round(extract(epoch from clock_timestamp() - t0)::numeric, 1));
end $function$;

revoke all on function public.pp_fetch_stage(text, text) from public, anon, authenticated;
grant execute on function public.pp_fetch_stage(text, text) to service_role;
