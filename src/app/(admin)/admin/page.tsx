"use client";
import { useEffect, useState } from "react";
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
} from "recharts";
import {
  Activity,
  Eye,
  Phone,
  Calculator,
  LogOut,
  Download,
  RefreshCw,
  ShieldCheck,
  Users,
  AlertTriangle,
} from "lucide-react";
type Row = { label: string; count: number };
type Stats = {
  total: number;
  views: number;
  calls: number;
  calculations: number;
  successes: number;
  errors: number;
  visits: number;
  previous: { views: number; calls: number; calculations: number };
  daily: { day: string; views: number; calls: number; calculations: number }[];
  events: Row[];
  pages: Row[];
  sources: Row[];
  devices: Row[];
  languages: Row[];
  hours: Row[];
  callSources: Row[];
  outcomes: Row[];
  depths: Row[];
  first_event: string | null;
  updated_at: string;
};
const labels: Record<string, string> = {
  page_view: "Afișări",
  click_call_now: "Sună taxi",
  use_calculator: "Calcule începute",
  calculator_success: "Calcule reușite",
  calculator_error: "Erori calculator",
  click_locate_me: "Localizare",
  change_language: "Schimbări limbă",
  navigation_click: "Navigare",
  service_click: "Servicii",
  outbound_click: "Linkuri externe",
  email_click: "Email",
  scroll_depth: "Derulare",
  engagement: "Timp pe pagină",
  load_map_click: "Încărcare hartă",
  consent_accept: "Acceptare cookies",
  consent_reject: "Refuz cookies",
};
const today = () => new Date().toISOString().slice(0, 10);
const input =
  "rounded-xl border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white";
