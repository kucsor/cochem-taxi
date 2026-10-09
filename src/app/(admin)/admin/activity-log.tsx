"use client";
import { useState } from "react";
import { csvCell, eventLabels, type ActivityEvent } from "@/lib/analytics-dashboard";
import { destinationLabels, type Destination } from "@/lib/analytics-destinations";
import { describeFailure } from "@/lib/calculation-diagnostics";
const place = (s?: string | null) => !s || s === "unknown" ? "Not recorded" : s === "other" ? "Outside supported places" : destinationLabels[s as Destination] || s;
const time = (s: string) => new Date(s).toLocaleString("en-GB", { timeZone: "Europe/Berlin", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
export function ActivityLog({events, errorsOnly = false, totalErrors = 0}: {events: ActivityEvent[]; errorsOnly?: boolean; totalErrors?: number}) {
  const [filter,setFilter] = useState("all");
  const [query,setQuery] = useState("");
  const [limit,setLimit] = useState(20);
  const filtered = events.filter(e => (filter === "all" || (filter === "calculations" ? ["use_calculator","calculator_success","calculator_error"].includes(e.name) : e.name === filter)) && [e.path,place(e.origin),place(e.destination),e.outcome,eventLabels[e.name],e.name,e.name === "calculator_error" ? describeFailure(e.outcome).title : ""].join(" ").toLowerCase().includes(query.trim().toLowerCase()));
  function exportLog() {
    const rows = [["Time (UTC)","Event","Reason code","Explanation","Page","Pickup category","Destination category","Route version","Passengers","Tariff","Estimate EUR (not revenue)","Distance km","Device","Language","Source","Event ID"],...filtered.map(e=>[e.created_at,e.name,e.outcome||"",e.name === "calculator_error" ? describeFailure(e.outcome).explanation : "",e.path,place(e.origin),place(e.destination),e.route_version??"",e.passengers||"",e.tariff||"",e.fare??"",e.distance??"",e.device,e.language,e.source||"",e.id||""])];
    const url=URL.createObjectURL(new Blob(["\uFEFF"+rows.map(r=>r.map(csvCell).join(",")).join("\r\n")],{type:"text/csv;charset=utf-8"}));
    const a=document.createElement("a");a.href=url;a.download=errorsOnly?"calculation-error-log.csv":"activity-log.csv";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  return <section className="insight-panel activity-log">
    <header><h2>{errorsOnly ? "Calculation error log" : "Recent recorded activity"}</h2><p>{errorsOnly ? "Latest 100 calculation errors" : "Latest 200 events"} matching the dashboard dates, language, device and environment. Raw events are retained for 90 days. Times below use Berlin time.</p></header>
    {errorsOnly && <p className="muted">{events.length} error records available here · {totalErrors} errors in aggregate totals for this selection. Older or additional errors may only appear in the totals.</p>}
    <div className="destination-tools">
      <label className="search-box"><input aria-label={errorsOnly ? "Search error log" : "Search activity log"} placeholder="Search route, page or reason…" value={query} onChange={e=>{setQuery(e.target.value);setLimit(20);}}/></label>
      {!errorsOnly && <label className="sort-label">Show <select aria-label="Activity type" value={filter} onChange={e=>{setFilter(e.target.value);setLimit(20);}}><option value="all">All activity</option><option value="calculations">Calculator activity</option><option value="calculator_error">Calculation errors</option><option value="click_call_now">Call clicks</option><option value="page_view">Page views</option></select></label>}
      <button className="secondary" disabled={!filtered.length} onClick={exportLog}>Export log CSV</button>
    </div>
    <p className="muted">Showing {Math.min(limit,filtered.length)} of {filtered.length} matching loaded records. Narrow the dashboard dates to inspect older activity within retention.</p>
    <div className="log-list">{filtered.slice(0,limit).map((e,i)=>{
      const failed=e.name === "calculator_error";
      const reason=describeFailure(e.outcome);
      return <details className={`log-entry ${failed ? "log-error" : ""}`} key={e.id||`${e.created_at}-${e.name}-${i}`}>
        <summary><span><strong>{eventLabels[e.name]||e.name}</strong><span>{failed ? reason.title : e.route_version === 2 ? `${place(e.origin)} → ${place(e.destination)}` : e.path}</span></span><time dateTime={e.created_at}>{time(e.created_at)}</time><span className="log-open">Details ↓</span></summary>
        <div className="log-body">
          {failed && <div className="notice"><p><strong>{reason.title}.</strong> {reason.explanation}</p><p>{reason.action}</p><p>Recorded code: <code>{e.outcome||"not recorded"}</code></p></div>}
          <dl className="log-fields">{[
            ["Page",e.path],["Device / language",`${e.device} · ${e.language.toUpperCase()}`],["Placement",e.source||"Not recorded"],
            ["Pickup category",place(e.origin)],["Destination category",place(e.destination)],["Route data",e.route_version === 2 ? "Current place categories" : "Historical / unavailable — route unverified"],
            ["Passengers",e.passengers||"Not recorded"],["Tariff",e.tariff||"Not recorded"],
            ["Calculated estimate (not revenue)",e.fare == null ? "Not recorded" : new Intl.NumberFormat("en-GB",{style:"currency",currency:"EUR"}).format(e.fare)],
            ["Distance",e.distance == null ? "Not recorded" : `${e.distance} km`],
            ["Call attribution",e.name !== "click_call_now" ? "Not applicable" : e.after_estimate === 1 ? "Click after estimate in consenting tab" : "No estimate association recorded"],
            ["Event reference",e.id||"Not recorded"],
          ].map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
          <p className="muted">This is a recorded action, not proof of a booking or completed ride. Exact addresses and GPS coordinates are not stored.</p>
        </div>
      </details>;
    })}</div>
    {!filtered.length && <p className="empty">No matching records available. Aggregate totals can include older events outside the raw-data window.</p>}
    {filtered.length>limit && <button className="secondary" onClick={()=>setLimit(n=>n+20)}>Show 20 more</button>}
  </section>;
}
