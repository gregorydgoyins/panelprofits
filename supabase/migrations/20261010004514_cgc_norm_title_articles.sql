create or replace function public.cgc_norm_title(t text) returns text
language sql immutable parallel safe as $$
  select regexp_replace(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          regexp_replace(lower(coalesce(t,'')), '\s*\([^)]*\)', '', 'g'),
        ',\s*(the|a|an)\s*$', '', 'g'),
      '^(the|a|an)\s+', '', 'g'),
    '&', ' and ', 'g'),
  '[^a-z0-9]+', '', 'g')
$$;
reindex index public.cgc_population_norm_idx;
