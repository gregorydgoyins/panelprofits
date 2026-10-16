-- Reuse the existing provider audit log as the cursor. Missing records no longer monopolize every run.
create or replace function public.sniper_research_batch(p_limit integer default 30)
returns table(item_id text) language sql stable security invoker set search_path=public,pg_temp as $$
 select l.item_id from public.sniper_listings l
 left join public.sniper_vendor_fetch v on v.key='local-research:v3:' || l.item_id
 where l.series is not null and l.issue is not null
   and l.research_comic_id is not null and coalesce(l.grade,0)>=8.5
   and (v.fetched_at is null or v.fetched_at < now()-interval '1 day')
 order by (v.fetched_at is not null),
   case when l.end_time>now() then 0 when l.status='live' then 1 else 2 end,
   l.last_seen desc,l.item_id
 limit greatest(1,least(p_limit,100));
$$;
revoke all on function public.sniper_research_batch(integer) from public,anon,authenticated;
grant execute on function public.sniper_research_batch(integer) to service_role;
