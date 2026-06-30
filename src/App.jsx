import React, { useState, useEffect, useMemo, useRef } from "react";
import REGION from "./region.js";

// ─────────────────────────────────────────────────────────────
// NECKARLINE — English transit for the Rhine-Neckar region
// Benchmarked against Citymapper / Transit / Moovit. Adds:
// saved places (Home/Work), route preferences, service alerts,
// fare display, recent searches. Real MapLibre map w/ OSM tiles,
// graceful fallback to a schematic if tiles can't load.
// Design rules from real VRN/rnv complaints: no login wall,
// no tracking, opt-in location, map central, planned+live shown
// together, distance-sorted search, English-first.
// All transit data is MOCK, shaped like TRIAS + GTFS-RT.
// ─────────────────────────────────────────────────────────────

const INK = "#0B1F33";
const RIVER = "#1763A6";
const AMBER = "#F2A516";
const PAPER = "#F6F4EF";
const MIST = "#E4E9EE";
const GOOD = "#2E8B6F";
const LATE = "#D9533B";
const WATER = "#A9C9E0";

const STOPS = [
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

const MOCK_POS = REGION.demoCenter;

function distKm(a, b) {
  const R = 6371, dLat = (b.lat - a.lat) * Math.PI / 180, dLng = (b.lng - a.lng) * Math.PI / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

// Trips carry a fare (price level) and tags for preference filtering
const MOCK_TRIPS = [
  { id: "t1", departMin: 4, departTime: "07:50", arriveTime: "08:21", durationMin: 31, interchanges: 1, delayMin: 0, fare: "Price level 2 · €2.50", walkMin: 3, tags: ["fastest"],
    legs: [
      { mode: "tram", line: "5", towards: "Heidelberg", from: "Mannheim Hauptbahnhof", to: "Mannheim Paradeplatz", dep: "07:50", arr: "07:58", platform: "Stop A" },
      { mode: "walk", durationMin: 3 },
      { mode: "bus", line: "26", towards: "Universitätsplatz", from: "Mannheim Paradeplatz", to: "Heidelberg Bismarckplatz", dep: "08:01", arr: "08:21", platform: "Stop C" },
    ] },
  { id: "t2", departMin: 12, departTime: "07:58", arriveTime: "08:24", durationMin: 26, interchanges: 0, delayMin: 2, fare: "Price level 2 · €2.50", walkMin: 0, tags: ["direct", "least_walk"],
    legs: [
      { mode: "tram", line: "5", towards: "Heidelberg Bismarckplatz", from: "Mannheim Hauptbahnhof", to: "Heidelberg Bismarckplatz", dep: "07:58", arr: "08:24", platform: "Stop A" },
    ] },
  { id: "t3", departMin: 19, departTime: "08:05", arriveTime: "08:39", durationMin: 34, interchanges: 1, delayMin: 0, fare: "Price level 2 · €2.50", walkMin: 2, tags: [],
    legs: [
      { mode: "bus", line: "7", towards: "Hauptbahnhof", from: "Mannheim Hauptbahnhof", to: "Mannheim Universität", dep: "08:05", arr: "08:14", platform: "Stop B" },
      { mode: "walk", durationMin: 2 },
      { mode: "tram", line: "23", towards: "Heidelberg", from: "Mannheim Universität", to: "Heidelberg Bismarckplatz", dep: "08:16", arr: "08:39", platform: "Stop D" },
    ] },
];

const MOCK_DEPARTURES = [
  { line: "5", mode: "tram", towards: "Heidelberg Bismarckplatz", min: 2, delayMin: 0, platform: "A" },
  { line: "26", mode: "bus", towards: "Universitätsplatz", min: 4, delayMin: 3, platform: "C" },
  { line: "7", mode: "bus", towards: "Vogelstang", min: 6, delayMin: 0, platform: "B" },
  { line: "3", mode: "tram", towards: "Sandhofen", min: 9, delayMin: 1, platform: "A" },
  { line: "23", mode: "tram", towards: "Käfertal", min: 11, delayMin: 0, platform: "D" },
  { line: "9", mode: "bus", towards: "Neckarau", min: 14, delayMin: 0, platform: "E" },
];

const MOCK_VEHICLES = [
  { id: "v1", line: "5", mode: "tram", lat: 49.470, lng: 8.478 },
  { id: "v2", line: "26", mode: "bus", lat: 49.430, lng: 8.640 },
  { id: "v3", line: "7", mode: "bus", lat: 49.483, lng: 8.455 },
  { id: "v4", line: "3", mode: "tram", lat: 49.510, lng: 8.510 },
];

// Service alerts (GTFS-RT service alerts feed)
const MOCK_ALERTS = [
  { id: "a1", line: "5", severity: "warning", text: "Delays of up to 8 min between Mannheim Hbf and Heidelberg due to track works." },
  { id: "a2", line: "26", severity: "info", text: "Stop 'Paradeplatz' temporarily moved 80 m north until 12 July." },
];

const modeLabel = (m) => (m === "tram" ? "Tram" : m === "bus" ? "Bus" : m === "walk" ? "Walk" : "");

function LineBadge({ mode, line, size = "md" }) {
  const dims = size === "sm" ? { h: 22, f: 12.5, min: 26 } : { h: 26, f: 14, min: 30 };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: dims.min, height: dims.h, padding: "0 8px", borderRadius: 6, background: mode === "tram" ? RIVER : INK, color: "#fff", fontWeight: 700, fontSize: dims.f, fontVariantNumeric: "tabular-nums" }}>{line}</span>
  );
}

