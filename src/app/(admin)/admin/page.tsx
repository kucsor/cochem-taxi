"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Calculator,
  CheckCircle2,
  ChevronRight,
  Download,
  Eye,
  Globe2,
  LayoutDashboard,
  LogOut,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Users,
  AlertTriangle,
} from "lucide-react";
import {
  destinationLabels,
  type Destination,
} from "@/lib/analytics-destinations";
import {
  berlinToday,
  daysAgo,
  groupDays,
  csvCell,
  eventLabels,
  type Insights,
  type Row,
  type DestinationRow,
} from "@/lib/analytics-dashboard";
import "./dashboard.css";
const tabs = [
  ["overview", "Overview", LayoutDashboard],
  ["destinations", "Destinations", MapPin],
  ["features", "Features", Activity],
  ["audience", "Audience", Users],
  ["quality", "Reliability", ShieldCheck],
] as const;
type Tab = (typeof tabs)[number][0];
const fmt = (n: number | null | undefined) =>
  n == null ? "—" : n.toLocaleString("en-GB", { maximumFractionDigits: 1 });
const money = (n: number | null | undefined) =>
  n == null
    ? "—"
    : new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "EUR",
      }).format(n);
const dest = (s: string) => destinationLabels[s as Destination] || s;
const label = (s: string) =>
  eventLabels[s] ||
  (
    {
      unknown: "Not recorded",
      mobile: "Mobile",
      desktop: "Desktop",
      tablet: "Tablet",
      de: "German",
      en: "English",
      nl: "Dutch",
      day: "Day (06–22)",
      night: "Night (22–06)",
    } as Record<string, string>
  )[s] ||
  s ||
  "Direct / unknown";
const percent = (n: number, d: number) =>
  d ? `${((100 * n) / d).toFixed(1)}%` : "—";
