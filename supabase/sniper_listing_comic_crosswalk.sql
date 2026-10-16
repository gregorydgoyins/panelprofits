-- An identity link, not a duplicated valuation or rendered research cache.
alter table public.sniper_listings add column if not exists research_comic_id text;
with base as materialized (
   select l.*,coalesce(nullif(l.label->>'title',''),l.series) as research_series,
     coalesce(nullif(l.label->>'issueNumber',''),l.issue) as research_issue,
     case when l.label->>'issueDate' ~ '/[0-9]{4}$' then right(l.label->>'issueDate',4)::integer
       when l.label->>'issueDate' ~ '/[0-9]{2}$' then case when right(l.label->>'issueDate',2)::integer>30 then 1900 else 2000 end+right(l.label->>'issueDate',2)::integer
       else coalesce(l.pub_year,substring(l.title from '\m((?:19|20)[0-9]{2})\M')::integer) end as research_year,
     case when nullif(l.label->>'title','') is not null then l.label->>'edition' else l.edition end as research_edition,
     case when l.venue like 'ebay%' then 'ebay' else l.venue end as auction_site
   from public.sniper_listings l where l.status='live' and l.last_seen>=now()-interval '24 hours'
     and (l.end_time is null or l.end_time>now())
     and coalesce(case when l.label->>'grade' ~ '^[0-9]+(\.[0-9]+)?$' then (l.label->>'grade')::numeric end,l.grade)>=8.5
     and l.grader in ('CGC','CBCS','PSA','PGX','EGS')
 ), matched as materialized (
   select l.*,c.id as comic_id,c.panel_profits_data,c.gcd_data,c.comicbase_data,
     coalesce(c.panel_profits_data->>'PP Source ID',c.panel_profits_data->>'PriceCharting ID',c.pp_source_id) as source_id
   from base l join lateral (
     select c.*,count(*) over() as matches from public.rail_books rb join public.comics c on c.id=rb.comics_id
     where rb.series in(l.research_series,l.series,initcap(l.research_series)) and rb.issue_number=l.research_issue
       and (l.research_year is null or c.publication_year=l.research_year or (c.publication_year=l.research_year-1 and l.label->>'issueDate' ~ '^[123]/'))
       and (coalesce(c.printing,'') in ('','1','1st','First'))
       and (
         regexp_replace(lower(coalesce(c.cover_variant,'')),'[^a-z0-9]','','g')=regexp_replace(lower(coalesce(l.research_edition,'')),'[^a-z0-9]','','g')
         or (l.research_edition ~* '^(variant|variant edition)$' and length(coalesce(c.cover_variant,''))>=5
           and position(regexp_replace(lower(c.cover_variant),'[^a-z0-9]','','g') in regexp_replace(lower(l.title),'[^a-z0-9]','','g'))>0)
       )
       and (coalesce(l.research_edition,'')<>'' or nullif(l.label->>'title','') is not null or l.title !~* '\m(variant|virgin|exclusive|incentive|newsstand|reprint)\M')
     limit 2
   ) c on c.matches=1
 ) update public.sniper_listings l set research_comic_id=m.comic_id from matched m where l.item_id=m.item_id and l.research_comic_id is distinct from m.comic_id;
