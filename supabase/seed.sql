-- Seed stalls. Unit numbers are null where unverified — fill them in.
-- Keep in sync with src/data/stalls.ts.
insert into public.stalls
  (id, name, unit_number, signature_dish, craving_tags, hunger_weight, price_range, typical_price, place_id, illustration_key)
values
  ('nam-sing-hokkien-fried-mee',        'Nam Sing Hokkien Fried Mee',        '#01-32',  'Dry-style Hokkien mee',                     '{noodles,fried}',  3, '$$', '$5–8',  null, 'noodles'),
  ('lao-fu-zi-fried-kway-teow',         'Lao Fu Zi Fried Kway Teow',         '#01-12',  'Char kway teow with cockles',               '{noodles,fried}',  3, '$',  '$4–6',  null, 'wok'),
  ('dong-ji-fried-kway-teow',           'Dong Ji Fried Kway Teow',           '#01-138', 'Wet-style char kway teow',                  '{noodles,fried}',  3, '$',  '$4–6',  null, 'wok'),
  ('xin-mei-xiang-lor-mee',             'Xin Mei Xiang Lor Mee',             '#01-116', 'Lor mee with fried fish & vinegar',         '{noodles,soupy}',  2, '$',  '$4–6',  null, 'bowl'),
  ('toa-payoh-rojak',                   'Toa Payoh Rojak',                   '#01-108', 'Rojak with you tiao & prawn paste',         '{fried,sweet}',    1, '$',  '$4–8',  null, 'rojak'),
  ('chuan-kee-boneless-braised-duck',   'Chuan Kee Boneless Braised Duck',   '#01-04',  'Braised duck rice with yam rice',           '{rice}',           3, '$$', '$5–10', null, 'duck'),
  ('to-ricos-guo-shi',                  'To-Ricos Guo Shi (Kway Chap)',      '#01-135', 'Kway chap with braised pork & innards',     '{noodles,soupy}',  3, '$$', '$6–10', null, 'bowl'),
  ('roast-paradise',                    'Roast Paradise',                    '#01-121', 'KL-style char siew & sio bak rice',         '{rice,grilled}',   3, '$$', '$5–9',  null, 'duck'),
  ('whitley-road-big-prawn-noodle',     'Whitley Road Big Prawn Noodle',     '#01-98',  'Big prawn noodle soup',                     '{noodles,soupy}',  3, '$$', '$6–12', null, 'prawn'),
  ('lian-he-ben-ji-claypot-rice',       'Lian He Ben Ji Claypot Rice',       '#01-136', 'Charcoal claypot rice with lup cheong',     '{rice}',           4, '$$', '$8–15', null, 'claypot'),
  ('ru-ji-kitchen',                     'Ru Ji Kitchen',                     '#01-37',  'Handmade fishball noodles',                 '{noodles,soupy}',  2, '$',  '$4–6',  null, 'bowl'),
  ('western-barbeque',                  'Western Barbeque',                  '#01-53',  'Chicken chop with black pepper sauce',      '{grilled,fried}',  4, '$$', '$8–14', null, 'skewer'),
  ('albert-street-prawn-noodle',        'Albert Street Prawn Noodle',        '#01-10',  'Prawn noodle, dry or soup',                 '{noodles,soupy}',  3, '$$', '$6–10', null, 'prawn'),
  ('hokkien-man-hokkien-mee',           'Hokkien Man Hokkien Mee',           null,      'Wet-style Hokkien mee with sambal',         '{noodles,fried}',  3, '$$', '$6–10', null, 'noodles'),
  ('wei-xuan-hong-kong-dessert',        'Wei Xuan Hong Kong Dessert',        null,      'Mango sago pomelo',                         '{sweet}',          1, '$',  '$3–5',  null, 'dessert'),
  ('freshly-made-turnip-cake',          'Freshly Made Turnip Cake',          null,      'Black carrot cake, crispy edges',           '{fried}',          1, '$',  '$3–5',  null, 'carrotcake'),
  ('ah-ter-teochew-fish-ball-noodles',  'Ah Ter Teochew Fish Ball Noodles',  null,      'Teochew fishball mee pok',                  '{noodles,soupy}',  2, '$',  '$4–6',  null, 'bowl'),
  ('maher-rojak',                       'Maher Rojak',                       null,      'Indian rojak with sweet dipping sauce',     '{fried,sweet}',    2, '$',  '$4–8',  null, 'rojak')
on conflict (id) do update set
  name = excluded.name,
  unit_number = coalesce(public.stalls.unit_number, excluded.unit_number),
  signature_dish = excluded.signature_dish,
  craving_tags = excluded.craving_tags,
  hunger_weight = excluded.hunger_weight,
  price_range = excluded.price_range,
  typical_price = excluded.typical_price,
  -- never clobber a place_id the edge function already resolved
  place_id = coalesce(public.stalls.place_id, excluded.place_id),
  illustration_key = excluded.illustration_key;
