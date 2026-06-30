// ─────────────────────────────────────────────────────────────
// Neckarline data layer
// The app calls these functions. They hit /api/* on our own origin,
// which the Cloudflare Worker proxies to VRN (TRIAS + GTFS-RT),
// translating German fields to the English shape the UI expects.
//
// USE_MOCK lets the UI run with no backend (for local dev / demo).
// Flip to false once the Worker is deployed and VRN_API_KEY is set.
// ─────────────────────────────────────────────────────────────

export const USE_MOCK = true; // set false when the Worker is live

const API = ""; // same-origin; Worker handles /api/* in production

async function get(path) {
  const res = await fetch(`${API}${path}`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

// ── Stop autocomplete ─────────────────────────────────────────
export async function searchStops(query, near) {
  if (USE_MOCK) return mockStops(query, near);
  const q = new URLSearchParams({ q: query });
  if (near) { q.set("lat", near.lat); q.set("lng", near.lng); }
  return get(`/api/stops?${q}`);
}

// ── Journey planning (TRIAS TripRequest) ──────────────────────
export async function planTrip({ from, to, when, pref }) {
  if (USE_MOCK) return mockTrips();
  const q = new URLSearchParams({ from, to, whenMode: when.mode, time: when.time || "", pref });
  return get(`/api/trips?${q}`);
}

// ── Live departures for a stop (GTFS-RT StopMonitoring) ───────
export async function getDepartures(stopId) {
  if (USE_MOCK) return mockDepartures();
  return get(`/api/departures?stop=${encodeURIComponent(stopId)}`);
}

// ── Live vehicle positions for the map (GTFS-RT VehiclePositions)
export async function getVehicles(bbox) {
  if (USE_MOCK) return mockVehicles();
  const q = new URLSearchParams(bbox);
  return get(`/api/vehicles?${q}`);
}

// ── Service alerts (GTFS-RT ServiceAlerts) ────────────────────
export async function getAlerts() {
  if (USE_MOCK) return mockAlerts();
  return get(`/api/alerts`);
}

// ─────────────────────────────────────────────────────────────
// Mock data — identical shape to what the Worker returns.
// Keeping it here means the UI never knows the difference.
// ─────────────────────────────────────────────────────────────
const MOCK_STOPS = [
  { id: "ma_hbf", name: "Mannheim Hauptbahnhof", lat: 49.4794, lng: 8.4697, lines: ["1", "3", "5", "7"] },
  { id: "ma_para", name: "Mannheim Paradeplatz", lat: 49.4878, lng: 8.4659, lines: ["3", "5", "26"] },
  { id: "ma_uni", name: "Mannheim Universität", lat: 49.4836, lng: 8.4615, lines: ["7", "23"] },
  { id: "ma_was", name: "Mannheim Wasserturm", lat: 49.4837, lng: 8.4756, lines: ["5", "7"] },
  { id: "hd_hbf", name: "Heidelberg Hauptbahnhof", lat: 49.4036, lng: 8.6753, lines: ["5", "22"] },
  { id: "hd_bis", name: "Heidelberg Bismarckplatz", lat: 49.4093, lng: 8.6936, lines: ["5", "23", "26"] },
  { id: "hd_uni", name: "Heidelberg Universitätsplatz", lat: 49.4107, lng: 8.7062, lines: ["26"] },
  { id: "lu_ber", name: "Ludwigshafen Berliner Platz", lat: 49.4812, lng: 8.4438, lines: ["7", "9"] },
  { id: "wh_hbf", name: "Weinheim Hauptbahnhof", lat: 49.5487, lng: 8.6678, lines: ["3"] },
  { id: "sw_sch", name: "Schwetzingen Schloss", lat: 49.3829, lng: 8.5697, lines: ["22"] },
];

function distKm(a, b) {
  const R = 6371, dLat = (b.lat - a.lat) * Math.PI / 180, dLng = (b.lng - a.lng) * Math.PI / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}
export { MOCK_STOPS as STOPS, distKm };

function mockStops(query, near) {
  let pool = MOCK_STOPS.filter((s) => s.name.toLowerCase().includes((query || "").toLowerCase()));
  if (near) pool = pool.map((s) => ({ ...s, d: distKm(near, s) })).sort((a, b) => a.d - b.d);
  return Promise.resolve(pool);
}

function mockTrips() {
  return Promise.resolve([
    { id: "t1", departMin: 4, departTime: "07:50", arriveTime: "08:21", durationMin: 31, interchanges: 1, delayMin: 0, fare: "Price level 2 · €2.50", walkMin: 3,
      legs: [
        { mode: "tram", line: "5", towards: "Heidelberg", from: "Mannheim Hauptbahnhof", to: "Mannheim Paradeplatz", dep: "07:50", arr: "07:58", platform: "Stop A" },
        { mode: "walk", durationMin: 3 },
        { mode: "bus", line: "26", towards: "Universitätsplatz", from: "Mannheim Paradeplatz", to: "Heidelberg Bismarckplatz", dep: "08:01", arr: "08:21", platform: "Stop C" },
      ] },
    { id: "t2", departMin: 12, departTime: "07:58", arriveTime: "08:24", durationMin: 26, interchanges: 0, delayMin: 2, fare: "Price level 2 · €2.50", walkMin: 0,
      legs: [{ mode: "tram", line: "5", towards: "Heidelberg Bismarckplatz", from: "Mannheim Hauptbahnhof", to: "Heidelberg Bismarckplatz", dep: "07:58", arr: "08:24", platform: "Stop A" }] },
    { id: "t3", departMin: 19, departTime: "08:05", arriveTime: "08:39", durationMin: 34, interchanges: 1, delayMin: 0, fare: "Price level 2 · €2.50", walkMin: 2,
      legs: [
        { mode: "bus", line: "7", towards: "Hauptbahnhof", from: "Mannheim Hauptbahnhof", to: "Mannheim Universität", dep: "08:05", arr: "08:14", platform: "Stop B" },
        { mode: "walk", durationMin: 2 },
        { mode: "tram", line: "23", towards: "Heidelberg", from: "Mannheim Universität", to: "Heidelberg Bismarckplatz", dep: "08:16", arr: "08:39", platform: "Stop D" },
      ] },
  ]);
}

function mockDepartures() {
  return Promise.resolve([
    { line: "5", mode: "tram", towards: "Heidelberg Bismarckplatz", min: 2, delayMin: 0, platform: "A" },
    { line: "26", mode: "bus", towards: "Universitätsplatz", min: 4, delayMin: 3, platform: "C" },
    { line: "7", mode: "bus", towards: "Vogelstang", min: 6, delayMin: 0, platform: "B" },
    { line: "3", mode: "tram", towards: "Sandhofen", min: 9, delayMin: 1, platform: "A" },
    { line: "23", mode: "tram", towards: "Käfertal", min: 11, delayMin: 0, platform: "D" },
    { line: "9", mode: "bus", towards: "Neckarau", min: 14, delayMin: 0, platform: "E" },
  ]);
}

function mockVehicles() {
  return Promise.resolve([
    { id: "v1", line: "5", mode: "tram", lat: 49.470, lng: 8.478 },
    { id: "v2", line: "26", mode: "bus", lat: 49.430, lng: 8.640 },
    { id: "v3", line: "7", mode: "bus", lat: 49.483, lng: 8.455 },
    { id: "v4", line: "3", mode: "tram", lat: 49.510, lng: 8.510 },
  ]);
}

function mockAlerts() {
  return Promise.resolve([
    { id: "a1", line: "5", severity: "warning", text: "Delays of up to 8 min between Mannheim Hbf and Heidelberg due to track works." },
    { id: "a2", line: "26", severity: "info", text: "Stop 'Paradeplatz' temporarily moved 80 m north until 12 July." },
  ]);
}