function Countdown({ min, big }) {
  const color = min <= 2 ? AMBER : "#fff";
  return (
    <span style={{ fontFamily: "'DM Mono', ui-monospace, monospace", fontWeight: 500, color, fontVariantNumeric: "tabular-nums", fontSize: big ? 32 : 22, lineHeight: 1 }}>
      {min}<span style={{ fontSize: big ? 12 : 11, marginLeft: 2, opacity: 0.7 }}>min</span>
    </span>
  );
}

export default function App() {
  const [tab, setTab] = useState("plan");
  const [from, setFrom] = useState("Mannheim Hauptbahnhof");
  const [to, setTo] = useState("Heidelberg Bismarckplatz");
  const [when, setWhen] = useState({ mode: "now", time: "" });
  const [pref, setPref] = useState("fastest"); // fastest | direct | least_walk
  const [results, setResults] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [locOptIn, setLocOptIn] = useState(false);
  const [tick, setTick] = useState(0);
  const [focusStop, setFocusStop] = useState(null);
  const [saved, setSaved] = useState({ home: "Mannheim Universität", work: "Heidelberg Bismarckplatz" });
  const [recents, setRecents] = useState([]);

  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(i);
  }, []);

  const swap = () => { setFrom(to); setTo(from); };
  const search = () => {
    setResults(MOCK_TRIPS);
    setExpanded(null);
    setRecents((r) => {
      const entry = { from, to };
      const next = [entry, ...r.filter((x) => !(x.from === from && x.to === to))];
      return next.slice(0, 4);
    });
  };
  const routeTo = (dest) => { setTo(dest); setTab("plan"); };

  return (
    <div style={{ minHeight: "100vh", background: PAPER, color: INK, fontFamily: "'Inter', system-ui, sans-serif", maxWidth: 480, margin: "0 auto", position: "relative", paddingBottom: 88 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        button { font-family: inherit; cursor: pointer; border: none; }
        input, select { font-family: inherit; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.45} }
        @keyframes slideup { from{transform:translateY(12px);opacity:0} to{transform:translateY(0);opacity:1} }
        .card-in { animation: slideup .28s ease both; }
        @media (prefers-reduced-motion: reduce){ *{animation:none!important;transition:none!important} }
      `}</style>

      <header style={{ background: INK, color: "#fff", padding: "16px 20px 18px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: -0.4 }}>{REGION.appName}</span>
          <span style={{ fontSize: 11.5, color: AMBER, fontWeight: 600, letterSpacing: 0.5 }}>{REGION.badge}</span>
        </div>
        <div style={{ fontSize: 12.5, color: "#9FB4C7", marginTop: 3 }}>{REGION.tagline}</div>
      </header>

      {tab === "plan" && <PlanView {...{ from, to, setFrom, setTo, swap, search, results, expanded, setExpanded, when, setWhen, pref, setPref, locOptIn, setLocOptIn, saved, recents, routeTo }} />}
      {tab === "map" && <MapView tick={tick} focusStop={focusStop} setFocusStop={setFocusStop} />}
      {tab === "board" && <BoardView tick={tick} locOptIn={locOptIn} setLocOptIn={setLocOptIn} />}
      {tab === "alerts" && <AlertsView />}

      <nav style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#fff", borderTop: `1px solid ${MIST}`, display: "flex", paddingBottom: "env(safe-area-inset-bottom)" }}>
        {[{ id: "plan", label: "Plan", icon: "↳" }, { id: "map", label: "Map", icon: "◎" }, { id: "board", label: "Departures", icon: "↥" }, { id: "alerts", label: "Alerts", icon: "▲" }].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, background: "none", padding: "11px 0 13px", color: tab === t.id ? RIVER : "#8A97A4", fontWeight: tab === t.id ? 700 : 500, fontSize: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, position: "relative" }}>
            <span style={{ fontSize: 17, lineHeight: 1 }}>{t.icon}</span>{t.label}
            {t.id === "alerts" && MOCK_ALERTS.length > 0 && (
              <span style={{ position: "absolute", top: 6, right: "50%", marginRight: -22, background: AMBER, color: INK, fontSize: 10, fontWeight: 700, borderRadius: 9, minWidth: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>{MOCK_ALERTS.length}</span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}

function Field({ label, value, onChange, accent, locOptIn }) {
  const [focus, setFocus] = useState(false);
  const matches = useMemo(() => {
    if (!focus) return [];
    let pool = STOPS.filter((s) => s.name.toLowerCase().includes((value || "").toLowerCase()) && s.name !== value);
    if (locOptIn) pool = pool.map((s) => ({ ...s, d: distKm(MOCK_POS, s) })).sort((a, b) => a.d - b.d);
    return pool.slice(0, 5);
  }, [focus, value, locOptIn]);

  return (
    <div style={{ position: "relative", flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", border: `1px solid ${MIST}`, borderRadius: 10, padding: "11px 13px" }}>
        <span style={{ width: 9, height: 9, borderRadius: accent ? 2 : 9, background: accent ? AMBER : RIVER, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10.5, color: "#8A97A4", fontWeight: 600, letterSpacing: 0.4, textTransform: "uppercase" }}>{label}</div>
          <input value={value} onChange={(e) => onChange(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setTimeout(() => setFocus(false), 160)} placeholder="Stop or address" style={{ width: "100%", border: "none", outline: "none", fontSize: 15.5, fontWeight: 600, color: INK, padding: 0, background: "transparent" }} />
        </div>
      </div>
      {matches.length > 0 && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 20, background: "#fff", border: `1px solid ${MIST}`, borderRadius: 10, boxShadow: "0 8px 24px rgba(11,31,51,0.12)", overflow: "hidden" }}>
          {matches.map((m) => (
            <div key={m.id} onMouseDown={() => onChange(m.name)} style={{ padding: "11px 14px", fontSize: 14.5, borderBottom: `1px solid ${PAPER}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.name}</span>
              {locOptIn && m.d != null && (<span style={{ fontSize: 12, color: "#8A97A4", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>{m.d < 1 ? `${Math.round(m.d * 1000)} m` : `${m.d.toFixed(1)} km`}</span>)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WhenPicker({ when, setWhen }) {
  const opts = [{ id: "now", label: "Leave now" }, { id: "depart", label: "Depart at" }, { id: "arrive", label: "Arrive by" }];
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "flex", gap: 6, background: MIST, padding: 4, borderRadius: 10 }}>
        {opts.map((o) => (
          <button key={o.id} onClick={() => setWhen({ ...when, mode: o.id })} style={{ flex: 1, padding: "8px 0", borderRadius: 7, fontSize: 13, fontWeight: 600, background: when.mode === o.id ? "#fff" : "transparent", color: when.mode === o.id ? INK : "#6B7884", boxShadow: when.mode === o.id ? "0 1px 3px rgba(11,31,51,0.1)" : "none" }}>{o.label}</button>
        ))}
      </div>
      {when.mode !== "now" && (
        <input type="time" value={when.time || "08:00"} onChange={(e) => setWhen({ ...when, time: e.target.value })} style={{ marginTop: 8, width: "100%", border: `1px solid ${MIST}`, borderRadius: 10, padding: "11px 13px", fontSize: 15.5, fontWeight: 600, color: INK, outline: "none", fontFamily: "'DM Mono', monospace" }} />
      )}
    </div>
  );
}

function PrefPicker({ pref, setPref }) {
  const opts = [{ id: "fastest", label: "Fastest" }, { id: "direct", label: "Fewest changes" }, { id: "least_walk", label: "Least walking" }];
  return (
    <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
      {opts.map((o) => (
        <button key={o.id} onClick={() => setPref(o.id)} style={{ flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 12.5, fontWeight: 600, border: `1px solid ${pref === o.id ? RIVER : MIST}`, background: pref === o.id ? RIVER : "#fff", color: pref === o.id ? "#fff" : "#6B7884" }}>{o.label}</button>
      ))}
    </div>
  );
}

function SavedRow({ saved, routeTo, recents, setFrom, setTo }) {
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => routeTo(saved.home)} style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: "#fff", border: `1px solid ${MIST}`, borderRadius: 10, padding: "10px 12px", fontSize: 13.5, fontWeight: 600, color: INK }}>
          <span style={{ fontSize: 15 }}>⌂</span> Home
        </button>
        <button onClick={() => routeTo(saved.work)} style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: "#fff", border: `1px solid ${MIST}`, borderRadius: 10, padding: "10px 12px", fontSize: 13.5, fontWeight: 600, color: INK }}>
          <span style={{ fontSize: 14 }}>▤</span> Work
        </button>
      </div>
      {recents.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#8A97A4", letterSpacing: 0.4, textTransform: "uppercase", marginBottom: 6 }}>Recent</div>
          {recents.map((r, i) => (
            <button key={i} onClick={() => { setFrom(r.from); setTo(r.to); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, background: "none", padding: "8px 2px", fontSize: 13.5, color: "#3D4D5C", textAlign: "left", borderBottom: i < recents.length - 1 ? `1px solid ${MIST}` : "none" }}>
              <span style={{ color: "#A4B0BC" }}>↻</span>
              <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.from} → {r.to}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PlanView({ from, to, setFrom, setTo, swap, search, results, expanded, setExpanded, when, setWhen, pref, setPref, locOptIn, setLocOptIn, saved, recents, routeTo }) {
  const shown = useMemo(() => {
    if (!results) return null;
    const score = (t) => (pref === "direct" ? t.interchanges : pref === "least_walk" ? t.walkMin : t.durationMin);
    return [...results].sort((a, b) => score(a) - score(b));
  }, [results, pref]);

  return (
    <div style={{ padding: "16px 16px 0" }}>
      <div style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <Field label="From" value={from} onChange={setFrom} locOptIn={locOptIn} />
          <Field label="To" value={to} onChange={setTo} accent locOptIn={locOptIn} />
        </div>
        <button onClick={swap} aria-label="Swap origin and destination" style={{ background: "#fff", border: `1px solid ${MIST}`, borderRadius: 10, width: 46, fontSize: 19, color: RIVER, fontWeight: 700 }}>⇅</button>
      </div>

      {!locOptIn && (
        <button onClick={() => setLocOptIn(true)} style={{ marginTop: 8, width: "100%", background: "#fff", border: `1px dashed ${WATER}`, borderRadius: 10, padding: "9px", fontSize: 13, color: RIVER, fontWeight: 600 }}>◎ Use my location to find nearby stops</button>
      )}
      {locOptIn && (
        <div style={{ marginTop: 8, fontSize: 12, color: GOOD, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
          ◎ Sorting stops by distance from you · <button onClick={() => setLocOptIn(false)} style={{ background: "none", color: "#8A97A4", textDecoration: "underline", fontSize: 12, padding: 0 }}>turn off</button>
        </div>
      )}

      <WhenPicker when={when} setWhen={setWhen} />
      <PrefPicker pref={pref} setPref={setPref} />

      <button onClick={search} style={{ width: "100%", marginTop: 12, background: AMBER, color: INK, fontWeight: 700, fontSize: 16, padding: "14px", borderRadius: 11 }}>Find routes</button>

      {!results && <SavedRow saved={saved} routeTo={routeTo} recents={recents} setFrom={setFrom} setTo={setTo} />}

      {shown && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#6B7884", letterSpacing: 0.4, textTransform: "uppercase", marginBottom: 10 }}>
            {shown.length} routes · {when.mode === "arrive" ? `arrive by ${when.time || "08:00"}` : "leaving soon"}
          </div>
          {shown.map((trip, i) => (
            <div key={trip.id} className="card-in" style={{ animationDelay: `${i * 60}ms` }}>
              <TripCard trip={trip} open={expanded === trip.id} onToggle={() => setExpanded(expanded === trip.id ? null : trip.id)} />
            </div>
          ))}
          <div style={{ textAlign: "center", fontSize: 11.5, color: "#A4B0BC", padding: "8px 0 20px" }}>Simulated data · {REGION.dataCredit}</div>
        </div>
      )}
    </div>
  );
}

function TripCard({ trip, open, onToggle }) {
  const late = trip.delayMin > 0;
  return (
    <div onClick={onToggle} style={{ background: "#fff", border: `1px solid ${MIST}`, borderRadius: 14, padding: "14px 15px", marginBottom: 11, cursor: "pointer", boxShadow: open ? "0 6px 20px rgba(11,31,51,0.08)" : "none" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 25, fontWeight: 500, color: INK, fontVariantNumeric: "tabular-nums" }}>{trip.departTime}</span>
            <span style={{ color: "#B4BFC9", fontSize: 14 }}>→</span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 25, fontWeight: 500, color: INK, fontVariantNumeric: "tabular-nums" }}>{trip.arriveTime}</span>
          </div>
          <div style={{ fontSize: 12, marginTop: 3, color: late ? LATE : GOOD, fontWeight: 600 }}>{late ? `Live: departs ${trip.delayMin} min late` : "Live: on time"}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 22, fontFamily: "'DM Mono', monospace", fontWeight: 500, color: trip.departMin <= 5 ? AMBER : INK }}>{trip.departMin}<span style={{ fontSize: 11, opacity: 0.6 }}>min</span></div>
          <div style={{ fontSize: 11.5, color: "#8A97A4" }}>to go</div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
        {trip.legs.filter((l) => l.mode !== "walk").map((l, i, arr) => (
          <React.Fragment key={i}>
            <LineBadge mode={l.mode} line={l.line} size="sm" />
            {i < arr.length - 1 && <span style={{ color: "#C4CDD5", fontSize: 13 }}>›</span>}
          </React.Fragment>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 13, color: "#6B7884", fontWeight: 600 }}>{trip.durationMin} min · {trip.interchanges === 0 ? "direct" : `${trip.interchanges} change`}</span>
      </div>

      <div style={{ marginTop: 10, fontSize: 12.5, color: "#6B7884", display: "flex", gap: 12 }}>
        <span>🎟 {trip.fare}</span>
        {trip.walkMin > 0 && <span>↝ {trip.walkMin} min walk</span>}
      </div>

      {open && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${PAPER}` }}>
          {trip.legs.map((leg, i) => (
            <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 50, flexShrink: 0, textAlign: "right" }}>
                {leg.mode !== "walk" && <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13.5, color: INK }}>{leg.dep}</div>}
              </div>
              <div style={{ flex: 1 }}>
                {leg.mode === "walk" ? (
                  <div style={{ fontSize: 13.5, color: "#6B7884" }}>↝ Walk {leg.durationMin} min to next stop</div>
                ) : (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <LineBadge mode={leg.mode} line={leg.line} size="sm" />
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{modeLabel(leg.mode)} towards {leg.towards}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "#6B7884", marginTop: 5, lineHeight: 1.5 }}>Board at {leg.from} · {leg.platform}<br />Get off at {leg.to} · arrives {leg.arr}</div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Real map via MapLibre + OSM tiles, schematic fallback ──────
function MapView({ tick, focusStop, setFocusStop }) {
  const elRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [status, setStatus] = useState("loading"); // loading | ready | fallback

  useEffect(() => {
    let cancelled = false;
    const CSS = "https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css";
    const JS = "https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js";

    function loadCss() {
      if (document.querySelector(`link[href="${CSS}"]`)) return;
      const l = document.createElement("link");
      l.rel = "stylesheet"; l.href = CSS; document.head.appendChild(l);
    }
    function loadJs() {
      return new Promise((res, rej) => {
        if (window.maplibregl) return res();
        const s = document.createElement("script");
        s.src = JS; s.onload = res; s.onerror = rej; document.head.appendChild(s);
      });
    }

    const timeout = setTimeout(() => { if (!cancelled && status !== "ready") setStatus("fallback"); }, 6000);

    loadCss();
    loadJs().then(() => {
      if (cancelled || !elRef.current || !window.maplibregl) { setStatus("fallback"); return; }
      try {
        const mtKey = (import.meta.env && import.meta.env.VITE_MAPTILER_KEY) || REGION.map.maptilerKey;
        const map = new window.maplibregl.Map({
          container: elRef.current,
          style: REGION.map.tileStyleUrl(mtKey),
          center: REGION.map.center, zoom: REGION.map.zoom, attributionControl: true,
        });
        mapRef.current = map;
        map.on("load", () => {
          if (cancelled) return;
          setStatus("ready");
          STOPS.forEach((s) => {
            const el = document.createElement("div");
            el.style.cssText = `width:14px;height:14px;border-radius:50%;background:#fff;border:3px solid ${RIVER};cursor:pointer;box-shadow:0 1px 3px rgba(0,0,0,.3)`;
            el.onclick = () => setFocusStop(s.id);
            const m = new window.maplibregl.Marker({ element: el }).setLngLat([s.lng, s.lat]).addTo(map);
            markersRef.current.push(m);
          });
        });
        map.on("error", () => { if (!cancelled) setStatus("fallback"); });
      } catch (e) { setStatus("fallback"); }
    }).catch(() => setStatus("fallback"));

    return () => { cancelled = true; clearTimeout(timeout); if (mapRef.current) mapRef.current.remove(); };
  }, []);

  const sel = focusStop ? STOPS.find((s) => s.id === focusStop) : null;

  return (
    <div style={{ padding: "12px 16px 0" }}>
      <div style={{ fontSize: 13, color: "#6B7884", marginBottom: 10, lineHeight: 1.4 }}>Live buses & trams near you. Tap a stop for departures.</div>

      <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", border: `1px solid ${MIST}`, background: "#EEF3F6", height: 520 }}>
        {/* Real map mounts here */}
        <div ref={elRef} style={{ position: "absolute", inset: 0, display: status === "fallback" ? "none" : "block" }} />
        {status === "loading" && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#8A97A4", fontSize: 13 }}>Loading map…</div>
        )}
        {status === "fallback" && <SchematicMap tick={tick} focusStop={focusStop} setFocusStop={setFocusStop} />}
        <div style={{ position: "absolute", top: 10, left: 10, background: "rgba(255,255,255,0.92)", borderRadius: 8, padding: "7px 10px", fontSize: 11, color: INK, display: "flex", flexDirection: "column", gap: 4, zIndex: 5 }}>
          <span><span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 9, border: `2px solid ${RIVER}`, marginRight: 5, verticalAlign: "middle" }} />Stop</span>
          <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 3, background: INK, marginRight: 5, verticalAlign: "middle" }} />Live vehicle</span>
        </div>
      </div>
      {status === "fallback" && (
        <div style={{ fontSize: 11.5, color: "#A4B0BC", marginTop: 6 }}>Map tiles unavailable here — showing schematic. The hosted app loads a full OpenStreetMap map.</div>
      )}

      {sel && (
        <div className="card-in" style={{ marginTop: 12, background: "#fff", border: `1px solid ${MIST}`, borderRadius: 14, padding: "14px 15px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{sel.name}</div>
              <div style={{ fontSize: 12.5, color: "#8A97A4", marginTop: 2 }}>Lines {sel.lines.join(", ")}</div>
            </div>
            <button onClick={() => setFocusStop(null)} style={{ background: "none", color: "#8A97A4", fontSize: 20, lineHeight: 1 }}>×</button>
          </div>
          <div style={{ marginTop: 12 }}>
            {MOCK_DEPARTURES.filter((d) => sel.lines.includes(d.line)).slice(0, 3).map((d, i, a) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < a.length - 1 ? `1px solid ${PAPER}` : "none" }}>
                <LineBadge mode={d.mode} line={d.line} size="sm" />
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.towards}</span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 500, color: d.min <= 2 ? AMBER : INK, fontSize: 16 }}>{d.min}<span style={{ fontSize: 11, opacity: 0.6 }}>min</span></span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ textAlign: "center", fontSize: 11.5, color: "#A4B0BC", padding: "14px 0 20px" }}>Simulated positions · Live vehicles via GTFS-RT · Map © OpenStreetMap</div>
    </div>
  );
}

