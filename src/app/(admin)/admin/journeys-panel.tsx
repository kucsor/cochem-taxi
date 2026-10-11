"use client";
import { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, AreaChart, Area, Legend, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { ArrowRight, ChevronDown, Clock, Download, Globe2, MousePointer2 } from "lucide-react";
import { analyticsPlaceLabel } from "@/lib/analytics-destinations";
import { failureDetails } from "@/lib/calculation-diagnostics";
import { csvCell, eventLabels, type JourneyReport, type SessionReport, type SessionRow, type JourneyEvent } from "@/lib/analytics-dashboard";
const regions = new Intl.DisplayNames(["en"], { type: "region" });
export function countryName(code: string) { try { return code === "unknown" ? "Country not recorded" : regions.of(code) || code; } catch { return "Country not recorded"; } }
const num = (n: number) => n.toLocaleString("en-GB");
const duration = (ms: number) => ms < 60000 ? `${Math.round(ms / 1000)}s` : `${Math.floor(ms / 60000)}m ${Math.round(ms % 60000 / 1000)}s`;
const time = (s: string) => new Date(s).toLocaleString("en-GB", { timeZone: "Europe/Berlin", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit" });
function download(name: string, rows: unknown[][]) {
  const url = URL.createObjectURL(new Blob(["\uFEFF" + rows.map(r => r.map(csvCell).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a"); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
}
export function MeasurementCoverage({ report }: { report?: JourneyReport }) {
  if (!report) return <section className="journey-panel"><h2>Detailed measurement unavailable</h2><p>The statistics service has not returned the new report. Existing totals remain available.</p></section>;
  const c = report.coverage;
  return <section className="journey-panel"><div className="journey-heading"><div><span className="eyebrow">WHAT THESE NUMBERS COVER</span><h2>Measurement coverage</h2></div><Globe2 size={24} /></div>
    <div className="journey-metrics">{[["Views with a country", c.country_views, c.views],["Views linked to a session", c.session_views,c.views],["Views using new measurement",c.measured_views,c.views],["Call clicks linked to a session",c.session_calls,c.calls]].map(([label,value,total]) => <div key={label}><span>{label}</span><strong>{num(Number(value))}<small> / {num(Number(total))}</small></strong><progress aria-label={String(label)} max={Number(total) || 1} value={Number(value)} /></div>)}</div>
    <p className="muted">Coverage counts recorded views or clicks, not people. Historical events cannot acquire a missing country or session. Session linking requires consent; DNT/GPC and blocked requests leave gaps.</p>
    <p className="muted">{num(c.linked_calls)} call clicks followed a successful estimate within 30 minutes. This records intent to call, not connected calls, bookings or revenue.</p>
  </section>;
}
export function CountriesPanel({ report }: { report?: JourneyReport }) {
  const [country,setCountry] = useState("");
  const selectedCountry = report?.countries.some(r=>r.country===country) ? country : "";
  const countries = report?.countries || [];
  const routes = (report?.routes || []).filter(r=>!selectedCountry || r.country===selectedCountry);
  const daily = useMemo(()=>{
    const days = new Map<string,{ day: string; views: number; calculations: number; calls: number }>();
    for (const r of report?.daily || []) { if (selectedCountry && r.country!==selectedCountry) continue; const row = days.get(r.day) || { day:r.day,views:0,calculations:0,calls:0 }; row.views+=r.views;row.calculations+=r.calculations;row.calls+=r.calls;days.set(r.day,row); }
    return [...days.values()];
  },[report,selectedCountry]);
  if (!report) return null;
  return <section className="journey-panel"><div className="journey-heading"><div><span className="eyebrow">CONNECTION GEOGRAPHY</span><h2>Countries & route demand</h2></div><button className="button" onClick={()=>download("countries.csv",[["Country","Views","Session starts","Calculations","Successes","Errors","Call clicks","Calls after estimate"],...countries.map(r=>[countryName(r.country),r.views,r.session_starts,r.calculations,r.successes,r.errors,r.calls,r.linked_calls])])}><Download size={16} /> Export countries</button></div>
    <p className="muted">Country is estimated by Vercel from the internet connection, independently of page language. VPNs can change it. Dutch-language visits do not necessarily come from the Netherlands.</p>
    <div className="country-cards">{countries.map(r=><button className={`country-card ${selectedCountry===r.country?'selected':''}`} key={r.country} onClick={()=>setCountry(selectedCountry===r.country?'':r.country)} aria-pressed={selectedCountry===r.country}><span>{countryName(r.country)}</span><strong>{num(r.views)} <small>views</small></strong><div className="country-bar"><i style={{width:`${Math.max(2,r.views/Math.max(1,...countries.map(c=>c.views))*100)}%`}} /></div><small>{num(r.calculations)} calculations · {num(r.calls)} call clicks</small><small>{num(r.session_starts)} session starts · {num(r.linked_calls)} calls after estimate</small></button>)}</div>
    {!countries.length && <p className="empty">No recorded events for these filters.</p>}
    <label className="journey-filter">Country for this chart and route list<select value={selectedCountry} onChange={e=>setCountry(e.target.value)}><option value="">All recorded countries</option>{countries.map(r=><option key={r.country} value={r.country}>{countryName(r.country)}</option>)}</select></label>
    <div className="chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={daily}><CartesianGrid stroke="#253343" vertical={false}/><XAxis dataKey="day" tick={{fontSize:10}} minTickGap={35}/><YAxis allowDecimals={false} width={36}/><Tooltip contentStyle={{background:'#101a27',border:'1px solid #314157',color:'#fff'}}/><Legend/><Area dot={{r:3}} dataKey="views" name="Page views" stroke="#63d7b4" fill="#63d7b4" fillOpacity={0.08} isAnimationActive={false}/><Area dot={{r:3}} dataKey="calculations" name="Calculations" stroke="#dfb965" fill="#dfb965" fillOpacity={0.08} isAnimationActive={false}/><Area dot={{r:3}} dataKey="calls" name="Call clicks" stroke="#a9b7ff" fillOpacity={0} isAnimationActive={false}/></AreaChart></ResponsiveContainer></div>
    <p className="muted">Daily recorded activity · selected date range · Berlin time. Session starts are counted once per consenting tab session; they are not unique visitors.</p>
    <div className="journey-route-list">{routes.map(r=><div key={`${r.country}:${r.origin}:${r.destination}`}><span className="muted">{countryName(r.country)}</span><strong>{analyticsPlaceLabel(r.origin)} <ArrowRight size={14}/> {analyticsPlaceLabel(r.destination)}</strong><span>{num(r.calculations)} calculations · {num(r.errors)} errors · {num(r.linked_calls)} calls after estimate</span></div>)}</div>
    {!routes.length && <p className="empty">No route activity for this country and date range.</p>}
  </section>;
}
export function TargetsPanel({ report }: { report?: JourneyReport }) {
  const [search,setSearch] = useState("");
  if (!report) return null;
  const rows = report.targets.filter(r=>`${eventLabels[r.name]||r.name} ${r.source} ${r.target}`.toLowerCase().includes(search.toLowerCase()));
  return <section className="journey-panel"><div className="journey-heading"><div><h2>Exactly which controls were used</h2><p className="muted">Recorded actions by placement and safe target. Addresses, input text and URL queries are excluded.</p></div><MousePointer2/></div><input className="journey-search" aria-label="Find a control" placeholder="Find a control or page…" value={search} onChange={e=>setSearch(e.target.value)}/><div className="journey-route-list">{rows.map(r=><div key={`${r.name}:${r.source}:${r.target}:${r.target_language}`}><strong>{eventLabels[r.name]||r.name} <span className="journey-count">{num(r.count)}</span></strong><span>{r.source} · {r.target==='unknown'?'Target not recorded':r.target}{r.target_language!=='unknown'?` · language: ${r.target_language.toUpperCase()}`:''}</span></div>)}</div>{!rows.length&&<p className="empty">No matching recorded actions.</p>}</section>;
}
function TimelineEvent({ event:e, previous }: { event: JourneyEvent; previous?: JourneyEvent }) {
  const failure = e.name === "calculator_error" ? failureDetails[e.outcome || "request_failed"] || failureDetails.request_failed : undefined;
  const gap = previous ? Math.max(0,Date.parse(e.created_at)-Date.parse(previous.created_at)) : null;
  return <li className={`timeline-event ${e.name==='calculator_error'?'has-error':''}`}><div className="timeline-clock"><time dateTime={e.created_at}>{time(e.created_at)}</time>{gap!==null&&<small>+{duration(gap)} since previous recorded event</small>}</div><div className="timeline-content"><strong>{eventLabels[e.name]||e.name}</strong><p>{e.path} · {e.source||'Placement not recorded'} · {countryName(e.country||'unknown')} · {e.language?.toUpperCase()}</p>{e.target&&<p>Target: <code>{e.target}</code>{e.target_language&&` · ${e.target_language.toUpperCase()}`}</p>}
    {(e.origin||e.destination)&&<p>{analyticsPlaceLabel(e.origin||'unknown')} → {analyticsPlaceLabel(e.destination||'unknown')}</p>}
    {(e.passengers||e.tariff)&&<p>{e.passengers||'Unrecorded'} passengers · {e.tariff||'Unrecorded'} tariff</p>}
    {e.name==='scroll_depth'&&<p>Scroll depth: {e.value}%</p>}
    {e.visible_ms!=null&&<p>Page visible: {duration(e.visible_ms)} · active: {duration(e.active_ms||0)}</p>}
    {e.calculation_id&&<p>Calculation reference: <code>{e.calculation_id}</code></p>}
    {e.after_estimate===1&&<p className="linked-call">Call clicked after estimate{e.call_delay_seconds!=null?` · ${e.call_delay_seconds}s later`:' · delay not recorded'}</p>}
    {e.name==='click_call_now'&&!e.after_estimate&&<p>No eligible successful estimate was linked to this click.</p>}
    {failure&&<div className="timeline-failure"><strong>{failure.title}</strong><p>{failure.explanation}</p><p>{failure.action}</p><code>{e.outcome}</code></div>}
    {e.name==='calculator_success'&&<p>Estimate: {e.fare!=null?`€${e.fare.toFixed(2)}`:'not recorded'} · {e.distance??'—'} km. Not revenue.</p>}
  </div></li>;
}
export function SessionsPanel({ from,to,language,device,environment,refresh,countries }: { from:string;to:string;language:string;device:string;environment:string;refresh:string;countries:JourneyReport["countries"] }) {
  const [country,setCountry]=useState("");
  const [offset,setOffset]=useState(0);
  const [selected,setSelected]=useState<SessionRow|null>(null);
  const [eventOffset,setEventOffset]=useState(0);
  const [report,setReport]=useState<SessionReport|null>(null);
  const [detail,setDetail]=useState<SessionReport|null>(null);
  const [error,setError]=useState("");
  const [detailError,setDetailError]=useState("");
  const [loading,setLoading]=useState(true);
  const query = new URLSearchParams({from,to,language,device,environment,country}).toString();
  useEffect(()=>{setOffset(0);setSelected(null);setEventOffset(0);},[query]);
  useEffect(()=>{
    const controller=new AbortController();setLoading(true);setError("");setReport(null);
    fetch(`/api/admin/sessions?${query}&offset=${offset}`,{cache:'no-store',signal:controller.signal}).then(async r=>{const data=await r.json();if(!r.ok)throw new Error(data.error||'Sessions unavailable');return data;}).then(setReport).catch(e=>{if(!controller.signal.aborted)setError(e.message);}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});
    return ()=>controller.abort();
  },[query,offset,refresh]);
  useEffect(()=>{
    if(!selected){setDetail(null);return;}
    const controller=new AbortController();setDetail(null);setDetailError("");
    fetch(`/api/admin/sessions?${query}&visit=${selected.visit}&offset=${eventOffset}`,{cache:'no-store',signal:controller.signal}).then(async r=>{const data=await r.json();if(!r.ok)throw new Error(data.error||'Timeline unavailable');return data;}).then(setDetail).catch(e=>{if(!controller.signal.aborted)setDetailError(e.message);});
    return ()=>controller.abort();
  },[query,selected,eventOffset,refresh]);
  return <><section className="journey-panel"><div className="journey-heading"><div><span className="eyebrow">CONSENTED TAB SESSIONS</span><h2>Follow the recorded journey</h2></div><Clock/></div><p className="muted">A session groups actions in one consenting browser tab. It survives reloads, expires after 30 minutes without recorded activity and is cleared on withdrawal. It is not a named person or a cross-device identity.</p>
    <p className="muted">Detailed events are retained for 90 days{report?` (available from ${report.retained_from})`:''}. Dates, page-language, device and country filters apply to both the list and timeline. A filtered or historical session may be incomplete.</p>
    <label className="journey-filter">Connection country<select aria-label="Session country" value={country} onChange={e=>setCountry(e.target.value)}><option value="">All recorded countries</option>{countries.map(r=><option key={r.country} value={r.country}>{countryName(r.country)}</option>)}</select></label>
    {error&&<p role="alert" className="error-banner">{error}</p>}{loading&&<p role="status" className="empty">Loading sessions…</p>}
    {report&&<><p className="muted">{num(report.total)} matching sessions · newest activity first</p><div className="session-grid">{report.sessions.map(r=><button className={`session-card ${selected?.visit===r.visit?'selected':''}`} key={r.visit} aria-pressed={selected?.visit===r.visit} onClick={()=>{setSelected(r);setEventOffset(0);}}><div className="journey-heading"><strong>Session {r.visit.slice(0,8)}</strong><ChevronDown size={16}/></div><span>{time(r.first_at)}</span><span>{r.countries.map(countryName).join(', ')} · {r.devices.join(', ')} · {r.languages.map(s=>s.toUpperCase()).join(', ')}</span><div className="session-numbers"><b>{r.views}<small>views</small></b><b>{r.calculations}<small>calculations</small></b><b>{r.calls}<small>call clicks</small></b></div><span>{r.linked_calls} calls after estimate · {r.errors} errors</span><span>{r.timing_samples?`${duration(r.visible_ms)} visible · ${duration(r.active_ms)} active`:'Timing not recorded'}</span><small>{duration(r.span_seconds*1000)} between first and last recorded events{!r.recorded_start?' · start not recorded':''}</small></button>)}</div>{!report.sessions.length&&<p className="empty">No consented sessions match these filters. Anonymous views still appear in aggregate reports.</p>}<div className="journey-pagination"><button disabled={offset===0} onClick={()=>setOffset(Math.max(0,offset-50))}>Previous 50</button><span>{report.total?offset+1:0}–{Math.min(offset+50,report.total)} of {num(report.total)}</span><button disabled={offset+50>=report.total} onClick={()=>setOffset(offset+50)}>Next 50</button></div></>}
  </section>{selected&&<section className="journey-panel"><div className="journey-heading"><div><span className="eyebrow">CHRONOLOGICAL ACTIVITY · BERLIN TIME</span><h2>Session {selected.visit.slice(0,8)}</h2></div><button className="button" disabled={!detail} onClick={()=>download(`session-${selected.visit.slice(0,8)}-page-${eventOffset/200+1}.csv`,[["Time","Action","Page","Country","Placement","Target","Origin","Destination","Outcome","Calculation reference","Call delay seconds","Visible ms","Active ms"],...(detail?.events||[]).map(e=>[e.created_at,eventLabels[e.name]||e.name,e.path,e.country,e.source,e.target,analyticsPlaceLabel(e.origin||'unknown'),analyticsPlaceLabel(e.destination||'unknown'),e.outcome,e.calculation_id,e.call_delay_seconds,e.visible_ms,e.active_ms])])}><Download size={16}/> Export this page</button></div><p className="muted">Visible time is sampled while the page is in the foreground. Active time is the portion within 60 seconds of an interaction. Neither is a precise attention measurement. Session span includes gaps and background time.</p>{detailError&&<p role="alert" className="error-banner">{detailError}</p>}{!detail&&!detailError&&<p role="status">Loading timeline…</p>}{detail&&<><p className="muted">{num(detail.events_total)} recorded events · same calculation reference connects attempt, result and eligible call click. Simultaneous events may arrive in a different order.</p><ol className="session-timeline">{detail.events.map((e,i)=><TimelineEvent key={e.id} event={e} previous={detail.events[i-1]}/>)}</ol><div className="journey-pagination"><button disabled={eventOffset===0} onClick={()=>setEventOffset(Math.max(0,eventOffset-200))}>Previous 200</button><span>{detail.events_total?eventOffset+1:0}–{Math.min(eventOffset+200,detail.events_total)} of {num(detail.events_total)}</span><button disabled={eventOffset+200>=detail.events_total} onClick={()=>setEventOffset(eventOffset+200)}>Next 200</button></div></>}</section>}</>;
}
