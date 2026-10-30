-- Compound and Covering Indexes for High-Velocity Catalog & Price Lookups
-- Target: Sub-50ms execution on catalog filter sweeps, continuous queue paging, and historical price queries.

-- 1. Compound index for filtered catalog lookups by publisher, publication year, and series
CREATE INDEX IF NOT EXISTS idx_comics_publisher_year_series
  ON public.comics (publisher, publication_year, series);

-- 2. Compound index for series + issue lookups (the primary search & crosswalk path)
CREATE INDEX IF NOT EXISTS idx_comics_series_issue_clean
  ON public.comics (series, issue_number);

-- 3. Composite index on pp_price_history for rapid timeseries extraction per comic & grade
CREATE INDEX IF NOT EXISTS idx_pp_price_history_comic_grade_observed
  ON public.pp_price_history (comic_id, grade, observed_at DESC);

-- 4. Fast lookup index for rail equities continuous queue and era partitioning
CREATE INDEX IF NOT EXISTS idx_rail_equities_era_sov_active
  ON public.rail_equities (era, sovereign_tier, active)
  WHERE active = true;
