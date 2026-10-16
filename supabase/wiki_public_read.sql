-- Existing public encyclopedia read policy is enabled; restore the missing table privilege.
-- No writes are granted. Original source-import tables remain service-only.
grant select on public.ppcf_wiki_pages to anon,authenticated;
