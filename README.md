# Neckarline

English-language transit app for the Rhine-Neckar region (Mannheim,
Heidelberg, Ludwigshafen). React PWA + Cloudflare Worker proxy to VRN.

Built as an original product on VRN open data — not a copy of the
VRN/rnv apps. Design principles came from real VRN review complaints:
no login wall, no background tracking, opt-in location, map central,
planned + live times shown together, distance-sorted search, English-first.

## Adding another region later

The app is regional by design (Rhine-Neckar / VRN), but built to expand.
Everything region-specific lives in one file: `src/region.js` — branding,
map center and bounds, the schematic waterway, fare-system label, and the
data-source references. The components, data layer, and map all read from it.

To add a region (e.g. Berlin/VBB):
1. Copy `src/region.js` → `src/regions/vbb.js`, fill in its values.
2. Point the app at it (import the new config).
3. Wire that region's feeds in the Worker (or switch to the national
   **DELFI** dataset on opendata-oepnv.de for nationwide coverage).

No changes to `App.jsx`, `api.js`, or the map are needed. Multi-region
switching, cross-authority trips, and reconciling fare systems are
deliberately deferred until a second region is actually signed up.

## What's in here

```
index.html            App shell + iOS PWA meta tags
vite.config.js        Build + PWA (manifest, service worker, offline cache)
wrangler.toml         Cloudflare Worker config
src/
  main.jsx            React entry
  App.jsx             The whole UI (Plan / Map / Departures / Alerts)
  region.js           Region config — branding, map, fare label, data sources
  api.js              Data layer — mock now, live VRN later (one flag)
worker/
  index.js            Backend proxy: holds VRN key, maps German → English
public/
  favicon.svg, icon-*.png   App icons
  _redirects          SPA + /api routing for Cloudflare Pages
```

## Run locally

```
npm install
npm run dev            # app at http://localhost:5173, mock data
```

## Stage 1 — Host the PWA free (on your iPhone this week)

1. `npm run build` → produces `dist/`
2. Push this repo to GitHub.
3. Cloudflare dashboard → Pages → connect the repo.
   Build command: `npm run build`   Output dir: `dist`
4. You get a URL like `neckarline.pages.dev`.
5. On your iPhone, open it in Safari → Share → **Add to Home Screen**.
   It launches fullscreen with its own icon. Share the URL with anyone.

Cost: **$0.** Cloudflare Pages free tier is generous and has no cold starts.

## Stage 2 — Live data via the Worker

The app currently runs on mock data. To go live:

1. Register at the VRN open-data portal and request **TRIAS (Open Service)**
   access + the **GTFS-RT** feed URLs. Read the data licence — you'll need
   an attribution line, and confirm commercial use is allowed.
2. Set secrets (never commit these):
   ```
   npx wrangler secret put VRN_API_KEY
   npx wrangler secret put VRN_TRIAS_URL
   npx wrangler secret put VRN_GTFSRT_VEHICLES
   npx wrangler secret put VRN_GTFSRT_ALERTS
   ```
3. Wire the VRN request/response mapping in `worker/index.js`
   (the `needsWiring` stubs mark every spot; TRIAS request bodies
   depend on the docs VRN sends you).
4. `npx wrangler deploy worker/index.js`
5. In `src/api.js`, set `USE_MOCK = false`.

The app's `src/api.js` already defines the exact JSON shape the UI needs,
so the Worker just has to return that shape. **Note:** `App.jsx` currently
holds its own inline mock copies of this data for self-contained running;
the integration step is to import from `api.js` (the functions and shapes
are identical), then the live swap is automatic.

Cost: Workers free tier = 100k requests/day, no cold starts. Likely **$0**
for a long time; scales cheaply after.

## Map tiles — the one early cost to consider

The map uses MapLibre GL. The dev/demo config points at the free
OpenStreetMap tile server, whose usage policy **forbids heavy production
use**. Before a real launch, switch to a proper tile provider:
- **MapTiler** — free up to a monthly limit, then ~$25/mo at small scale
- **Protomaps** — self-hostable, very cheap, one-time setup

Swap the tile URL in `App.jsx` (MapView) and add the provider key.

## Stage 3 — App Store

1. `npm install @capacitor/core @capacitor/cli @capacitor/ios`
2. `npx cap init Neckarline com.yourname.neckarline --web-dir=dist`
3. `npm run build && npx cap add ios && npx cap sync`
4. `npx cap open ios` → opens Xcode (needs a Mac; cloud Macs work too).
5. Add native location + push permission strings, app icons, splash.
6. Apple Developer Program: **$99/year**. Submit via Xcode / App Store Connect.

App Store note: Apple can reject "just a web view" apps. Neckarline feels
native (real nav, offline, location), which helps — but get VRN's written
permission to use their data in a store app before submitting.

## Cost summary

| Stage | What | Cost |
|-------|------|------|
| 1 | PWA on Cloudflare Pages | $0 |
| 2 | Worker backend | $0 (free tier), scales cheap |
| 2 | Map tiles (production) | $0–25/mo |
| 3 | Apple Developer Program | $99/yr |
| 3 | Mac for builds | own one, or rent cloud Mac |
