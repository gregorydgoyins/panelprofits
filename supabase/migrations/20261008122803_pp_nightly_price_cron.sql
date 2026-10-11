create extension if not exists pg_net;
create extension if not exists pg_cron;
select cron.schedule('pricecharting-nightly', '17 11 * * *', $job$
  select net.http_post(
    url := 'https://vbcmjmakluyjnsmisoth.supabase.co/functions/v1/pricecharting-nightly',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := '{}'::jsonb,
    timeout_milliseconds := 300000);
$job$);