function Breakdown({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
      <h2 className="font-semibold mb-4">{title}</h2>
      {!rows.length ? (
        <p className="text-slate-400 text-sm">
          Nu există date pentru filtrele alese.
        </p>
      ) : (
        <div className="max-h-80 overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="text-left pb-3">Categorie</th>
                <th className="text-right pb-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-t border-white/5">
                  <td className="py-2 pr-3 break-all">
                    {labels[r.label] || r.label || "Direct / necunoscut"}
                  </td>
                  <td className="text-right tabular-nums">
                    {r.count.toLocaleString("ro-RO")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
export default function Dashboard() {
  const [auth, setAuth] = useState<boolean | null>(null),
    [username, setUsername] = useState("kuxor"),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [stats, setStats] = useState<Stats | null>(null);
  const [from, setFrom] = useState(
      new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10),
    ),
    [to, setTo] = useState(today()),
    [language, setLanguage] = useState(""),
    [device, setDevice] = useState(""),
    [environment, setEnvironment] = useState("production");
  async function load(signal?: AbortSignal) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(
        `/api/admin/stats?${new URLSearchParams({ from, to, language, device, environment })}`,
        { cache: "no-store", signal },
      );
      if (res.status === 401) {
        setAuth(false);
        setStats(null);
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStats(data);
      setAuth(true);
    } catch (e) {
      if ((e as Error).name !== "AbortError")
        setError((e as Error).message || "Nu am putut încărca statisticile.");
    } finally {
      if (!signal?.aborted) setBusy(false);
    }
  }
  useEffect(() => {
    const c = new AbortController();
    void load(c.signal);
    return () => c.abort();
  }, [from, to, language, device, environment]);
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
      if (!r.ok) throw new Error(d.error);
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
    const r = await fetch("/api/admin/logout", { method: "POST" });
    if (r.ok) {
      setAuth(false);
      setStats(null);
      setPassword("");
    } else setError("Deconectarea nu a reușit.");
  }
  function csv() {
    if (!stats) return;
    const cell = (v: unknown) =>
      `"${String(v)
        .replace(/"/g, '""')
        .replace(/^[=+@-]/, "'$&")}"`;
    const rows = [
      ["Data (UTC)", "Afișări", "Clickuri telefon", "Calcule"],
      ...stats.daily.map((d) => [d.day, d.views, d.calls, d.calculations]),
    ];
    const a = document.createElement("a");
    const url = URL.createObjectURL(
      new Blob(["\ufeff" + rows.map((r) => r.map(cell).join(",")).join("\n")], {
        type: "text/csv;charset=utf-8",
      }),
    );
    a.href = url;
    a.download = `cochem-statistici-${from}-${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
  if (auth !== true)
    return (
      <main className="min-h-dvh bg-slate-950 text-white flex items-center justify-center p-6">
        <form
          onSubmit={login}
          className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-2xl"
        >
          <ShieldCheck className="text-amber-400 mb-6" size={36} />
          <p className="text-amber-400 text-xs tracking-[.25em] uppercase">
            Cochem Taxi
          </p>
          <h1 className="text-3xl font-bold mt-2 mb-2">
            Panou de administrare
          </h1>
          <p className="text-slate-400 mb-7">
            Statistici și performanța site-ului
          </p>
          <label className="block mb-5">
            Utilizator
            <input
              className={`${input} block w-full mt-2`}
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
          <label className="block mb-5">
            Parolă
            <input
              type="password"
              className={`${input} block w-full mt-2`}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && (
            <p role="alert" className="text-red-300 text-sm mb-4">
              {error}
            </p>
          )}
          <button
            disabled={busy}
            className="w-full rounded-xl bg-amber-400 text-slate-950 py-3 font-semibold disabled:opacity-50"
          >
            {busy ? "Se verifică…" : "Autentificare"}
          </button>
        </form>
      </main>
    );
  const cards = stats
    ? [
        {
          label: "Afișări pagini",
          value: stats.views,
          icon: Eye,
          previous: stats.previous.views,
        },
        {
          label: "Clickuri „Sună taxi”",
          value: stats.calls,
          icon: Phone,
          previous: stats.previous.calls,
        },
        {
          label: "Calcule începute",
          value: stats.calculations,
          icon: Calculator,
          previous: stats.previous.calculations,
        },
        { label: "Vizite cu acord", value: stats.visits, icon: Users },
        { label: "Calcule reușite", value: stats.successes, icon: Activity },
        { label: "Erori calculator", value: stats.errors, icon: AlertTriangle },
      ]
    : [];
  return (
    <main className="min-h-dvh bg-[#080e1a] text-slate-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-wrap gap-4 justify-between items-center">
          <div>
            <p className="text-amber-400 text-xs uppercase tracking-[.25em]">
              Cochem Taxi / Analytics
            </p>
            <h1 className="text-3xl font-bold mt-2">Privire de ansamblu</h1>
            <p className="text-slate-400 mt-2">
              De la vizită la solicitarea unei curse.
            </p>
          </div>
          <button
            onClick={logout}
            className={`${input} flex gap-2 items-center`}
          >
            <LogOut size={16} />
            Deconectare
          </button>
        </header>
        <section className="rounded-2xl border border-white/10 p-4 bg-slate-900/60 flex flex-wrap items-end gap-3">
          <label className="text-xs text-slate-400">
            De la
            <input
              type="date"
              className={`${input} block mt-1`}
              value={from}
              max={to}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>
          <label className="text-xs text-slate-400">
            Până la
            <input
              type="date"
              className={`${input} block mt-1`}
              value={to}
              min={from}
              max={today()}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>
          <label className="text-xs text-slate-400">
            Limbă
            <select
              className={`${input} block mt-1`}
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="">Toate</option>
              <option value="de">Germană</option>
              <option value="en">Engleză</option>
              <option value="nl">Olandeză</option>
            </select>
          </label>
          <label className="text-xs text-slate-400">
            Dispozitiv
            <select
              className={`${input} block mt-1`}
              value={device}
              onChange={(e) => setDevice(e.target.value)}
            >
              <option value="">Toate</option>
              <option value="mobile">Telefon</option>
              <option value="desktop">Desktop</option>
              <option value="tablet">Tabletă</option>
            </select>
          </label>
          <label className="text-xs text-slate-400">
            Mediu
            <select
              className={`${input} block mt-1`}
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
            >
              <option value="production">Site public</option>
              <option value="preview">Preview</option>
              <option value="development">Dezvoltare</option>
            </select>
          </label>
          <button
            onClick={() => void load()}
            disabled={busy}
            className={`${input} flex items-center gap-2`}
          >
            <RefreshCw size={16} className={busy ? "animate-spin" : ""} />
            Actualizează
          </button>
          <button
            onClick={csv}
            disabled={!stats || busy}
            className={`${input} flex gap-2 items-center`}
          >
            <Download size={16} />
            Export CSV
          </button>
        </section>
        {error && (
          <p role="alert" className="rounded-xl bg-red-950 p-4 text-red-200">
            {error}
          </p>
        )}
        {stats && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
              {cards.map((c) => (
                <section
                  key={c.label}
                  className="rounded-2xl border border-white/10 bg-slate-900 p-4"
                >
                  <c.icon size={20} className="text-amber-400 mb-4" />
                  <p className="text-3xl font-semibold tabular-nums">
                    {c.value.toLocaleString("ro-RO")}
                  </p>
                  <p className="text-sm text-slate-400 mt-2">{c.label}</p>
                  {c.previous !== undefined && (
                    <p className="text-xs text-slate-500 mt-2">
                      Anterior: {c.previous} ·{" "}
                      {c.previous
                        ? `${(((c.value - c.previous) / c.previous) * 100).toFixed(0)}%`
                        : "fără bază de comparație"}
                    </p>
                  )}
                </section>
              ))}
            </div>
            <section className="rounded-2xl border border-white/10 bg-slate-900 p-5">
              <h2 className="font-semibold">Evoluția zilnică</h2>
              <p className="text-xs text-slate-400 mt-1 mb-5">
                Zile UTC · comparație cu intervalul anterior de aceeași durată
              </p>
              <div
                className="h-72"
                role="img"
                aria-label="Grafic zilnic de afișări, apeluri și calcule. Datele sunt disponibile în exportul CSV."
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.daily}>
                    <CartesianGrid stroke="#ffffff0a" />
                    <XAxis
                      dataKey="day"
                      stroke="#94a3b8"
                      tickFormatter={(s) => String(s).slice(5)}
                    />
                    <YAxis stroke="#94a3b8" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: "#0f172a",
                        border: "1px solid #334155",
                      }}
                    />
                    <Legend />
                    <Area
                      dataKey="views"
                      name="Afișări"
                      stroke="#fbbf24"
                      fill="#fbbf241c"
                    />
                    <Area
                      dataKey="calls"
                      name="Clickuri telefon"
                      stroke="#34d399"
                      fill="#34d39912"
                    />
                    <Area
                      dataKey="calculations"
                      name="Calcule"
                      stroke="#60a5fa"
                      fill="#60a5fa12"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              <Breakdown title="Pagini vizualizate" rows={stats.pages} />
              <Breakdown title="Toate interacțiunile" rows={stats.events} />
              <Breakdown title="Surse de trafic" rows={stats.sources} />
              <Breakdown
                title="Locul apăsării pe telefon"
                rows={stats.callSources}
              />
              <Breakdown title="Dispozitive" rows={stats.devices} />
              <Breakdown title="Limbi" rows={stats.languages} />
              <Breakdown title="Erori și rezultate" rows={stats.outcomes} />
              <Breakdown title="Adâncimea derulării (%)" rows={stats.depths} />
              <section className="rounded-2xl border border-white/10 bg-slate-900 p-5">
                <h2 className="font-semibold mb-4">Indicatori</h2>
                <p className="text-2xl text-emerald-400">
                  {stats.views
                    ? ((stats.calls / stats.views) * 100).toFixed(1)
                    : "0"}
                  %
                </p>
                <p className="text-sm text-slate-400 mb-5">
                  Clickuri telefon / afișări (raport de evenimente)
                </p>
                <p className="text-2xl text-blue-400">
                  {stats.calculations
                    ? ((stats.successes / stats.calculations) * 100).toFixed(1)
                    : "0"}
                  %
                </p>
                <p className="text-sm text-slate-400">
                  Calcule reușite / începute
                </p>
              </section>
            </div>
            <section className="rounded-2xl border border-white/10 bg-slate-900 p-5">
              <h2 className="font-semibold mb-5">Activitate pe ore (UTC)</h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.hours}>
                    <XAxis dataKey="label" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" allowDecimals={false} />
                    <Tooltip contentStyle={{ background: "#0f172a" }} />
                    <Bar
                      name="Afișări"
                      dataKey="count"
                      fill="#fbbf24"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
            {!stats.total && (
              <p className="rounded-xl border border-dashed border-slate-600 p-6 text-slate-300">
                Nu există încă evenimente în acest interval. Datele noi apar
                după publicarea integrării; istoricul Vercel nu este importat
                automat.
              </p>
            )}
            <footer className="text-xs text-slate-400 leading-6 pb-8">
              Actualizat: {new Date(stats.updated_at).toLocaleString("ro-RO")}.
              Retenție: 90 de zile. Fără adrese de cursă sau coordonate GPS.
              Vizitele cu acord sunt sesiuni ale paginii, nu persoane unice;
              reîncărcarea începe o sesiune nouă. Fără acord se numără doar
              evenimente independente. DNT/GPC și blocatoarele pot reduce
              numărătoarea. Clickurile pe telefon nu confirmă apeluri sau curse.
              Evenimentele venite din browser pot fi falsificate și nu sunt date
              contabile.
            </footer>
          </>
        )}
      </div>
    </main>
  );
}
