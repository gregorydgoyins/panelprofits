alter table public.rail_cgc_census add column if not exists valid boolean not null default true;
update public.rail_cgc_census r set valid = false from public.cgc_population c where c.population_id = r.population_id and c.variant is not null;
