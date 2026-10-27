-- QUARANTINED 2026-10-26: pg_cron job 'pricecharting-nightly' (schedule '7,27,47 11-17 * * *').
-- Calls the Supabase edge function pricecharting-nightly, which always fails with
-- "download failed: HTTP 503" because PriceCharting rejects cloud-server downloads (see commit e7640de:
-- the real load runs through the collector extension). The function still returns HTTP 200 on failure, so cron
-- recorded every run as succeeded. Unscheduled; to restore, run the statement below.
select cron.schedule('pricecharting-nightly', '7,27,47 11-17 * * *', $job$
   select net.http_post(
     url := 'https://vbcmjmakluyjnsmisoth.supabase.co/functions/v1/pricecharting-nightly',
     headers := jsonb_build_object('Content-Type', 'application/json'),
     body := '{}'::jsonb,
     timeout_milliseconds := 300000); $job$);
