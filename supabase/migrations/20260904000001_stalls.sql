-- Stalls at Old Airport Road Food Centre.
create extension if not exists "pgcrypto";

create table if not exists public.stalls (
  id               text primary key,
  name             text not null,
  unit_number      text,
  signature_dish   text not null,
  craving_tags     text[] not null default '{}',
  hunger_weight    int  not null check (hunger_weight between 1 and 4),
  price_range      text not null check (price_range in ('$', '$$', '$$$')),
  typical_price    text not null,
  place_id         text,
  illustration_key text not null default 'bowl',
  created_at       timestamptz not null default now()
);

comment on table public.stalls is 'Hawker stalls the wheel can land on.';
comment on column public.stalls.id is 'Stable slug (e.g. nam-sing-hokkien-fried-mee). Stable ids keep localStorage "recently spun" working across reseeds.';
comment on column public.stalls.place_id is 'Google Places place_id. Null until the edge function resolves it by name.';

alter table public.stalls enable row level security;

-- Anyone can read the menu; only the service role (edge function) writes.
drop policy if exists "stalls are public" on public.stalls;
create policy "stalls are public"
  on public.stalls for select
  to anon, authenticated
  using (true);