function SchematicMap({ tick, focusStop, setFocusStop }) {
  const bounds = REGION.map.bounds;
  const W = 448, H = 520;
  const px = (lng) => ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * W;
  const py = (lat) => H - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * H;
  const veh = MOCK_VEHICLES.map((v, i) => ({ ...v, lat: v.lat + Math.sin(tick + i) * 0.002, lng: v.lng + Math.cos(tick + i) * 0.002 }));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ display: "block", position: "absolute", inset: 0 }}>
      {REGION.map.waterway && REGION.map.waterway.length >= 4 && (() => {
        const w = REGION.map.waterway;
        const d = `M ${px(w[0][0])} ${py(w[0][1])} C ${px(w[1][0])} ${py(w[1][1])}, ${px(w[2][0])} ${py(w[2][1])}, ${px(w[3][0])} ${py(w[3][1])}`;
        return <path d={d} stroke={WATER} strokeWidth="9" fill="none" strokeLinecap="round" opacity="0.7" />;
      })()}
      {["5", "26", "7"].map((ln) => {
        const pts = STOPS.filter((s) => s.lines.includes(ln));
        if (pts.length < 2) return null;
        const d = pts.map((s, i) => `${i ? "L" : "M"} ${px(s.lng)} ${py(s.lat)}`).join(" ");
        return <path key={ln} d={d} stroke={ln === "5" ? RIVER : INK} strokeWidth="2.5" fill="none" opacity="0.28" strokeDasharray={ln === "7" ? "5 5" : "none"} />;
      })}
      {STOPS.map((s) => (
        <circle key={s.id} cx={px(s.lng)} cy={py(s.lat)} r={focusStop === s.id ? 9 : 6} fill="#fff" stroke={focusStop === s.id ? AMBER : RIVER} strokeWidth="3" style={{ cursor: "pointer" }} onClick={() => setFocusStop(s.id)} />
      ))}
      {veh.map((v) => (
        <g key={v.id} style={{ animation: "pulse 2s ease-in-out infinite" }}>
          <rect x={px(v.lng) - 9} y={py(v.lat) - 9} width="18" height="18" rx="4" fill={v.mode === "tram" ? RIVER : INK} />
          <text x={px(v.lng)} y={py(v.lat) + 4} textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff" fontFamily="DM Mono, monospace">{v.line}</text>
        </g>
      ))}
    </svg>
  );
}

