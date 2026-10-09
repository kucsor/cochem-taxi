"use client";
import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { analyticsPlaceLabel } from "@/lib/analytics-destinations";
import { csvCell, type Insights, type RouteRow } from "@/lib/analytics-dashboard";
const label = analyticsPlaceLabel;
const title = (r: {origin: string; destination: string}) => `${label(r.origin)} → ${label(r.destination)}`;
const complete = (r: RouteRow) => ![r.origin,r.destination].some(x=>x === "unknown" || x === "other");
const number = (n: number | null) => n == null ? "—" : new Intl.NumberFormat("en-GB").format(n);
const money = (n: number | null) => n == null ? "—" : new Intl.NumberFormat("en-GB",{style:"currency",currency:"EUR"}).format(n);
function Box({title: heading,note,children}:{title:string;note?:string;children:React.ReactNode}) {
  return <section className="insight-panel"><header><h2>{heading}</h2>{note && <p>{note}</p>}</header>{children}</section>;
}
export function RoutesPanel({stats,from,to}:{stats:Insights;from:string;to:string}) {
  const report = stats.routeReport;
  const [query,setQuery] = useState("");
  const [sort,setSort] = useState<"calculations"|"successes"|"call_clicks">("calculations");
  const [period,setPeriod] = useState<"auto"|"day"|"week"|"month">("auto");
  const [includeIncomplete,setIncludeIncomplete] = useState(false);
  const routes = report?.routes || [];
  const visible = routes.filter(r=>(includeIncomplete || complete(r)) && title(r).toLowerCase().includes(query.toLowerCase())).sort((a,b)=>b[sort]-a[sort]);
  const tracked = routes.reduce((n,r)=>n+r.calculations,0);
  const identified = routes.filter(complete).reduce((n,r)=>n+r.calculations,0);
  const effectiveFrom = report?.first_available && report.first_available > from ? report.first_available : from;
  const span = (Date.parse(to)-Date.parse(effectiveFrom))/86400000;
  const bucket = period === "auto" ? span <= 90 ? "day" : span <= 365 ? "week" : "month" : period;
  const chart = useMemo(()=>{
    const top = (report?.routes || []).filter(complete).filter(r=>r.calculations>0).sort((a,b)=>b.calculations-a.calculations).slice(0,5);
    const key = (day:string) => {
      if (bucket === "month") return day.slice(0,7);
      if (bucket === "week") {const dt=new Date(day+'T12:00:00Z');dt.setUTCDate(dt.getUTCDate()-((dt.getUTCDay()+6)%7));return dt.toISOString().slice(0,10);}
      return day;
    };
    const map=new Map<string,Record<string,string|number>>();
    if(top.length) for(let t=Date.parse(effectiveFrom+'T12:00:00Z');t<=Date.parse(to+'T12:00:00Z');t+=86400000) {
      const k=key(new Date(t).toISOString().slice(0,10));
      if(!map.has(k)) map.set(k,{date:k,...Object.fromEntries(top.map((_,i)=>['r'+i,0]))});
    }
    for(const row of report?.daily || []) {
      const i=top.findIndex(r=>r.origin===row.origin&&r.destination===row.destination);
      const point=map.get(key(row.day));if(i>=0&&point) point['r'+i]=Number(point['r'+i]||0)+row.calculations;
    }
    return {top,rows:[...map.values()]};
  },[report,bucket,effectiveFrom,to]);
  function exportRoutes() {
    const rows: unknown[][] = [['Origin','Destination','Calculations','Successful estimates','Errors','Call clicks after estimate','Consented tab sessions','Sessions with call click','Calculations with consent','Average EUR','Average km','First day','Last day']];
    for(const r of visible) rows.push([label(r.origin),label(r.destination),r.calculations,r.successes,r.errors,r.call_clicks,r.sessions,r.call_sessions,r.consented_calculations,r.average_fare,r.average_distance,r.first_day,r.last_day]);
    const url=URL.createObjectURL(new Blob(['\ufeff'+rows.map(r=>r.map(csvCell).join(',')).join('\n')],{type:'text/csv;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download=`cochem-routes-${from}-${to}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  return <div className="routes-workspace">
    <Box title="Routes & Destinations" note="From = pickup place. To = destination. Calculations are requests for an estimate, not bookings or individual people.">
      <div className="route-summary">
        <div><span>All calculations</span><strong>{number(stats.calculations)}</strong></div>
        <div><span>Identified routes · new tracking</span><strong>{number(identified)}</strong></div>
        <div><span>Incomplete routes · new tracking</span><strong>{number(tracked-identified)}</strong></div>
        <div><span>Historical calculations</span><strong>{number(report?.legacy_calculations ?? stats.calculations)}</strong></div>
      </div>
      <p className="muted">Activity available since {stats.first_available || 'no recorded activity'}. Structured route tracking: {report?.first_available || 'waiting for the first new event'}.</p>
      <div className="notice"><p><strong>Data coverage: {stats.calculations ? Math.round(identified/stats.calculations*100) : 0}% of calculations have an identified route.</strong> {number(report?.missing_destination ?? stats.destinations.find(d=>d.destination==='unknown')?.calculations ?? 0)} calculations have no recorded destination (included in the totals above). Historical categories may be incorrect, including confusion between Cochem-Zell district and Zell. They are excluded from the route ranking.</p></div>
      {!report && <p className="empty">The route report is not available from the backend yet. Existing statistics are preserved below.</p>}
    </Box>
    <Box title="Most calculated routes" note="Expand a route for session coverage, call clicks, passenger groups and tariffs.">
      <div className="destination-tools"><label className="search-box"><input aria-label="Search routes" placeholder="Search pickup or destination…" value={query} onChange={e=>setQuery(e.target.value)}/></label>
        <label className="sort-label">Rank by <select aria-label="Rank routes by" value={sort} onChange={e=>setSort(e.target.value as typeof sort)}><option value="calculations">Calculations</option><option value="successes">Successful estimates</option><option value="call_clicks">Call clicks after estimate</option></select></label>
        <button className="secondary" onClick={exportRoutes} disabled={!visible.length}>Export routes CSV</button>
      </div>
      <p className="muted">“Cochem → Zell” means the recorded pickup category was Cochem and the destination category was Zell. Repeated calculations can come from the same person. These are expressions of interest, not confirmed journeys or bookings.</p>
      <p className="muted">{number(tracked-identified)} current calculations have an route with unidentified places and are hidden unless you enable the option below.</p>
      <label className="route-checkbox"><input type="checkbox" checked={includeIncomplete} onChange={e=>setIncludeIncomplete(e.target.checked)}/> Include routes with unidentified places</label>
      <div className="destination-list">{visible.map(r=><details className="destination-card route-detail" key={r.origin+'|'+r.destination}>
        <summary><span><small>FROM → TO</small><strong>{title(r)}</strong><span>{complete(r)?'Identified places': 'Incomplete route — one or both places not identified'}</span></span><b>{number(r.calculations)}<small>calculations · details ↓</small></b></summary>
        <div className="destination-metrics">{[['Successful estimates',number(r.successes)],['Errors',number(r.errors)],['Avg. estimate',money(r.average_fare)],['Avg. distance',r.average_distance == null?'—':number(r.average_distance)+' km'],['Call clicks after estimate',number(r.call_clicks)],['Consented tab sessions',number(r.sessions)],['Sessions with call click',number(r.call_sessions)]].map(([k,v])=><div key={k}><span>{k}</span><strong>{v}</strong></div>)}</div>
        <p className="muted">First recorded: {r.first_day}. Last activity: {r.last_day}. Average price and distance include successful estimates only. Estimates are not revenue and cannot predict earnings from website visits.</p>
        <p className="muted">{r.consented_calculations == null ? 'Session counts are unavailable for ranges starting more than 89 days ago. Calculation and call-click totals remain available for two years.' : `${r.consented_calculations} of ${r.calculations} calculations carried consent for session measurement. A session is one consenting browser tab, not a unique person. Sessions with a call click may have calculated before this date range.`}</p>
        <div className="route-breakdown">{r.breakdown.map((b,i)=><div key={i}><span>{b.passengers==='unknown'?'Passengers not recorded':b.passengers+' passengers'} · {b.tariff==='unknown'?'Tariff not recorded':b.tariff==='night'?'Night tariff':'Day tariff'}</span><strong>{number(b.calculations)} calculations</strong></div>)}</div>
      </details>)}</div>
      {!visible.length && <p className="empty">No routes match this selection. Try clearing the search or including incomplete routes. Historical activity is kept separately below.</p>}
      <p className="muted">Call attribution requires session consent and a click within 30 minutes after the latest successful estimate in that tab. Editing a place or starting another calculation clears it. A click does not confirm a connected call or a completed ride.</p>
    </Box>
    <Box title="Route demand over time" note="Calculation starts for the five leading identified routes. Gaps after tracking began are shown as zero.">
      <label className="sort-label">Group by <select aria-label="Route chart grouping" value={period} onChange={e=>setPeriod(e.target.value as typeof period)}><option value="auto">Automatic</option><option value="day">Day</option><option value="week">Week</option><option value="month">Month</option></select></label>
      <p className="muted">Showing {bucket === 'day'?'daily':bucket==='week'?'weekly':'monthly'} totals. Weeks start Monday; dates use Berlin time.</p>
      {chart.top.length ? <div className="chart"><ResponsiveContainer width="100%" height="100%"><LineChart data={chart.rows}><CartesianGrid stroke="#253343" vertical={false}/><XAxis dataKey="date" tick={{fontSize:10}} minTickGap={24}/><YAxis allowDecimals={false} width={30}/><Tooltip contentStyle={{background:'#152131',borderColor:'#34445a',borderRadius:12}}/><Legend wrapperStyle={{fontSize:11}}/>{chart.top.map((r,i)=><Line key={title(r)} dataKey={'r'+i} name={title(r)} stroke={['#f4c66a','#63d7b4','#8eaafa','#f28c98','#bf99ef'][i]} dot={{r:3}} strokeWidth={2} isAnimationActive={false}/>)}</LineChart></ResponsiveContainer></div>:<p className="empty">A trend will appear after the first identified route calculation. No historical route is inferred.</p>}
    </Box>
    <Box title="Destination interest before calculation" note="Typing signals and autocomplete selections are independent event counts. Typing is categorized only when it matches a known category; other typing signals stay unclassified. Selected municipalities can be recorded beyond the former list.">
      <div className="route-breakdown">{(report?.interests||[]).map(d=><div key={d.destination}><strong>{label(d.destination)}</strong><span>{number(d.searches)} typing signals · {number(d.selections)} selections</span></div>)}</div>
      {!report?.interests?.length && <p className="empty">No new destination interest recorded for these filters.</p>}
    </Box>
    <Box title="Historical & unclassified activity" note="These categories came from the previous text classifier. The pickup was not recorded. They cannot establish where someone travelled from or to.">
      <div className="route-breakdown">{(report?.legacy_destinations || stats.destinations).filter(d=>d.calculations>0).map(d=><div key={d.destination}><span>{label(d.destination)} · {d.destination==='unknown'?'missing destination':'unverified historical category'}</span><strong>{number(d.calculations)} calculations</strong></div>)}</div>
      {report?.legacy_calculations === 0 && <p className="empty">No historical calculations in this selection.</p>}
    </Box>
    <p className="muted">Municipalities are identified from structured map results, including addresses entered without selecting a suggestion. There is no manually maintained town list for new calculations. Known airports and landmarks keep their names. Exact addresses, search text and GPS coordinates are never included in analytics. If the map cannot identify a municipality, it remains “Locality not identified”. “Outside the former list” applies only to historical records.</p>
  </div>;
}
