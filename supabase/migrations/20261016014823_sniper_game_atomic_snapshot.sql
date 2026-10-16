create or replace function public.sniper_game_snapshot(p_owner text,p_refresh boolean default false)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare r record; offer jsonb; reference numeric; account jsonb; rounds jsonb; needed integer;
begin
 -- This takes the same account lock as bids and sales, serializing refresh and settlement.
 perform public.sniper_game_action(p_owner,'state');
 for r in select game_token from public.sniper_paper_orders where owner=p_owner and game_token is not null and game_resolved_at is null and game_deadline<=clock_timestamp()
 loop perform public.sniper_game_action(p_owner,'settle',r.game_token); end loop;
 if p_refresh then perform public.sniper_game_action(p_owner,'refresh'); end if;
 if not exists(select 1 from public.sniper_paper_orders where owner=p_owner and game_token is not null and status='waiting') then
  for r in select l.* from public.sniper_listings l where l.status='live' and l.buying_option='AUCTION' and l.price_usd>0 and l.grader is not null
   and l.end_time>clock_timestamp()+interval '30 seconds' and l.end_time<clock_timestamp()+interval '15 minutes'
   and not exists(select 1 from public.sniper_paper_orders o where o.owner=p_owner and o.game_token is not null and o.item_id=l.item_id)
   order by l.end_time limit 3
  loop
   reference:=null;
   select percentile_cont(.5) within group(order by (v->>'amount')::numeric) into reference
    from public.sniper_listing_writeup w cross join lateral jsonb_array_elements(coalesce(w.content->'prices','[]'::jsonb)) v
    where w.key='lot:'||substr(encode(sha256(convert_to(r.item_id,'UTF8')),'hex'),1,36)
    and v->>'grade'=to_char(r.grade,'FM999999990.0') and coalesce(v->>'kind','guide')='guide'
    and coalesce(v->>'currency','USD')='USD' and jsonb_typeof(v->'amount')='number' and (v->>'amount')::numeric>0;
   offer:=jsonb_build_object('itemId',r.item_id,'title',r.title,'series',r.series,'issue',r.issue,'grade',r.grade,'source','Stored venue listing','mode','live','endTime',r.end_time,'opening',1,
    'reference',reference,'referenceSource',case when reference is not null then 'Median stored exact-grade guide comparisons; not a realized sale' else null end,
    'metadata',jsonb_build_object('imageUrl',r.image_url,'url',r.url,'grader',r.grader,'year',r.pub_year,'publisher',r.publisher));
   perform public.sniper_game_action(p_owner,'offer',gen_random_uuid(),null,offer);
  end loop;
  select greatest(0,6-count(*)::integer) into needed from public.sniper_paper_orders where owner=p_owner and game_token is not null and status='waiting';
  for r in select s.* from public.sniper_sales s where s.confirmed=true and s.price_usd>0 and s.sold_at<clock_timestamp() and s.url is not null
   and not exists(select 1 from public.sniper_paper_orders o where o.owner=p_owner and o.game_token is not null and o.item_id=coalesce(s.item_id,'sale:'||s.id))
   order by random() limit needed
  loop
   offer:=jsonb_build_object('itemId',coalesce(r.item_id,'sale:'||r.id),'saleId',r.id,'title',r.series||' #'||r.issue||coalesce(' · '||r.grader||' '||r.grade::text,''),
    'series',r.series,'issue',r.issue,'grade',r.grade,'source',r.source,'mode','historical','durationMs',30000+floor(random()*870000)::integer,'opening',1,
    'metadata',jsonb_build_object('url',r.url,'grader',r.grader));
   perform public.sniper_game_action(p_owner,'offer',gen_random_uuid(),null,offer);
  end loop;
 end if;
 account:=public.sniper_game_action(p_owner,'state');
 select coalesce(jsonb_agg(to_jsonb(o)),'[]'::jsonb) into rounds from public.sniper_paper_orders o where o.owner=p_owner and o.game_token is not null and (
  (o.game_resolved_at is null and o.status<>'skipped') or (o.status='won' and o.game_sold_at is null) or o.id in (
   select h.id from public.sniper_paper_orders h where h.owner=p_owner and h.game_token is not null and h.game_resolved_at is not null order by h.game_resolved_at desc limit 50));
 return jsonb_build_object('account',account,'rounds',rounds);
end $$;
revoke all on function public.sniper_game_snapshot(text,boolean) from public,anon,authenticated;
grant execute on function public.sniper_game_snapshot(text,boolean) to service_role;
