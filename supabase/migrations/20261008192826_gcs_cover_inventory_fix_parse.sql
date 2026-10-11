create or replace function public.gcs_cover_list_pages(p_marker text, p_pages int)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_marker text := coalesce(p_marker, '');
  v_url text;
  v_body text;
  v_status int;
  v_pages int := 0;
  v_rows int := 0;
  v_trunc boolean := true;
  v_next text;
  n int;
begin
  perform extensions.http_set_curlopt('CURLOPT_TIMEOUT','60');
  while v_pages < p_pages and v_trunc loop
    v_url := 'https://storage.googleapis.com/panel-profits-covers-all/?prefix=Pictures/&max-keys=1000'
             || case when v_marker <> '' then '&marker=' || replace(replace(extensions.urlencode(v_marker),'+','%20'),'''','%27') else '' end;
    select status, content into v_status, v_body from extensions.http_get(v_url);
    if v_status <> 200 then
      return jsonb_build_object('error','http '||v_status,'marker',v_marker,'pages',v_pages,'rows',v_rows,'body',left(v_body,300));
    end if;
    insert into public.gcs_cover_keys(key,size_bytes,generation)
    select replace(replace(replace(replace(replace(m[1],'&lt;','<'),'&gt;','>'),'&quot;','"'),'&apos;',''''),'&amp;','&'), m[3]::bigint, m[2]
    from regexp_matches(v_body, '<Contents><Key>([^<]*)</Key><Generation>([0-9]+)</Generation><MetaGeneration>[0-9]+</MetaGeneration><LastModified>[^<]*</LastModified><ETag>[^<]*</ETag><Size>([0-9]+)</Size></Contents>', 'g') as m
    on conflict (key) do update set size_bytes = excluded.size_bytes, generation = excluded.generation;
    get diagnostics n = row_count;
    v_rows := v_rows + n;
    v_pages := v_pages + 1;
    v_trunc := v_body like '%<IsTruncated>true</IsTruncated>%';
    v_next := substring(v_body from '<NextMarker>([^<]*)</NextMarker>');
    if v_trunc then
      v_marker := replace(replace(replace(replace(replace(coalesce(v_next,''),'&lt;','<'),'&gt;','>'),'&quot;','"'),'&apos;',''''),'&amp;','&');
    end if;
  end loop;
  return jsonb_build_object('marker', case when v_trunc then v_marker else null end, 'done', not v_trunc, 'pages', v_pages, 'rows', v_rows);
end $$;
