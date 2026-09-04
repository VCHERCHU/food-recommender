-- 24h cache of Google Places lookups, keyed by stall. Written only by the
-- `places` edge function using the service role; never readable by anon.
create table if not exists public.place_cache (
  stall_id          text primary key references public.stalls(id) on delete cascade,
  place_id          text not null,
  display_name      text,
  rating            numeric(2,1),
  user_rating_count int,
  review_snippet    text,
  review_author     text,
  price_level       text,
  photo_url         text,
  maps_uri          text,
  fetched_at        timestamptz not null default now()
);

create index if not exists place_cache_fetched_at_idx on public.place_cache (fetched_at);

alter table public.place_cache enable row level security;
-- No policies on purpose: anon/authenticated get nothing, service role bypasses RLS.
