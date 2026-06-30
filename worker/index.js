// ─────────────────────────────────────────────────────────────
// Neckarline Cloudflare Worker — backend proxy to VRN
//
// Why this exists:
//  • Holds VRN_API_KEY server-side (never shipped to the browser).
//  • Solves CORS (VRN endpoints reject direct browser calls).
//  • Translates German TRIAS/GTFS-RT responses → the English JSON
//    shape the React app expects (see src/api.js).
//
// Secrets (set once, never committed):
//   wrangler secret put VRN_API_KEY
//   wrangler secret put VRN_TRIAS_URL     (the Open Service endpoint)
//
// This is a SCAFFOLD: the fetchVrn* helpers show the integration
// points. The exact TRIAS XML request bodies depend on the access
// docs VRN sends you on registration — wire them in there.
// ─────────────────────────────────────────────────────────────

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=15", ...CORS } });

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    const url = new URL(request.url);
    const p = url.pathname;

    try {
      if (p === "/api/stops")      return json(await stops(url, env));
      if (p === "/api/trips")      return json(await trips(url, env));
      if (p === "/api/departures") return json(await departures(url, env));
      if (p === "/api/vehicles")   return json(await vehicles(url, env));
      if (p === "/api/alerts")     return json(await alerts(url, env));
      if (p === "/api/health")     return json({ ok: true, hasKey: !!env.VRN_API_KEY });
      return json({ error: "not found" }, 404);
    } catch (err) {
      return json({ error: String(err?.message || err) }, 502);
    }
  },
};

// ── Endpoint handlers ─────────────────────────────────────────
// Each builds the VRN request, then maps the response to our shape.

async function stops(url, env) {
  const q = url.searchParams.get("q") || "";
  // const xml = triasLocationRequest(q);
  // const res = await postTrias(xml, env);
  // return parseStops(res);
  return needsWiring("stops", { q });
}

async function trips(url, env) {
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const whenMode = url.searchParams.get("whenMode") || "now";
  const time = url.searchParams.get("time") || "";
  // const xml = triasTripRequest({ from, to, whenMode, time });
  // const res = await postTrias(xml, env);
  // return parseTrips(res);   // map <Trip> → {departTime, legs[], fare, ...}
  return needsWiring("trips", { from, to, whenMode, time });
}

async function departures(url, env) {
  const stop = url.searchParams.get("stop");
  // const xml = triasStopEventRequest(stop);
  // const res = await postTrias(xml, env);
  // return parseDepartures(res);  // map StopEvent → {line, towards, min, delayMin}
  return needsWiring("departures", { stop });
}

async function vehicles(url, env) {
  // GTFS-RT VehiclePositions is a protobuf feed; decode and filter to bbox.
  // const buf = await fetch(env.VRN_GTFSRT_VEHICLES).then(r => r.arrayBuffer());
  // return decodeVehicles(buf);
  return needsWiring("vehicles", {});
}

async function alerts(url, env) {
  // GTFS-RT ServiceAlerts protobuf feed.
  // const buf = await fetch(env.VRN_GTFSRT_ALERTS).then(r => r.arrayBuffer());
  // return decodeAlerts(buf);
  return needsWiring("alerts", {});
}

// ── VRN transport helpers ─────────────────────────────────────
async function postTrias(xmlBody, env) {
  const res = await fetch(env.VRN_TRIAS_URL, {
    method: "POST",
    headers: { "Content-Type": "text/xml", Authorization: `Bearer ${env.VRN_API_KEY}` },
    body: xmlBody,
  });
  if (!res.ok) throw new Error(`VRN TRIAS ${res.status}`);
  return res.text(); // TRIAS returns XML
}

// Until VRN access is wired, every endpoint returns a clear signal
// instead of silently failing. The app keeps USE_MOCK=true til then.
function needsWiring(endpoint, params) {
  return { _stub: true, endpoint, params, note: "Wire VRN TRIAS/GTFS-RT here. App runs on mock data until USE_MOCK=false." };
}
