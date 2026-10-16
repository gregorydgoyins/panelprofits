create table if not exists public.sniper_paper_accounts (
 owner text primary key, cash_usd numeric(14,2) not null default 10000 check(cash_usd>=0),
 reserved_usd numeric(14,2) not null default 0 check(reserved_usd>=0 and reserved_usd<=cash_usd),
 rounds integer not null default 0, wins integer not null default 0, double_uses integer not null default 0,
 created_at timestamptz not null default now()
);
alter table public.sniper_paper_accounts enable row level security;
revoke all on public.sniper_paper_accounts from anon,authenticated;
grant all on public.sniper_paper_accounts to service_role;
alter table public.sniper_paper_orders
 add column if not exists game_token uuid,
 add column if not exists game_mode text,
 add column if not exists game_sale_id text,
 add column if not exists game_duration_ms integer,
 add column if not exists game_deadline timestamptz,
 add column if not exists game_started_at timestamptz,
 add column if not exists game_resolved_at timestamptz,
 add column if not exists game_sold_at timestamptz,
 add column if not exists game_bank_rate numeric,
 add column if not exists game_reference_source text;
create unique index if not exists sniper_game_token_idx on public.sniper_paper_orders(game_token) where game_token is not null;
create unique index if not exists sniper_game_once_idx on public.sniper_paper_orders(owner,item_id) where game_token is not null;
create index if not exists sniper_game_due_idx on public.sniper_paper_orders(owner,game_deadline) where game_token is not null and game_resolved_at is null;

create or replace function public.sniper_game_action(p_owner text,p_action text,p_token uuid default null,p_amount numeric default null,p_offer jsonb default null,p_double boolean default false)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare a public.sniper_paper_accounts%rowtype; o public.sniper_paper_orders%rowtype;
 t timestamptz; benchmark numeric; evidence text; deadline timestamptz; price numeric; rate numeric; won boolean;
