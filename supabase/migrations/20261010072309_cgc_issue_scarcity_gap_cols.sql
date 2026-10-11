alter table public.cgc_issue_scarcity
  add column if not exists issue_number text,
  add column if not exists snap_grade numeric(3,1),
  add column if not exists series_avg numeric(5,3),
  add column if not exists series_snap numeric(3,1),
  add column if not exists grade_gap numeric(5,3),
  add column if not exists tier text;
