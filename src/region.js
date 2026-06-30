// ─────────────────────────────────────────────────────────────
// Region configuration
//
// Everything specific to ONE transit region lives here. The app,
// the map, and the data layer all read from this object — so adding
// a second region later means writing a new config like this one,
// not editing components.
//
// To add a region (e.g. Berlin/VBB): copy this file to regions/vbb.js,
// fill in its values, point the app at it. Nothing in App.jsx, api.js,
// or the map needs to change.
// ─────────────────────────────────────────────────────────────

export const REGION = {
  id: "rhine-neckar",

  // Branding / copy shown in the UI
  appName: "Neckarline",
  badge: "RHINE-NECKAR · EN",
  tagline: "Buses & trams · Mannheim · Heidelberg · Ludwigshafen",
  dataCredit: "Live times via VRN",          // shown under results
  fareSystemLabel: "VRN price levels",        // how this region prices trips

  // Map: where it opens, and the schematic-fallback bounding box
  map: {
    center: [8.55, 49.46],                    // [lng, lat]
    zoom: 10.2,
    // Tile source. MapTiler "streets-v2" style, keyed. The key is a
    // frontend key (visible in-browser by design) — restrict it to
    // your domain in the MapTiler dashboard (Allowed HTTP origins).
    // Override the key at build time with VITE_MAPTILER_KEY if set.
    tileStyleUrl: (key) => `https://api.maptiler.com/maps/streets-v2/style.json?key=${key}`,
    maptilerKey: "yebiMhQRG0InQHn2UAjE",
    bounds: { minLat: 49.38, maxLat: 49.56, minLng: 8.43, maxLng: 8.72 },
    // A characteristic waterway drawn on the schematic fallback, as
    // [lng,lat] control points. Here: the Neckar/Rhine sweep.
    waterway: [[8.43, 49.49], [8.50, 49.47], [8.55, 49.45], [8.69, 49.41]],
  },

  // Backend data sources (consumed by the Worker, documented here
  // so one file describes the whole region). Secrets stay in Wrangler.
  data: {
    provider: "VRN",
    triasEnv: "VRN_TRIAS_URL",                // secret name in the Worker
    gtfsrtVehiclesEnv: "VRN_GTFSRT_VEHICLES",
    gtfsrtAlertsEnv: "VRN_GTFSRT_ALERTS",
    attribution: "© VRN · Map © OpenStreetMap",
  },

  // Approx. region centroid — only used to seed "nearby" sorting in
  // demo/mock mode. Real location comes from the device, opt-in.
  demoCenter: { lat: 49.484, lng: 8.466 },
};

export default REGION;