function AlertsView() {
  return (
    <div style={{ padding: "16px 16px 0" }}>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Service alerts</div>
      <div style={{ fontSize: 13, color: "#6B7884", marginBottom: 14 }}>Disruptions and changes on your network right now.</div>
      {MOCK_ALERTS.map((a) => (
        <div key={a.id} style={{ background: "#fff", border: `1px solid ${MIST}`, borderLeft: `4px solid ${a.severity === "warning" ? LATE : RIVER}`, borderRadius: 12, padding: "13px 15px", marginBottom: 11, display: "flex", gap: 12 }}>
          <LineBadge mode="tram" line={a.line} size="sm" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: a.severity === "warning" ? LATE : RIVER, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 3 }}>{a.severity === "warning" ? "Disruption" : "Notice"}</div>
            <div style={{ fontSize: 14, color: INK, lineHeight: 1.45 }}>{a.text}</div>
          </div>
        </div>
      ))}
      <div style={{ textAlign: "center", fontSize: 11.5, color: "#A4B0BC", padding: "8px 0 20px" }}>Simulated alerts · Live via GTFS-RT service alerts</div>
    </div>
  );
}

function BoardView({ tick, locOptIn, setLocOptIn }) {
  const [stop, setStop] = useState("Mannheim Hauptbahnhof");
  const nearby = useMemo(() => {
    if (!locOptIn) return STOPS;
    return [...STOPS].map((s) => ({ ...s, d: distKm(MOCK_POS, s) })).sort((a, b) => a.d - b.d);
  }, [locOptIn]);
  const deps = useMemo(() => MOCK_DEPARTURES.map((d) => ({ ...d, min: Math.max(0, d.min - tick) })).filter((d) => d.min > 0 || tick === 0), [tick]);

  return (
    <div style={{ padding: "16px 16px 0" }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#8A97A4", letterSpacing: 0.5, textTransform: "uppercase" }}>Departures from</div>
      <select value={stop} onChange={(e) => setStop(e.target.value)} style={{ width: "100%", marginTop: 6, marginBottom: 8, fontSize: 17, fontWeight: 700, color: INK, border: `1px solid ${MIST}`, borderRadius: 10, padding: "11px 13px", background: "#fff", outline: "none" }}>
        {nearby.map((s) => (<option key={s.id} value={s.name}>{s.name}{locOptIn && s.d != null ? `  ·  ${s.d < 1 ? Math.round(s.d * 1000) + " m" : s.d.toFixed(1) + " km"}` : ""}</option>))}
      </select>
      {!locOptIn && (<button onClick={() => setLocOptIn(true)} style={{ background: "none", color: RIVER, fontSize: 12.5, fontWeight: 600, padding: "0 0 10px", textDecoration: "underline" }}>◎ Sort by nearest stop</button>)}

      <div style={{ background: INK, borderRadius: 16, overflow: "hidden" }}>
        {deps.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: i < deps.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
            <LineBadge mode={d.mode} line={d.line} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: "#fff", fontSize: 15, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.towards}</div>
              <div style={{ color: "#7F94A8", fontSize: 12, marginTop: 2 }}>Platform {d.platform} · {d.delayMin > 0 ? <span style={{ color: AMBER }}>+{d.delayMin} min late</span> : <span style={{ color: "#5FBF9A" }}>on time</span>}</div>
            </div>
            <Countdown min={d.min} big />
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center", fontSize: 11.5, color: "#A4B0BC", padding: "14px 0 20px" }}>Simulated countdown · Live via GTFS-RT</div>
    </div>
  );
}
