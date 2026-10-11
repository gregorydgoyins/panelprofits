-- news_articles is a pass-through view over pp_news_stories. pp_news_stories has RLS with a public SELECT policy (using true),
-- so running the view with the caller's permissions returns the same rows to anon/authenticated as before.
alter view public.news_articles set (security_invoker = true);
