-- Migration: 20261003120000_verified_equities_canon.sql
-- Description: Creates verified_equities canon table for synchronized high-speed equities estate

CREATE TABLE IF NOT EXISTS public.verified_equities (
  id text PRIMARY KEY,
  series text NOT NULL,
  issue_number text NOT NULL,
  title text,
  publication_year integer,
  publisher text,
  fmv_usd numeric(12,2) NOT NULL,
  price_formatted text,
  cover_url text,
  ticker text NOT NULL,
  origin_era text,
  production_age text,
  reference_grade text DEFAULT '9.8',
  gregory_score numeric(8,2),
  delta_percent numeric(8,2),
  status text DEFAULT 'ACTIVE',
  variant text,
  source_product_id text,
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ve_fmv ON public.verified_equities(fmv_usd);
CREATE INDEX IF NOT EXISTS idx_ve_ticker ON public.verified_equities(ticker);
CREATE INDEX IF NOT EXISTS idx_ve_series_issue ON public.verified_equities(series, issue_number);
CREATE INDEX IF NOT EXISTS idx_ve_source_product_id ON public.verified_equities(source_product_id);

ALTER TABLE public.verified_equities ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'verified_equities' AND policyname = 'Allow public read access to verified_equities'
  ) THEN
    CREATE POLICY "Allow public read access to verified_equities" ON public.verified_equities FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'verified_equities' AND policyname = 'Allow service role full access to verified_equities'
  ) THEN
    CREATE POLICY "Allow service role full access to verified_equities" ON public.verified_equities FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;
