create unlogged table if not exists public.pp_price_stage (
  run_label text not null, pp_id text not null, pp_sales_volume int,
  pp_price_raw numeric, pp_price_2_0 numeric, pp_price_3_0 numeric, pp_price_4_0 numeric, pp_price_5_0 numeric, pp_price_6_0 numeric,
  pp_price_7_0 numeric, pp_price_8_0 numeric, pp_price_9_0 numeric, pp_price_9_2 numeric, pp_price_9_4 numeric, pp_price_9_6 numeric,
  pp_price_9_8 numeric, pp_price_9_8_sell numeric, pp_price_10_0 numeric,
  pp_retail_raw_buy numeric, pp_retail_raw_sell numeric, pp_retail_4_0_buy numeric, pp_retail_4_0_sell numeric,
  pp_retail_6_0_buy numeric, pp_retail_6_0_sell numeric);
create index if not exists pp_price_stage_label_idx on public.pp_price_stage (run_label);
alter table public.pp_price_stage enable row level security;

create or replace function public.pp_prev_snapshot_rows() returns bigint language sql stable security definer set search_path = public as $$
  select count(*) from public.pp_price_history where snapshot_date = (select max(snapshot_date) from public.pp_price_history);
$$;

-- One slice (p_part of p_parts, by hash of pp_id) of the nightly commit. Safe to re-run: history is only
-- inserted where this label has no row for the book yet; current prices only change where a value differs.
create or replace function public.pp_commit_prices(p_label text, p_snap date, p_part int, p_parts int)
returns jsonb language plpgsql security definer set search_path = public set statement_timeout = '600s' as $$
declare n_hist bigint; n_upd bigint;
begin
  insert into public.pp_price_history (pp_id, snapshot_label, snapshot_date, pp_sales_volume,
    pp_price_raw, pp_price_2_0, pp_price_3_0, pp_price_4_0, pp_price_5_0, pp_price_6_0, pp_price_7_0, pp_price_8_0, pp_price_9_0,
    pp_price_9_2, pp_price_9_4, pp_price_9_6, pp_price_9_8, pp_price_9_8_sell, pp_price_10_0,
    pp_retail_raw_buy, pp_retail_raw_sell, pp_retail_4_0_buy, pp_retail_4_0_sell, pp_retail_6_0_buy, pp_retail_6_0_sell)
  select s.pp_id, p_label, p_snap, s.pp_sales_volume,
    s.pp_price_raw, s.pp_price_2_0, s.pp_price_3_0, s.pp_price_4_0, s.pp_price_5_0, s.pp_price_6_0, s.pp_price_7_0, s.pp_price_8_0, s.pp_price_9_0,
    s.pp_price_9_2, s.pp_price_9_4, s.pp_price_9_6, s.pp_price_9_8, s.pp_price_9_8_sell, s.pp_price_10_0,
    s.pp_retail_raw_buy, s.pp_retail_raw_sell, s.pp_retail_4_0_buy, s.pp_retail_4_0_sell, s.pp_retail_6_0_buy, s.pp_retail_6_0_sell
  from public.pp_price_stage s
  where s.run_label = p_label and (abs(hashtext(s.pp_id)) % p_parts) = p_part
    and not exists (select 1 from public.pp_price_history h where h.pp_id = s.pp_id and h.snapshot_label = p_label);
  get diagnostics n_hist = row_count;

  update public.pp_series_rows_full t set
    pp_sales_volume = s.pp_sales_volume,
    pp_price_raw = s.pp_price_raw, pp_price_2_0 = s.pp_price_2_0, pp_price_3_0 = s.pp_price_3_0, pp_price_4_0 = s.pp_price_4_0,
    pp_price_5_0 = s.pp_price_5_0, pp_price_6_0 = s.pp_price_6_0, pp_price_7_0 = s.pp_price_7_0, pp_price_8_0 = s.pp_price_8_0,
    pp_price_9_0 = s.pp_price_9_0, pp_price_9_2 = s.pp_price_9_2, pp_price_9_4 = s.pp_price_9_4, pp_price_9_6 = s.pp_price_9_6,
    pp_price_9_8 = s.pp_price_9_8, pp_price_9_8_sell = s.pp_price_9_8_sell, pp_price_10_0 = s.pp_price_10_0,
    pp_retail_raw_buy = s.pp_retail_raw_buy, pp_retail_raw_sell = s.pp_retail_raw_sell,
    pp_retail_4_0_buy = s.pp_retail_4_0_buy, pp_retail_4_0_sell = s.pp_retail_4_0_sell,
    pp_retail_6_0_buy = s.pp_retail_6_0_buy, pp_retail_6_0_sell = s.pp_retail_6_0_sell
  from public.pp_price_stage s
  where s.run_label = p_label and (abs(hashtext(s.pp_id)) % p_parts) = p_part
    and t.pp_id = s.pp_id and t.keep_row = 'yes'
    and (t.pp_sales_volume, t.pp_price_raw, t.pp_price_2_0, t.pp_price_3_0, t.pp_price_4_0, t.pp_price_5_0, t.pp_price_6_0, t.pp_price_7_0,
         t.pp_price_8_0, t.pp_price_9_0, t.pp_price_9_2, t.pp_price_9_4, t.pp_price_9_6, t.pp_price_9_8, t.pp_price_9_8_sell, t.pp_price_10_0,
         t.pp_retail_raw_buy, t.pp_retail_raw_sell, t.pp_retail_4_0_buy, t.pp_retail_4_0_sell, t.pp_retail_6_0_buy, t.pp_retail_6_0_sell)
        is distinct from
        (s.pp_sales_volume, s.pp_price_raw, s.pp_price_2_0, s.pp_price_3_0, s.pp_price_4_0, s.pp_price_5_0, s.pp_price_6_0, s.pp_price_7_0,
         s.pp_price_8_0, s.pp_price_9_0, s.pp_price_9_2, s.pp_price_9_4, s.pp_price_9_6, s.pp_price_9_8, s.pp_price_9_8_sell, s.pp_price_10_0,
         s.pp_retail_raw_buy, s.pp_retail_raw_sell, s.pp_retail_4_0_buy, s.pp_retail_4_0_sell, s.pp_retail_6_0_buy, s.pp_retail_6_0_sell);
  get diagnostics n_upd = row_count;
  return jsonb_build_object('part', p_part, 'history_rows', n_hist, 'rows_updated', n_upd);
end $$;

revoke all on function public.pp_prev_snapshot_rows() from public, anon, authenticated;
revoke all on function public.pp_commit_prices(text, date, int, int) from public, anon, authenticated;
grant execute on function public.pp_prev_snapshot_rows() to service_role;
grant execute on function public.pp_commit_prices(text, date, int, int) to service_role;
