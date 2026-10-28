import subprocess
import json

def run_query(sql):
    cmd = ["supabase", "db", "query", "--linked", sql]
    result = subprocess.run(cmd, capture_output=True, text=True, cwd="/Users/macuser/Documents/anti gravity panel profits/panel-profits")
    if result.returncode != 0:
        raise RuntimeError(f"Query failed: {result.stderr or result.stdout}")
    # find json output
    output = result.stdout
    start_idx = output.find('{')
    end_idx = output.rfind('}')
    if start_idx == -1 or end_idx == -1:
        raise ValueError(f"No JSON found in output: {output}")
    data = json.loads(output[start_idx:end_idx+1])
    return data.get("rows", [])

def main():
    print("--- Verifying Row Counts ---")
    counts_sql = """
    SELECT 
      count(*) as total_rows,
      count(bid_ask_spread_pct) as count_bid_ask_spread_pct,
      count(intrinsic_floor) as count_intrinsic_floor,
      count(time_value) as count_time_value,
      count(liquidity_score) as count_liquidity_score,
      count(volatility_score) as count_volatility_score
    FROM pp_series_rows_full;
    """
    counts = run_query(counts_sql)[0]
    print(json.dumps(counts, indent=2))

    print("\n--- Summary Statistics ---")
    stats_sql = """
    SELECT
      ROUND(AVG(bid_ask_spread_pct), 2) as avg_spread_pct,
      ROUND(MIN(bid_ask_spread_pct), 2) as min_spread_pct,
      ROUND(MAX(bid_ask_spread_pct), 2) as max_spread_pct,
      ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY bid_ask_spread_pct)::numeric, 2) as median_spread_pct,
      
      ROUND(AVG(intrinsic_floor), 2) as avg_floor,
      ROUND(MIN(intrinsic_floor), 2) as min_floor,
      ROUND(MAX(intrinsic_floor), 2) as max_floor,
      ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY intrinsic_floor)::numeric, 2) as median_floor,
      
      ROUND(AVG(time_value), 2) as avg_time_value,
      ROUND(MIN(time_value), 2) as min_time_value,
      ROUND(MAX(time_value), 2) as max_time_value,
      ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY time_value)::numeric, 2) as median_time_value,

      ROUND(AVG(liquidity_score), 2) as avg_liquidity_score,
      ROUND(MIN(liquidity_score), 2) as min_liquidity_score,
      ROUND(MAX(liquidity_score), 2) as max_liquidity_score,
      ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY liquidity_score)::numeric, 2) as median_liquidity_score,

      ROUND(AVG(volatility_score), 2) as avg_volatility_score,
      ROUND(MIN(volatility_score), 2) as min_volatility_score,
      ROUND(MAX(volatility_score), 2) as max_volatility_score,
      ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY volatility_score)::numeric, 2) as median_volatility_score
    FROM pp_series_rows_full;
    """
    stats = run_query(stats_sql)[0]
    print(json.dumps(stats, indent=2))

    print("\n--- Distribution Breakdown ---")
    dist_sql = """
    SELECT
      -- Liquidity tiers
      COUNT(*) FILTER (WHERE liquidity_score >= 80) as liq_very_high_80_100,
      COUNT(*) FILTER (WHERE liquidity_score >= 60 AND liquidity_score < 80) as liq_high_60_80,
      COUNT(*) FILTER (WHERE liquidity_score >= 40 AND liquidity_score < 60) as liq_moderate_40_60,
      COUNT(*) FILTER (WHERE liquidity_score >= 20 AND liquidity_score < 40) as liq_low_20_40,
      COUNT(*) FILTER (WHERE liquidity_score < 20) as liq_illiquid_0_20,

      -- Volatility tiers
      COUNT(*) FILTER (WHERE volatility_score >= 100) as vol_extreme_100_plus,
      COUNT(*) FILTER (WHERE volatility_score >= 20 AND volatility_score < 100) as vol_high_20_100,
      COUNT(*) FILTER (WHERE volatility_score >= 5 AND volatility_score < 20) as vol_moderate_5_20,
      COUNT(*) FILTER (WHERE volatility_score >= 0 AND volatility_score < 5) as vol_low_0_5,
      COUNT(*) FILTER (WHERE volatility_score < 0) as vol_negative,

      -- Floor distribution
      COUNT(*) FILTER (WHERE intrinsic_floor = 0) as floor_zero,
      COUNT(*) FILTER (WHERE intrinsic_floor > 0 AND intrinsic_floor <= 5) as floor_under_5,
      COUNT(*) FILTER (WHERE intrinsic_floor > 5 AND intrinsic_floor <= 25) as floor_5_to_25,
      COUNT(*) FILTER (WHERE intrinsic_floor > 25 AND intrinsic_floor <= 100) as floor_25_to_100,
      COUNT(*) FILTER (WHERE intrinsic_floor > 100) as floor_over_100
    FROM pp_series_rows_full;
    """
    dist = run_query(dist_sql)[0]
    print(json.dumps(dist, indent=2))

if __name__ == '__main__':
    main()
