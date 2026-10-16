-- Verified edition metadata lets variant sales reach the chart without mixing base-cover prices.
alter table public.sniper_sales add column if not exists edition text, add column if not exists publication_year integer;
-- Existing Campbell #692 source page; only rows with explicit CGC grade, cover and unambiguous amounts.
-- Source: https://www.pricecharting.com/game/comic-books-amazing-spider-man/amazing-spider-man-campbell-692-2012
-- Excluded the signed copy, the July row with two different amounts, CBCS, and unrelated covers.
insert into public.sniper_sales(id,series_key,series,issue,grade,grader,price_usd,sold_at,venue,source,confirmed,url,edition,publication_year) values
('pricecharting:3374611:CGC:9.8:2026-03-20','amazing spider man|692','Amazing Spider-Man','692',9.8,'CGC',189.95,'2026-03-20','eBay','pricecharting_completed_sale',true,'https://www.pricecharting.com/game/comic-books-amazing-spider-man/amazing-spider-man-campbell-692-2012','Campbell',2012),
('pricecharting:3374611:CGC:9.8:2025-01-13','amazing spider man|692','Amazing Spider-Man','692',9.8,'CGC',120.50,'2025-01-13','eBay','pricecharting_completed_sale',true,'https://www.pricecharting.com/game/comic-books-amazing-spider-man/amazing-spider-man-campbell-692-2012','Campbell',2012),
('pricecharting:3374611:CGC:9.8:2024-10-03','amazing spider man|692','Amazing Spider-Man','692',9.8,'CGC',244.74,'2024-10-03','eBay','pricecharting_completed_sale',true,'https://www.pricecharting.com/game/comic-books-amazing-spider-man/amazing-spider-man-campbell-692-2012','Campbell',2012),
('pricecharting:3374611:CGC:9.6:2025-10-06','amazing spider man|692','Amazing Spider-Man','692',9.6,'CGC',52.00,'2025-10-06','eBay','pricecharting_completed_sale',true,'https://www.pricecharting.com/game/comic-books-amazing-spider-man/amazing-spider-man-campbell-692-2012','Campbell',2012)
on conflict(id) do nothing;
