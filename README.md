# What's for Makan? 🎡

A playful food roulette that picks a hawker stall for you at **Old Airport Road Food Centre**
(51 Old Airport Road, Singapore 390051). Built for one hungry person standing in the carpark.

Two quick questions → an illustrated spinning wheel → a result card with the stall's signature
dish, live Google rating, a review snippet, price range and a Maps link.

## Stack

- **Vite + React + TypeScript**, Framer Motion for springs and squash, `canvas-confetti`.
- Inline SVG illustrations (no image assets), synthesised WebAudio sounds (no audio assets).
- **Supabase** for the `stalls` table and a **`places` Edge Function** that proxies the
  Google Places API (New). The Google key lives only in Supabase secrets and never reaches the browser.
- Ratings, reviews and photos are cached in `place_cache` for 24 hours. `place_id`s are stored permanently.

The app also runs **with no backend at all**: leave the env vars blank and it uses the built-in stall
list (`src/data/stalls.ts`) and shows "No rating yet".

## Run it

```sh
npm install
npm run dev          # http://localhost:5173 — open at 390px wide first
npm test             # filter / weighting unit tests
npm run build
npm run check:secrets   # asserts no Google key or endpoint is in dist/
```

## Deploy to GitHub Pages

`.github/workflows/pages.yml` builds and publishes on every push to `main` (and the current
development branch), or on demand from the Actions tab. One-time setup in the repo:
**Settings → Pages → Build and deployment → Source: GitHub Actions.**

The site then lives at `https://<owner>.github.io/food-recommender/`. To ship live ratings, add
`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as repository **variables** (not secrets — they
are public by design). Without them the Pages build runs on the built-in stall list.

## Connect Supabase (for live ratings)

1. Create a Supabase project, then link and push the schema and seed:

   ```sh
   supabase link --project-ref <ref>
   supabase db push                                   # creates stalls + place_cache (RLS on)
   psql "$SUPABASE_DB_URL" -f supabase/seed.sql       # or paste seed.sql into the SQL editor
   ```

2. Store the Google key as a secret and deploy the function:

   ```sh
   supabase secrets set GOOGLE_PLACES_API_KEY=AIza...
   supabase functions deploy places
   ```

   The key needs **Places API (New)** enabled. Restrict it to that API in Google Cloud; it is never
   used from a browser origin so it needs no HTTP referrer restriction.

3. Point the frontend at the project:

   ```sh
   cp .env.example .env
   # fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
   ```

### Confirming the key is not in the client bundle

```sh
npm run build && npm run check:secrets
```

The script greps `dist/` for anything shaped like a Google key (`AIza…`), the secret's name, and the
`places.googleapis.com` host. All Google calls happen inside `supabase/functions/places/index.ts`;
the frontend only ever calls `supabase.functions.invoke('places')`. The only `VITE_` variables are the
Supabase URL and anon key, which are designed to be public.

## How the wheel decides

`src/lib/filter.ts`

- **Craving** is a hard filter on `craving_tags`. "Surprise me" skips it.
- **Hunger** is a soft weight: a stall whose `hunger_weight` matches you gets 1.0, one step off 0.7,
  two off 0.45, three off 0.3. Nothing is ever excluded, so there is always variety.
- Stalls with a Google rating **≥ 4.3** get a 1.25× boost. Never a guarantee.
- The last **5 results** (localStorage) are de-weighted, most recent hardest, so you don't get the same stall twice in a row.
- **Never an empty wheel.** If the craving leaves fewer than 4 stalls, we first add stalls whose
  hunger weight is within one step (any craving), then everything. The result card says
  "Widened the search a bit."
- "Nah, next one" re-spins with that stall excluded for the current round.

## Data

| column | type | notes |
|---|---|---|
| id | text pk | stable slug, keeps "recently spun" stable across reseeds |
| name | text | |
| unit_number | text | nullable — **null where unverified, please check** |
| signature_dish | text | |
| craving_tags | text[] | `noodles` `rice` `soupy` `fried` `grilled` `sweet` |
| hunger_weight | int 1–4 | how filling |
| price_range | `$` `$$` `$$$` | |
| typical_price | text | e.g. `$5–8` |
| place_id | text | nullable; filled in by the edge function via `places:searchText` |
| illustration_key | text | `noodles` `wok` `bowl` `prawn` `claypot` `duck` `skewer` `rojak` `dessert` `carrotcake` |

The seed (`supabase/seed.sql`) and the offline fallback (`src/data/stalls.ts`) list the same 18 stalls.
Keep them in sync if you edit one. Unit numbers and `place_id`s were not verified against the ground —
the seed leaves the uncertain ones null so the name lookup can fill them in.

## Out of scope, on purpose

No login, accounts, group voting, ordering, payment, user-written reviews, or dark mode.
