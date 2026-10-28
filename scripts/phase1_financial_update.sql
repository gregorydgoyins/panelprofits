UPDATE pp_series_rows_full
SET
  bid_ask_spread_pct = CASE
    WHEN pp_retail_raw_sell > 0 AND pp_retail_raw_buy > 0 THEN
      ROUND(((pp_retail_raw_sell - pp_retail_raw_buy) / pp_retail_raw_sell) * 100, 2)
    ELSE NULL
  END,
  intrinsic_floor = ROUND(COALESCE(pp_retail_raw_buy, pp_price_raw * 0.50, 0), 2),
  time_value = CASE
    WHEN pp_price_9_8 > COALESCE(pp_retail_raw_buy, pp_price_raw * 0.50, 0) THEN
      ROUND(pp_price_9_8 - COALESCE(pp_retail_raw_buy, pp_price_raw * 0.50, 0), 2)
    ELSE 0
  END,
  liquidity_score = GREATEST(0, LEAST(100, ROUND(100 - COALESCE(((pp_retail_raw_sell - pp_retail_raw_buy) / NULLIF(pp_retail_raw_sell, 0)) * 100, 50), 2))),
  volatility_score = CASE
    WHEN pp_price_raw > 0 AND pp_price_9_8 > 0 THEN
      LEAST(9999.99, ROUND((((pp_price_9_8 - pp_price_raw) / pp_price_raw) * (1 + COALESCE((pp_retail_raw_sell - pp_retail_raw_buy) / NULLIF(pp_retail_raw_sell, 0), 0.3))), 2))
    ELSE NULL
  END;
