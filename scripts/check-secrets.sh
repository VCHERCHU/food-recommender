#!/usr/bin/env sh
# Fails if anything that looks like a Google API key, or the secret's name,
# made it into the client bundle. Run after `npm run build`.
set -eu
if [ ! -d dist ]; then echo "dist/ not found — run npm run build first" >&2; exit 2; fi
if grep -rEq 'AIza[0-9A-Za-z_-]{30,}|GOOGLE_PLACES_API_KEY|places\.googleapis\.com' dist; then
  echo "✗ Google Places key or endpoint found in client bundle:" >&2
  grep -rEo 'AIza[0-9A-Za-z_-]{30,}|GOOGLE_PLACES_API_KEY|places\.googleapis\.com' dist | sort -u >&2
  exit 1
fi
echo "✓ No Google Places key or endpoint in dist/"
