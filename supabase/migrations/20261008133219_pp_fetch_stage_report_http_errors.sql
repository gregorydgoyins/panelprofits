CREATE OR REPLACE FUNCTION public.pp_fetch_stage(p_url text, p_label text)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'extensions' SET statement_timeout TO '900s'
AS $function$
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
  if r.status <> 200 then return jsonb_build_object('ok', false, 'stage', 'download', 'http_status', r.status, 'ctype', r.content_type, 'headers', (select jsonb_object_agg(lower(h.field), left(h.value,120)) from unnest(r.headers) h where lower(h.field) in ('retry-after','server','content-type','cf-cache-status','cf-ray','x-ratelimit-remaining')), 'body', left(replace(coalesce(r.content,''), p_url, '<link>'), 400), 'seconds', round(extract(epoch from clock_timestamp() - t0)::numeric, 1)); end if;
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