begin
 if length(p_owner)<8 or length(p_owner)>80 then raise exception 'Invalid player'; end if;
 insert into public.sniper_paper_accounts(owner) values(p_owner) on conflict do nothing;
 select * into a from public.sniper_paper_accounts where owner=p_owner for update;
 t:=clock_timestamp();
 if p_action='offer' then
  insert into public.sniper_paper_orders(owner,item_id,kind,title,series,issue,grade,source,status,game_token,game_mode,game_sale_id,game_duration_ms,end_time,ask_usd,fmv_usd,game_reference_source,result)
  values(p_owner,p_offer->>'itemId','auction',p_offer->>'title',p_offer->>'series',p_offer->>'issue',(p_offer->>'grade')::numeric,p_offer->>'source','waiting',p_token,p_offer->>'mode',p_offer->>'saleId',(p_offer->>'durationMs')::integer,(p_offer->>'endTime')::timestamptz,(p_offer->>'opening')::numeric,(p_offer->>'reference')::numeric,p_offer->>'referenceSource',coalesce(p_offer->'metadata','{}'::jsonb)||'{"game":true}'::jsonb)
  on conflict do nothing;
 elsif p_action='refresh' then
  delete from public.sniper_paper_orders where owner=p_owner and game_token is not null and status='waiting';
 elsif p_action in ('bid','settle','sell') then
  select * into o from public.sniper_paper_orders where owner=p_owner and game_token=p_token for update;
  if not found then raise exception 'Round not found'; end if;
  if p_action='bid' then
   if o.status not in ('waiting','bidding') then raise exception 'Bidding is closed'; end if;
   deadline:=o.game_deadline;
   if o.status='waiting' then
    if o.game_mode='live' then
     select end_time into deadline from public.sniper_listings where item_id=o.item_id and buying_option='AUCTION';
    else deadline:=t+o.game_duration_ms*interval '1 millisecond'; end if;
   end if;
   if deadline is null or t>=deadline then raise exception 'Bid arrived after closing'; end if;
   if p_amount is null or p_amount::text in ('NaN','Infinity','-Infinity') or p_amount<=0 or p_amount<>round(p_amount,2) then raise exception 'Enter a positive bid in whole cents'; end if;
   if p_amount<coalesce(o.ask_usd,0.01) or p_amount<=coalesce(o.max_bid_usd,0) then raise exception 'Your bid must exceed the current accepted amount'; end if;
   if p_amount-coalesce(o.max_bid_usd,0)>a.cash_usd-a.reserved_usd then raise exception 'Insufficient available Sniper dollars'; end if;
   update public.sniper_paper_accounts set reserved_usd=reserved_usd+p_amount-coalesce(o.max_bid_usd,0) where owner=p_owner;
   update public.sniper_paper_orders set max_bid_usd=p_amount,status='bidding',game_deadline=deadline,game_started_at=coalesce(game_started_at,t),result=result||jsonb_build_object('acceptedAt',t) where id=o.id;
  elsif p_action='settle' and o.game_resolved_at is null and o.status in ('bidding','awaiting_result') and t>=o.game_deadline then
   if o.game_mode='historical' then
    select price_usd,source into benchmark,evidence from public.sniper_sales where id=o.game_sale_id and confirmed=true and price_usd>0;
   else
    select price_usd,source into benchmark,evidence from public.sniper_sales where item_id=o.item_id and confirmed=true and price_usd>0 order by sold_at desc limit 1;
    if benchmark is null then
     select final_price_usd,'Recorded venue close' into benchmark,evidence from public.sniper_listings
      where item_id=o.item_id and status='ended' and final_price_usd>0 and final_seen_secs_before_end<=0;
    end if;
   end if;
   if benchmark is null then
    if t>o.game_deadline+interval '24 hours' then
     update public.sniper_paper_accounts set reserved_usd=reserved_usd-o.max_bid_usd where owner=p_owner;
     update public.sniper_paper_orders set status='unresolved',game_resolved_at=t,detail='No verified close; reservation released without a charge.' where id=o.id;
    else update public.sniper_paper_orders set status='awaiting_result' where id=o.id; end if;
   else
    won:=o.max_bid_usd>benchmark;
    rate:=case when a.rounds<10 then 1 when a.rounds<25 then .9 when a.rounds<50 then .75 else .5 end;
    update public.sniper_paper_accounts set cash_usd=cash_usd-o.max_bid_usd,reserved_usd=reserved_usd-o.max_bid_usd,rounds=rounds+1,wins=wins+case when won then 1 else 0 end where owner=p_owner;
    update public.sniper_paper_orders set status=case when won then 'won' else 'outbid' end,final_price_usd=benchmark,
     fill_price_usd=case when won then max_bid_usd else null end,game_resolved_at=t,settled_at=t,
     fmv_usd=coalesce(fmv_usd,benchmark),game_reference_source=coalesce(game_reference_source,evidence||' — recorded close, not current FMV'),game_bank_rate=rate,
     detail=case when won then 'Your direct bid cleared the recorded close. You paid your accepted bid and own the virtual comic.' else 'Your bid did not beat the recorded close. Your final accepted bid was charged; no comic awarded.' end,
     basis=evidence where id=o.id;
   end if;
  elsif p_action='sell' then
   if o.status<>'won' or o.game_resolved_at is null or o.game_sold_at is not null then raise exception 'This comic is not available to sell'; end if;
   if o.fmv_usd is null or o.fmv_usd<=0 then raise exception 'No supported bank reference'; end if;
   if p_double and floor(a.wins/5.0)-a.double_uses<1 then raise exception 'No earned Double Down available'; end if;
   price:=round(o.fmv_usd*o.game_bank_rate*case when p_double then 2 else 1 end,2);
   update public.sniper_paper_accounts set cash_usd=cash_usd+price,double_uses=double_uses+case when p_double then 1 else 0 end where owner=p_owner;
   update public.sniper_paper_orders set game_sold_at=t,result=result||jsonb_build_object('bankPaid',price,'doubleDown',p_double) where id=o.id;
  end if;
 elsif p_action<>'state' then raise exception 'Unknown game action'; end if;
 select * into a from public.sniper_paper_accounts where owner=p_owner;
 return jsonb_build_object('cash',a.cash_usd,'reserved',a.reserved_usd,'available',a.cash_usd-a.reserved_usd,'rounds',a.rounds,'wins',a.wins,'doubleDowns',greatest(0,floor(a.wins/5.0)-a.double_uses),'serverNow',clock_timestamp());
end $$;
revoke all on function public.sniper_game_action(text,text,uuid,numeric,jsonb,boolean) from public,anon,authenticated;
grant execute on function public.sniper_game_action(text,text,uuid,numeric,jsonb,boolean) to service_role;
