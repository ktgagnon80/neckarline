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

  // Real VRN stops (bus & tram), parent stations in the core
  // Rhine-Neckar cities. Generated from VRN GTFS feed (valid 2026).
  stops: [
  { id: "frankenthal_hauptbahnhof", name: "Frankenthal, Hauptbahnhof", lat: 49.5359, lng: 8.34974, lines: ["84", "460", "461", "462", "463", "464", "465", "466", "467", "468", "1084", "4961"] },
  { id: "heidelberg_altstadt", name: "Heidelberg, Altstadt", lat: 49.4151, lng: 8.72044, lines: ["20", "30", "31", "35", "36", "735", "752", "754", "755", "Moonliner 4", "Moonliner 5"] },
  { id: "heidelberg_betriebshof", name: "Heidelberg, Betriebshof", lat: 49.40789, lng: 8.67557, lines: ["5", "20", "21", "22", "24", "26", "28", "31", "35", "36", "713", "721"] },
  { id: "heidelberg_bismarckplatz", name: "Heidelberg, Bismarckplatz", lat: 49.40986, lng: 8.69314, lines: ["5", "21", "22", "23", "24", "26", "29", "30", "31", "33", "34", "35"] },
  { id: "heidelberg_czernybruecke", name: "Heidelberg, Czernybrücke", lat: 49.40667, lng: 8.67114, lines: ["22", "26", "33", "34", "721", "Moonliner 2", "Moonliner 3"] },
  { id: "heidelberg_feuerbachstrasse", name: "Heidelberg, Feuerbachstraße", lat: 49.39348, lng: 8.68573, lines: ["23", "28", "29", "33", "757", "Moonliner 3"] },
  { id: "heidelberg_hauptbahnhof", name: "Heidelberg, Hauptbahnhof", lat: 49.40432, lng: 8.67624, lines: ["5", "20", "21", "22", "23", "24", "28", "29", "31", "33", "34", "35"] },
  { id: "heidelberg_molkenkur", name: "Heidelberg, Molkenkur", lat: 49.40726, lng: 8.71472, lines: ["20", "30", "757", "1007"] },
  { id: "heidelberg_rudolf_diesel_str", name: "Heidelberg, Rudolf-Diesel-Str.", lat: 49.3965, lng: 8.67853, lines: ["26", "33", "Moonliner 3"] },
  { id: "heidelberg_stadtwerke", name: "Heidelberg, Stadtwerke", lat: 49.40497, lng: 8.68186, lines: ["5", "20", "21", "22", "23", "24", "28", "29", "33", "34", "35", "717"] },
  { id: "kaefertal_bahnhof_rnv", name: "Käfertal, Bahnhof (RNV)", lat: 49.5098, lng: 8.51825, lines: ["5", "15", "45", "54", "55", "56", "5A", "64"] },
  { id: "kaefertal_bensheimer_strasse", name: "Käfertal, Bensheimer Straße", lat: 49.51384, lng: 8.52734, lines: ["5", "16", "41"] },
  { id: "kaefertal_boveristrasse", name: "Käfertal, Boveristraße", lat: 49.50534, lng: 8.50233, lines: ["15", "58"] },
  { id: "kaefertal_h_gutzmann_schule", name: "Käfertal, H.-Gutzmann-Schule", lat: 49.5231, lng: 8.50112, lines: ["4", "45", "4A"] },
  { id: "kaefertal_im_rott", name: "Käfertal, Im Rott", lat: 49.50762, lng: 8.52824, lines: ["15", "54", "5A"] },
  { id: "kaefertal_mannheimer_strasse", name: "Käfertal, Mannheimer Straße", lat: 49.50795, lng: 8.51274, lines: ["5", "15", "45", "50", "54", "5A", "64"] },
  { id: "kaefertal_speckweg", name: "Käfertal, Speckweg", lat: 49.52041, lng: 8.49886, lines: ["4", "41", "4A", "50", "58"] },
  { id: "kaefertal_sued", name: "Käfertal, Süd", lat: 49.50703, lng: 8.50575, lines: ["5", "15", "50", "58", "5A"] },
  { id: "ludwigshafen_basf_tor_1_2", name: "Ludwigshafen, BASF (Tor 1+2)", lat: 49.49558, lng: 8.43156, lines: ["6", "7", "X", "12", "6A", "70", "78", "80", "97"] },
  { id: "ludwigshafen_bgm_kutterer_s", name: "Ludwigshafen, Bgm.-Kutterer-S.", lat: 49.47776, lng: 8.4414, lines: ["4", "4A", "90", "95"] },
  { id: "ludwigshafen_hauptbahnhof", name: "Ludwigshafen, Hauptbahnhof", lat: 49.47699, lng: 8.43332, lines: ["4", "7", "9", "X", "4A", "70", "74", "75", "78", "90"] },
  { id: "ludwigshafen_marienkirche", name: "Ludwigshafen, Marienkirche", lat: 49.48509, lng: 8.43113, lines: ["4", "7", "4A", "70", "71", "78", "80", "90", "1071"] },
  { id: "ludwigshafen_rathaus", name: "Ludwigshafen, Rathaus", lat: 49.48481, lng: 8.44227, lines: ["4", "6", "7", "9", "X", "12", "4A", "6A", "70", "71", "74", "1071"] },
  { id: "ludwigshafen_rohrlachstrasse", name: "Ludwigshafen, Rohrlachstraße", lat: 49.48305, lng: 8.43022, lines: ["4", "9", "X", "4A", "74", "75", "78", "80", "90"] },
  { id: "ludwigshafen_suedwest_stadion", name: "Ludwigshafen, Südwest-Stadion", lat: 49.47234, lng: 8.43982, lines: ["4", "6", "7", "9", "12", "4A", "6A", "96"] },
  { id: "ludwigshafen_walzmuehle", name: "Ludwigshafen, Walzmühle", lat: 49.47804, lng: 8.45349, lines: ["74", "76", "77", "94", "97", "1077"] },
  { id: "ludwigshafen_wittelsbachplatz", name: "Ludwigshafen, Wittelsbachplatz", lat: 49.47563, lng: 8.44393, lines: ["4", "6", "7", "9", "12", "4A", "6A", "96"] },
  { id: "mannheim_alte_feuerwache", name: "Mannheim, Alte Feuerwache", lat: 49.49585, lng: 8.47348, lines: ["1", "2", "3", "4", "7", "4A", "55", "58"] },
  { id: "mannheim_bibienastrasse", name: "Mannheim, Bibienastraße", lat: 49.49466, lng: 8.48824, lines: ["2", "7"] },
  { id: "mannheim_bonifatiuskirche", name: "Mannheim, Bonifatiuskirche", lat: 49.49892, lng: 8.48909, lines: ["4", "5", "15", "4A", "5A", "60", "61"] },
  { id: "mannheim_carl_benz_stadion", name: "Mannheim, Carl-Benz-Stadion", lat: 49.47785, lng: 8.50217, lines: ["6"] },
  { id: "mannheim_fahrlach", name: "Mannheim, Fahrlach", lat: 49.47337, lng: 8.49859, lines: ["9", "E", "64", "6A"] },
  { id: "mannheim_fernmeldeturm", name: "Mannheim, Fernmeldeturm", lat: 49.48692, lng: 8.49332, lines: ["5", "60"] },
  { id: "mannheim_handelshf_jungbusch", name: "Mannheim, Handelshf./Jungbusch", lat: 49.49291, lng: 8.45397, lines: ["4", "6", "4A", "62", "6A"] },
  { id: "mannheim_hauptbahnhof", name: "Mannheim, Hauptbahnhof", lat: 49.47975, lng: 8.46994, lines: ["1", "3", "4", "5", "6", "7", "9", "E", "4A", "5A", "60", "61"] },
  { id: "mannheim_hauptfriedhof", name: "Mannheim, Hauptfriedhof", lat: 49.49077, lng: 8.49118, lines: ["2", "7"] },
  { id: "mannheim_herzogenriedstrasse", name: "Mannheim, Herzogenriedstraße", lat: 49.50845, lng: 8.47061, lines: ["1", "3", "60"] },
  { id: "mannheim_kunsthalle", name: "Mannheim, Kunsthalle", lat: 49.48289, lng: 8.47305, lines: ["1", "3", "4", "5", "6", "7", "4A", "5A", "60", "61", "64", "6A"] },
  { id: "mannheim_luisenp_technoseum", name: "Mannheim, Luisenp./Technoseum", lat: 49.47878, lng: 8.49619, lines: ["6", "9"] },
  { id: "mannheim_nationaltheater", name: "Mannheim, Nationaltheater", lat: 49.48771, lng: 8.47773, lines: ["1", "2", "5", "7", "15", "5A"] },
  { id: "mannheim_otto_beck_strasse", name: "Mannheim, Otto-Beck-Straße", lat: 49.48115, lng: 8.48433, lines: ["60", "61", "64"] },
  { id: "mannheim_paradeplatz", name: "Mannheim, Paradeplatz", lat: 49.48778, lng: 8.46624, lines: ["1", "2", "3", "4", "5", "6", "7", "9", "E", "15", "4A", "5A"] },
  { id: "mannheim_pfeifferswoerth", name: "Mannheim, Pfeifferswörth", lat: 49.48945, lng: 8.5016, lines: ["2", "7", "60"] },
  { id: "mannheim_planetarium", name: "Mannheim, Planetarium", lat: 49.47662, lng: 8.4898, lines: ["6", "9", "E", "61", "6A"] },
  { id: "mannheim_rheinstrasse", name: "Mannheim, Rheinstraße", lat: 49.491, lng: 8.45781, lines: ["1", "2", "3", "4", "6", "7", "9", "4A", "6A"] },
  { id: "mannheim_schloss", name: "Mannheim, Schloss", lat: 49.48478, lng: 8.46344, lines: ["1", "3", "4", "5", "6", "7", "9", "E", "4A", "5A", "60", "61"] },
  { id: "mannheim_tattersall", name: "Mannheim, Tattersall", lat: 49.48183, lng: 8.47293, lines: ["1", "6", "9", "E", "6A"] },
  { id: "mannheim_theresienkrankenhaus", name: "Mannheim, Theresienkrankenhaus", lat: 49.48988, lng: 8.48086, lines: ["1", "2", "5", "7", "15", "5A"] },
  { id: "mannheim_ulmenweg", name: "Mannheim, Ulmenweg", lat: 49.50741, lng: 8.49315, lines: ["4", "4A", "60"] },
  { id: "mannheim_universitaetsklinikum", name: "Mannheim, Universitätsklinikum", lat: 49.49365, lng: 8.48408, lines: ["2", "4", "5", "7", "15", "4A", "5A"] },
  { id: "mannheim_wasserturm", name: "Mannheim, Wasserturm", lat: 49.48465, lng: 8.4741, lines: ["1", "2", "3", "4", "5", "6", "7", "15", "4A", "5A", "60", "61"] },
  { id: "speyer_berliner_platz", name: "Speyer, Berliner Platz", lat: 49.32712, lng: 8.41724, lines: ["564", "566", "5960"] },
  { id: "speyer_hbf_zob", name: "Speyer, Hbf/ZOB", lat: 49.32458, lng: 8.42798, lines: ["507", "561", "562", "563", "564", "565", "566", "567", "568", "569", "572", "573"] },
  { id: "speyer_postplatz", name: "Speyer, Postplatz", lat: 49.31746, lng: 8.43148, lines: ["561", "562", "563", "564", "565", "567", "568", "572", "717", "798", "5940", "5960"] },
  { id: "viernheim_bahnhof", name: "Viernheim, Bahnhof", lat: 49.53558, lng: 8.58277, lines: ["5", "610", "611", "612", "6913", "6914"] },
  { id: "viernheim_tivoli_rnz", name: "Viernheim, Tivoli (RNZ)", lat: 49.52818, lng: 8.56527, lines: ["5", "612"] },
  { id: "weinheim_hawei", name: "Weinheim, HaWei", lat: 49.55263, lng: 8.66223, lines: ["631", "633", "634", "681", "6902"] },
  { id: "weinheim_hauptbahnhof", name: "Weinheim, Hauptbahnhof", lat: 49.55333, lng: 8.6657, lines: ["5", "631", "632", "633", "634", "635", "680", "681", "682", "689", "632A", "6900"] },
  { id: "weinheim_haendelstrasse", name: "Weinheim, Händelstraße", lat: 49.54879, lng: 8.65592, lines: ["5", "631", "6902"] },
  { id: "weinheim_stahlbad", name: "Weinheim, Stahlbad", lat: 49.54501, lng: 8.64919, lines: ["5", "631", "634", "6902"] },
  { id: "wiesloch_ringstrasse", name: "Wiesloch, Ringstraße", lat: 49.29303, lng: 8.69746, lines: ["702", "703", "706", "707", "708", "709", "723", "724", "793", "7910", "7932", "7933"] },
],

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
    maptilerKey: "1MYlMKdc2WN8PoWGdMRR",
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