const tooltip = {
  contentStyle: {
    background: "#162232",
    border: "1px solid #344152",
    borderRadius: 12,
    color: "#fff",
  },
  labelStyle: { color: "#e2e8f0" },
};
function Panel({
  title,
  note,
  children,
  className = "",
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`insight-panel ${className}`}>
      <header>
        <h2>{title}</h2>
        {note && <p>{note}</p>}
      </header>
      {children}
    </section>
  );
}
function Breakdown({
  title,
  rows,
  note,
}: {
  title: string;
  rows: Row[];
  note?: string;
}) {
  const [query, setQuery] = useState("");
  const shown = rows.filter((r) =>
    label(r.label).toLowerCase().includes(query.toLowerCase()),
  );
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <Panel title={title} note={note}>
      {rows.length > 8 && (
        <label className="search-box">
          <Search size={16} />
          <input
            aria-label={`Search ${title}`}
            placeholder="Filter results…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      )}
      <div className="breakdown-list">
        {shown.length ? (
          shown.map((r) => (
            <div key={r.label} className="breakdown-row">
              <div>
                <span>{label(r.label)}</span>
                <strong>{fmt(r.count)}</strong>
              </div>
              <div className="meter">
                <i style={{ width: `${(100 * r.count) / max}%` }} />
              </div>
            </div>
          ))
        ) : (
          <p className="empty">No matching activity in this period.</p>
        )}
      </div>
    </Panel>
  );
}
function download(name: string, body: string, type = "text/csv") {
  const url = URL.createObjectURL(new Blob([body], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function Dashboard() {
  const [auth, setAuth] = useState<boolean | null>(null),
    [username, setUsername] = useState("kuxor"),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [stats, setStats] = useState<Insights | null>(null);
  const [tab, setTab] = useState<Tab>("overview"),
    [from, setFrom] = useState(() => daysAgo(29)),
    [to, setTo] = useState(berlinToday),
    [language, setLanguage] = useState(""),
    [device, setDevice] = useState(""),
    [environment, setEnvironment] = useState("production"),
    [period, setPeriod] = useState<"day" | "week" | "month">("day"),
    [auto, setAuto] = useState(false),
    [filters, setFilters] = useState(false),
    [query, setQuery] = useState(""),
    [sort, setSort] = useState<
      "calculations" | "searches" | "successes" | "errors"
    >("calculations");
  const request = useRef<AbortController | null>(null),
    serial = useRef(0);
  const load = useCallback(
    async (clear = false) => {
      request.current?.abort();
      const c = new AbortController();
      request.current = c;
      const n = ++serial.current;
      setBusy(true);
      setError("");
      if (clear) setStats(null);
      try {
        const r = await fetch(
          `/api/admin/insights?${new URLSearchParams({ from, to, language, device, environment })}`,
          { cache: "no-store", signal: c.signal },
        );
        if (r.status === 401) {
          setAuth(false);
          setStats(null);
          return;
        }
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Unable to load statistics.");
        if (n === serial.current) {
          setStats(data);
          setAuth(true);
        }
      } catch (e) {
        if (!c.signal.aborted) {
          setError((e as Error).message);
          setAuth((a) => (a === null ? false : a));
        }
      } finally {
        if (n === serial.current && !c.signal.aborted) setBusy(false);
      }
    },
    [from, to, language, device, environment],
  );
  useEffect(() => {
    void load(true);
    return () => request.current?.abort();
  }, [load]);
  useEffect(() => {
    if (!auto || !auth) return;
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, 60000);
    return () => clearInterval(timer);
  }, [auto, auth, load]);
  const days = useMemo(
    () => groupDays(stats?.daily || [], period),
    [stats, period],
  );
  const destinations = useMemo(
    () =>
      (stats?.destinations || [])
        .filter((d) =>
          dest(d.destination).toLowerCase().includes(query.toLowerCase()),
        )
        .sort((a, b) => b[sort] - a[sort]),
    [stats, query, sort],
  );
  const trends = useMemo(() => {
    const top = (stats?.destinations || [])
      .filter((d) => d.destination !== "unknown")
      .slice(0, 5)
      .map((d) => d.destination);
    const map = new Map<string, Record<string, string | number>>();
    for (const r of stats?.destinationTrends || []) {
      const row =
        map.get(r.month) ||
        Object.fromEntries([["month", r.month], ...top.map((d) => [d, 0])]);
      if (top.includes(r.destination)) row[r.destination] = r.calculations;
      map.set(r.month, row);
    }
    return { top, rows: [...map.values()] };
  }, [stats]);
  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Sign-in failed.");
      setPassword("");
      setAuth(true);
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    request.current?.abort();
    serial.current++;
    const r = await fetch("/api/admin/logout", { method: "POST" });
    if (r.ok) {
      setAuth(false);
      setStats(null);
      setPassword("");
      setAuto(false);
    } else setError("Sign-out failed. Please try again.");
  }
  function csv() {
    if (!stats) return;
    const records: unknown[][] = [
      [
        "Section",
        "Category",
        "Date",
        "Count",
        "Successes",
        "Errors",
        "Average estimated fare EUR",
        "Average distance km",
      ],
    ];
    for (const d of stats.daily)
      records.push(
        ["Daily", "Views", d.day, d.views],
        ["Daily", "Call clicks", d.day, d.calls],
        ["Daily", "Calculations", d.day, d.calculations, d.successes, d.errors],
      );
    for (const [k, rows] of Object.entries(stats.groups))
      for (const r of rows) records.push([k, label(r.label), "", r.count]);
    for (const d of stats.destinations)
      records.push(
        [
          "Destinations",
          dest(d.destination),
          "",
          d.calculations,
          d.successes,
          d.errors,
          d.average_fare,
          d.average_distance,
        ],
        ["Destination searches", dest(d.destination), "", d.searches],
        ["Destination selections", dest(d.destination), "", d.selections],
      );
    for (const t of stats.destinationTrends)
      records.push([
        "Destination monthly",
        dest(t.destination),
        t.month,
        t.calculations,
      ]);
    download(
      `cochem-insights-${environment}-${from}-${to}.csv`,
      "\ufeff" + records.map((r) => r.map(csvCell).join(",")).join("\n"),
    );
  }
  const group = (key: string) => stats?.groups[key] || [];
  const delta = (key: "views" | "calls" | "calculations") => {
    if (!stats) return "—";
    const old = stats.previous[key];
    return old
      ? `${stats[key] >= old ? "+" : ""}${(((stats[key] - old) / old) * 100).toFixed(1)}% vs previous period`
      : stats[key]
        ? "New activity · no previous baseline"
        : "No change";
  };
  if (auth !== true)
    return (
      <main className="insights login-screen">
        <div className="login-decoration" aria-hidden="true" />
        <form onSubmit={login} className="login-card">
          <div className="brand-mark">
            <BarChart3 />
          </div>
          <p className="eyebrow">COCHEM TAXI / PRIVATE ANALYTICS</p>
          <h1>
            Your next
            <br />
            <em>better decision.</em>
          </h1>
          <p className="muted">
            A clear view of the journeys people are looking for.
          </p>
          <label>
            Username
            <input
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error && (
            <p role="alert" className="error-banner">
              {error}
            </p>
          )}
          <button className="primary" disabled={busy || auth === null}>
            {busy || auth === null ? "Checking access…" : "Open dashboard"}
            <ArrowUpRight size={18} />
          </button>
          <p className="secure">
            <ShieldCheck size={14} /> Private access · Protected session
          </p>
        </form>
      </main>
    );
  return (
    <main className="insights dashboard-shell">
      <aside className="sidebar">
        <a href="/admin" className="brand">
          <span className="brand-mark">
            <BarChart3 size={22} />
          </span>
          <span>
            COCHEM<span className="brand-sub">INSIGHTS</span>
          </span>
        </a>
        <p className="eyebrow side-label">WORKSPACE</p>
        <nav aria-label="Analytics sections">
          {tabs.map(([id, title, Icon]) => (
            <button
              key={id}
              className={tab === id ? "active" : ""}
              aria-current={tab === id ? "page" : undefined}
              onClick={() => setTab(id)}
            >
              <Icon size={19} />
              <span>{title}</span>
              {tab === id && <ChevronRight size={15} />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <span className="status-dot" /> Private analytics
          <p>
            Understand demand.
            <br />
            Improve the experience.
          </p>
          <a href="/de" target="_blank" rel="noreferrer">
            Open website <ArrowUpRight size={16} />
          </a>
          <button onClick={logout}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>
      <div className="dashboard-main">
        <header className="topbar">
          <div>
            <p className="eyebrow">
              COCHEM TAXI <span>/</span> ANALYTICS
            </p>
            <h1>
              {tabs.find((t) => t[0] === tab)?.[1]}
              <span className="live-pill">
                <span className="status-dot" />
                {environment === "production" ? "Live site" : environment}
              </span>
            </h1>
          </div>
          <div className="top-actions">
            <button
              className="icon-button"
              aria-label="Refresh statistics"
              onClick={() => void load()}
              disabled={busy}
            >
              <RefreshCw size={18} className={busy ? "spin" : ""} />
            </button>
            <button
              className="secondary export"
              onClick={csv}
              disabled={!stats}
            >
              <Download size={16} />
              <span>Export CSV</span>
            </button>
            <button
              className="icon-button mobile-signout"
              aria-label="Sign out"
              onClick={logout}
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <section className="filter-bar" aria-label="Report filters">
          <div className="presets">
            {[
              [0, "Today"],
              [6, "7 days"],
              [29, "30 days"],
              [89, "90 days"],
              [364, "1 year"],
              [729, "2 years"],
            ].map(([n, title]) => (
              <button
                key={n}
                className={
                  from === daysAgo(Number(n)) && to === berlinToday()
                    ? "selected"
                    : ""
                }
                onClick={() => {
                  setFrom(daysAgo(Number(n)));
                  setTo(berlinToday());
                }}
              >
                {title}
              </button>
            ))}
          </div>
          <button
            className="secondary"
            onClick={() => setFilters(!filters)}
            aria-expanded={filters}
          >
            <SlidersHorizontal size={15} /> Filters
            {(language || device || environment !== "production") && (
              <span className="status-dot" />
            )}
          </button>
          <div className={`filters ${filters ? "expanded" : ""}`}>
            <label>
              From
              <input
                type="date"
                value={from}
                max={to}
                onChange={(e) => setFrom(e.target.value)}
              />
            </label>
            <label>
              To
              <input
                type="date"
                value={to}
                min={from}
                max={berlinToday()}
                onChange={(e) => setTo(e.target.value)}
              />
            </label>
            <label>
              Language
              <select
                aria-label="Language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="">All languages</option>
                <option value="de">German</option>
                <option value="en">English</option>
                <option value="nl">Dutch</option>
              </select>
            </label>
            <label>
              Device
              <select
                aria-label="Device"
                value={device}
                onChange={(e) => setDevice(e.target.value)}
              >
                <option value="">All devices</option>
                <option value="mobile">Mobile</option>
                <option value="tablet">Tablet</option>
                <option value="desktop">Desktop</option>
              </select>
            </label>
            <label>
              Environment
              <select
                aria-label="Environment"
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
              >
                <option value="production">Live site</option>
                <option value="preview">Preview</option>
                <option value="development">Development</option>
              </select>
            </label>
            <button
              className="text-button"
              onClick={() => {
                setLanguage("");
                setDevice("");
                setEnvironment("production");
                setFrom(daysAgo(29));
                setTo(berlinToday());
              }}
            >
              Reset filters
            </button>
          </div>
        </section>
        <div className="report-status">
          <span>
            {from} — {to} · Berlin time
          </span>
          <label>
            <input
              type="checkbox"
              checked={auto}
              onChange={(e) => setAuto(e.target.checked)}
            />{" "}
            Auto-refresh every 60s
          </label>
        </div>
        {error && (
          <div role="alert" className="error-banner">
            <AlertTriangle size={18} />
            {error} {stats && "Previously loaded data is shown."}
            <button onClick={() => void load()}>Retry</button>
          </div>
        )}
        {!stats ? (
          <div role="status" className="loading-grid">
            {[1, 2, 3, 4].map((n) => (
              <div className="skeleton" key={n} />
            ))}
            <p>
              {error
                ? "Report unavailable. Please retry."
                : "Preparing your report…"}
            </p>
          </div>
        ) : (
          <div key={tab} className="tab-content" aria-busy={busy}>
            {stats.total === 0 && (
              <div className="notice">
                <Activity size={20} />
                <div>
                  <strong>No activity in this selection</strong>
                  <p>
                    Check the dates and environment, or visit the public site.
                    Browser privacy settings can suppress collection. Historical
                    destination data cannot be reconstructed.
                  </p>
                </div>
              </div>
            )}
            {tab === "overview" && (
              <>
                <section className="hero-insight">
                  <div>
                    <p className="eyebrow">
                      <Sparkles size={14} /> DEMAND AT A GLANCE
                    </p>
                    <h2>
                      Every click tells
                      <br />
                      <em>part of the journey.</em>
                    </h2>
                    <p>
                      {stats.destinations.find(
                        (d) =>
                          d.destination !== "unknown" && d.calculations > 0,
                      )
                        ? `${dest(stats.destinations.find((d) => d.destination !== "unknown" && d.calculations > 0)!.destination)} leads recorded calculation demand in this period.`
                        : "Your destination insights will grow as people use the calculator."}
                    </p>
                  </div>
                  <div className="hero-number">
                    <span>Successful estimates</span>
                    <strong>
                      {percent(stats.successes, stats.successes + stats.errors)}
                    </strong>
                    <small>Of completed calculation responses</small>
                  </div>
                </section>
                <div className="kpi-grid">
                  {[
                    {
                      title: "Page views",
                      n: stats.views,
                      Icon: Eye,
                      change: delta("views"),
                    },
                    {
                      title: "Call button clicks",
                      n: stats.calls,
                      Icon: Phone,
                      change: delta("calls"),
                    },
                    {
                      title: "Calculations started",
                      n: stats.calculations,
                      Icon: Calculator,
                      change: delta("calculations"),
                    },
                    {
                      title: "Total interactions",
                      n: stats.total - stats.views,
                      Icon: Activity,
                      change: "Events, not unique people",
                    },
                  ].map((k) => (
                    <article className="kpi" key={k.title}>
                      <span className="kpi-icon">
                        <k.Icon size={20} />
                      </span>
                      <p>{k.title}</p>
                      <strong>{fmt(k.n)}</strong>
                      <small>{k.change}</small>
                    </article>
                  ))}
                </div>
                <Panel
                  title="Traffic & intent"
                  note="Compare daily activity or reveal weekly and monthly patterns."
                >
                  <div className="chart-toolbar">
                    <div className="segmented">
                      {(["day", "week", "month"] as const).map((p) => (
                        <button
                          key={p}
                          className={period === p ? "selected" : ""}
                          onClick={() => setPeriod(p)}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                    <span>{days.length} periods</span>
                  </div>
                  <div className="chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={days}>
                        <defs>
                          <linearGradient
                            id="viewsFill"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="#f4c66a"
                              stopOpacity={0.28}
                            />
                            <stop
                              offset="100%"
                              stopColor="#f4c66a"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#253343" vertical={false} />
                        <XAxis
                          dataKey="day"
                          tick={{ fontSize: 10 }}
                          minTickGap={35}
                        />
                        <YAxis
                          width={38}
                          allowDecimals={false}
                          tick={{ fontSize: 10 }}
                        />
                        <Tooltip {...tooltip} />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="views"
                          name="Views"
                          stroke="#f4c66a"
                          fill="url(#viewsFill)"
                          isAnimationActive={false}
                        />
                        <Area
                          type="monotone"
                          dataKey="calculations"
                          name="Calculations"
                          stroke="#63d7b4"
                          fill="transparent"
                          isAnimationActive={false}
                        />
                        <Area
                          type="monotone"
                          dataKey="calls"
                          name="Call clicks"
                          stroke="#8eaafa"
                          fill="transparent"
                          isAnimationActive={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Panel>
                <div className="two-grid">
                  <Panel
                    title="Activity ratios"
                    note="Independent event counts, not a tracked conversion funnel."
                  >
                    {[
                      [
                        "Calculation starts / views",
                        stats.calculations,
                        stats.views,
                      ],
                      ["Call clicks / views", stats.calls, stats.views],
                      [
                        "Errors / completed responses",
                        stats.errors,
                        stats.successes + stats.errors,
                      ],
                    ].map(([name, n, d]) => (
                      <div key={String(name)} className="ratio">
                        <span>{name}</span>
                        <strong>{percent(Number(n), Number(d))}</strong>
                      </div>
                    ))}
                    <p className="footnote">
                      Repeat actions can make a ratio exceed 100%. A phone click
                      is not a completed call or booking.
                    </p>
                  </Panel>
                  <Panel
                    title="The typical estimate"
                    note="Based on recorded successful calculations."
                  >
                    <div className="big-stat">
                      {money(stats.average_fare)}
                      <span>Average estimated fare · not revenue</span>
                    </div>
                    <div className="ratio">
                      <span>Measured engagement</span>
                      <strong>{fmt(stats.average_engagement)}s</strong>
                    </div>
                    <p className="footnote">
                      Engagement is sampled when a page becomes hidden. It does
                      not cover every visit.
                    </p>
                  </Panel>
                </div>
                <div className="two-grid">
                  <Breakdown title="Most viewed pages" rows={group("pages")} />
                  <Breakdown
                    title="Where call clicks happen"
                    rows={group("callSources")}
                  />
                </div>
              </>
            )}
            {tab === "destinations" && (
              <>
                <Panel
                  title="Where people want to go"
                  note="Searches count category changes after typing pauses. Selections count autocomplete choices. Neither represents a unique person."
                >
                  <div className="destination-tools">
                    <label className="search-box">
                      <Search size={17} />
                      <input
                        aria-label="Search destinations"
                        placeholder="Find a destination…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </label>
                    <label className="sort-label">
                      Rank by
                      <select
                        aria-label="Rank destinations by"
                value={sort}
                        onChange={(e) => setSort(e.target.value as typeof sort)}
                      >
                        <option value="calculations">Calculations</option>
                        <option value="searches">Searches</option>
                        <option value="successes">Successful estimates</option>
                        <option value="errors">Errors</option>
                      </select>
                    </label>
                  </div>
                  <div className="destination-list">
                    {destinations.map((d, i) => (
                      <article className="destination-card" key={d.destination}>
                        <div className="destination-heading">
                          <span className="rank">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <div>
                            <h3>{dest(d.destination)}</h3>
                            <span>
                              {d.destination.startsWith("airport-")
                                ? "Airport transfer"
                                : d.destination === "unknown"
                                  ? "Older or unclassified activity"
                                  : "Destination category"}
                            </span>
                          </div>
                          <strong>
                            {fmt(d[sort])}
                            <small>{sort}</small>
                          </strong>
                        </div>
                        <div className="destination-metrics">
                          {[
                            ["Searches", d.searches],
                            ["Selected", d.selections],
                            ["Calculated", d.calculations],
                            ["Successful", d.successes],
                            ["Errors", d.errors],
                            ["Avg. estimate", money(d.average_fare)],
                            [
                              "Avg. distance",
                              d.average_distance == null
                                ? "—"
                                : `${fmt(d.average_distance)} km`,
                            ],
                          ].map(([k, v]) => (
                            <div key={String(k)}>
                              <span>{k}</span>
                              <strong>
                                {typeof v === "number" ? fmt(v) : v}
                              </strong>
                            </div>
                          ))}
                        </div>
                      </article>
                    ))}
                    {!destinations.length && (
                      <p className="empty">
                        No destination activity matches these filters.
                      </p>
                    )}
                  </div>
                </Panel>
                <Panel
                  title="Destination demand over time"
                  note="Monthly calculation starts for the five leading recorded categories."
                >
                  <div className="chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trends.rows}>
                        <CartesianGrid stroke="#253343" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis width={36} allowDecimals={false} />
                        <Tooltip {...tooltip} />
                        <Legend />
                        {trends.top.map((d, i) => (
                          <Line
                            key={d}
                            dataKey={d}
                            name={dest(d)}
                            stroke={
                              [
                                "#f4c66a",
                                "#63d7b4",
                                "#8eaafa",
                                "#f28c98",
                                "#bf99ef",
                              ][i]
                            }
                            strokeWidth={2}
                            isAnimationActive={false}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Panel>
                <div className="notice">
                  <ShieldCheck size={20} />
                  <p>
                    Only predefined airports, towns and landmarks are recorded.
                    Exact addresses, search text and GPS coordinates never enter
                    these analytics. “Other destination” groups anything outside
                    the list.
                  </p>
                </div>
              </>
            )}
            {tab === "features" && (
              <>
                <div className="two-grid">
                  <Breakdown
                    title="Every tracked feature"
                    rows={Object.keys(eventLabels)
                      .map((k) => ({
                        label: k,
                        count:
                          group("events").find((r) => r.label === k)?.count ||
                          0,
                      }))
                      .sort((a, b) => b.count - a.count)}
                    note="Zero means no recorded events, not necessarily no use."
                  />
                  <Breakdown
                    title="Actions by page"
                    rows={group("featurePages")}
                    note="Call clicks, calculation starts and errors by page."
                  />
                  <Breakdown
                    title="Passenger groups"
                    rows={group("passengers")}
                    note="Selected at calculation submission."
                  />
                  <Breakdown
                    title="Requested pickup period"
                    rows={group("tariffs")}
                    note="Day / night selection, not the visit time."
                  />
                  <Breakdown
                    title="Scroll depth"
                    rows={group("depths").map((r) => ({
                      ...r,
                      label: r.label + "% reached",
                    }))}
                    note="Milestones overlap; a full scroll can record all four."
                  />
                  <Breakdown
                    title="Call placements"
                    rows={group("callSources")}
                  />
                </div>
                <Panel
                  title="Recent recorded activity"
                  note="Latest 30 events in this selection; available within the 90-day raw-data window."
                >
                  <div className="activity-list">
                    {stats.recent.map((r, i) => (
                      <div
                        className="activity-row"
                        key={`${r.created_at}-${i}`}
                      >
                        <Activity size={16} />
                        <div>
                          <strong>{label(r.name)}</strong>
                          <span>
                            {r.path} · {label(r.device)} ·{" "}
                            {r.language.toUpperCase()}
                            {r.destination !== "unknown" &&
                              ` · ${dest(r.destination)}`}
                          </span>
                        </div>
                        <time>
                          {new Date(r.created_at).toLocaleString("en-GB", {
                            timeZone: "Europe/Berlin",
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </time>
                      </div>
                    ))}
                    {!stats.recent.length && (
                      <p className="empty">No recent events available.</p>
                    )}
                  </div>
                </Panel>
              </>
            )}
            {tab === "audience" && (
              <>
                <div className="two-grid">
                  <Breakdown title="Devices" rows={group("devices")} />
                  <Breakdown title="Languages" rows={group("languages")} />
                  <Breakdown
                    title="Referring websites"
                    rows={group("sources")}
                    note="Referrer domain only. No search keywords or personal URLs."
                  />
                  <Breakdown title="Popular pages" rows={group("pages")} />
                </div>
                <Panel
                  title="When your audience is active"
                  note="Page views by local hour in Europe/Berlin, including daylight saving time."
                >
                  <div className="chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={Array.from({ length: 24 }, (_, i) => ({
                          hour: `${String(i).padStart(2, "0")}:00`,
                          views:
                            group("hours").find((r) => Number(r.label) === i)
                              ?.count || 0,
                        }))}
                      >
                        <CartesianGrid stroke="#253343" vertical={false} />
                        <XAxis
                          dataKey="hour"
                          tick={{ fontSize: 10 }}
                          interval={2}
                        />
                        <YAxis width={32} allowDecimals={false} />
                        <Tooltip {...tooltip} />
                        <Bar
                          dataKey="views"
                          name="Views"
                          fill="#63d7b4"
                          radius={[4, 4, 0, 0]}
                          isAnimationActive={false}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Panel>
                <Breakdown
                  title="Day of the week"
                  rows={Array.from({ length: 7 }, (_, i) => ({
                    label: [
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                      "Sunday",
                    ][i],
                    count:
                      group("weekdays").find((r) => Number(r.label) === i + 1)
                        ?.count || 0,
                  }))}
                />
              </>
            )}
            {tab === "quality" && (
              <>
                <div className="kpi-grid">
                  <article className="kpi">
                    <CheckCircle2 />
                    <p>Successful estimates</p>
                    <strong>{fmt(stats.successes)}</strong>
                    <small>Responses recorded by clients</small>
                  </article>
                  <article className="kpi">
                    <AlertTriangle />
                    <p>Calculation errors</p>
                    <strong>{fmt(stats.errors)}</strong>
                    <small>
                      {percent(stats.errors, stats.successes + stats.errors)} of
                      completed responses
                    </small>
                  </article>
                  <article className="kpi">
                    <Activity />
                    <p>Starts without recorded outcome</p>
                    <strong>
                      {fmt(
                        Math.max(
                          0,
                          stats.calculations - stats.successes - stats.errors,
                        ),
                      )}
                    </strong>
                    <small>May include navigation or missing telemetry</small>
                  </article>
                  <article className="kpi">
                    <ShieldCheck />
                    <p>Retention</p>
                    <strong>
                      730<span className="unit"> days</span>
                    </strong>
                    <small>Aggregate totals · raw events 90 days</small>
                  </article>
                </div>
                <div className="two-grid">
                  <Breakdown
                    title="Error categories"
                    rows={group("outcomes")}
                  />
                  <Panel title="Collection health">
                    <div className="ratio">
                      <span>Last event in this selection</span>
                      <strong className="date-value">
                        {stats.last_event
                          ? new Date(stats.last_event).toLocaleString("en-GB", {
                              timeZone: "Europe/Berlin",
                            })
                          : "No events"}
                      </strong>
                    </div>
                    <div className="ratio">
                      <span>First available aggregate</span>
                      <strong>{stats.first_available || "No data yet"}</strong>
                    </div>
                    <p className="footnote">
                      A quiet site and blocked telemetry can both produce zero
                      events. This panel does not certify that every browser is
                      being measured.
                    </p>
                  </Panel>
                </div>
                <Panel title="How to read these numbers">
                  <ul className="methodology">
                    <li>
                      Views and actions count events, not unique visitors. This
                      dashboard does not infer identities or stitch together
                      users.
                    </li>
                    <li>
                      Call clicks do not confirm answered calls, bookings or
                      revenue. Estimated fares are calculator outputs.
                    </li>
                    <li>
                      Destinations are predefined categories inferred in the
                      browser. Other and not-recorded categories remain visible
                      rather than guessed.
                    </li>
                    <li>
                      Raw events expire after 90 days. Aggregates without
                      session identifiers remain for 730 days. Old data already
                      deleted cannot be recovered.
                    </li>
                    <li>
                      Previous-period comparison uses the same number of days
                      immediately before your selected range. Data before
                      collection began or outside retention is unavailable.
                    </li>
                    <li>
                      Ad blockers, DNT/GPC, offline use and abandoned pages can
                      reduce coverage. Sessions spanning date boundaries can
                      split start and outcome counts.
                    </li>
                    <li>
                      All dates and activity hours in this dashboard use
                      Europe/Berlin. Partial weeks/months follow your selected
                      date range.
                    </li>
                  </ul>
                  <button
                    className="secondary"
                    onClick={() =>
                      download(
                        `cochem-insights-${from}-${to}.json`,
                        JSON.stringify(
                          {
                            filters: {
                              from,
                              to,
                              language,
                              device,
                              environment,
                            },
                            ...stats,
                          },
                          null,
                          2,
                        ),
                        "application/json",
                      )
                    }
                  >
                    <Download size={16} /> Download full report JSON
                  </button>
                </Panel>
              </>
            )}
          </div>
        )}
        <footer className="dashboard-footer">
          <span>
            <ShieldCheck size={13} /> Private workspace · No personal addresses
            collected
          </span>
          <span>
            {stats
              ? `Updated ${new Date(stats.updated_at).toLocaleTimeString("en-GB", { timeZone: "Europe/Berlin" })} Berlin`
              : "Waiting for data"}
          </span>
        </footer>
      </div>
    </main>
  );
}
