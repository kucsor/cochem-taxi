// Local-only UI contract test with clearly synthetic statistics. No production writes.
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const chrome = require(process.env.CHROMIUM_MODULE || "@sparticuz/chromium");
const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "-H", "127.0.0.1", "-p", "9123"],
  { stdio: "ignore" },
);
let browser;
try {
  for (let i = 0; i < 80; i++) {
    try {
      if ((await fetch("http://127.0.0.1:9123/admin")).ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  assert.equal(
    (await fetch("http://127.0.0.1:9123/api/admin/insights")).status,
    401,
  );
  browser = await chromium.launch({
    executablePath:
      process.env.CHROMIUM_EXECUTABLE || (await chrome.executablePath()),
    args: chrome.args,
    headless: true,
  });
  const p = await browser.newPage({
    serviceWorkers: "block",
    viewport: { width: 1440, height: 1050 },
    reducedMotion: "reduce",
  });
  const errors = [];
  p.on("pageerror", (e) => {errors.push(e.message); console.error("PAGE_ERROR",e.message);});
  const daily = Array.from({ length: 30 }, (_, i) => ({
    day: `2026-09-${String(i + 1).padStart(2, "0")}`,
    views: 10 + ((i * 7) % 60),
    calls: 2 + (i % 8),
    calculations: 3 + (i % 15),
    successes: 2 + (i % 12),
    errors: i % 3,
  }));
  const destination = (name, n) => ({
    destination: name,
    searches: n * 2,
    selections: n,
    calculations: n,
    successes: n - 2,
    errors: 2,
    average_fare: 142.13,
    average_distance: 41.6,
  });
  const fixture = {
    views: 1284,
    calls: 126,
    calculations: 348,
    successes: 326,
    errors: 12,
    total: 4212,
    average_engagement: 74,
    average_fare: 162.4,
    previous: { views: 982, calls: 91, calculations: 240 },
    daily,
    destinations: [
      destination("airport-hahn", 132),
      destination("airport-frankfurt", 87),
      destination("koblenz", 65),
      destination("other", 20),
    ],
    destinationTrends: [
      { month: "2026-09", destination: "airport-hahn", calculations: 80 },
      { month: "2026-10", destination: "airport-hahn", calculations: 132 },
    ],
    groups: {
      events: [
        { label: "page_view", count: 1284 },
        { label: "use_calculator", count: 348 },
      ],
      pages: [
        { label: "/de", count: 802 },
        { label: "/en", count: 320 },
        { label: "/nl", count: 162 },
      ],
      devices: [
        { label: "mobile", count: 981 },
        { label: "desktop", count: 280 },
        { label: "tablet", count: 23 },
      ],
      languages: [
        { label: "de", count: 780 },
        { label: "en", count: 362 },
        { label: "nl", count: 142 },
      ],
      sources: [
        { label: "google.com", count: 518 },
        { label: "", count: 330 },
      ],
      callSources: [
        { label: "hero", count: 87 },
        { label: "footer", count: 39 },
      ],
      outcomes: [
        { label: "routing", count: 8 },
        { label: "network_or_timeout", count: 4 },
      ],
      hours: [{ label: "10", count: 120 }],
      weekdays: [{ label: "1", count: 183 }],
      passengers: [
        { label: "1-4", count: 260 },
        { label: "5-8", count: 88 },
      ],
      tariffs: [
        { label: "day", count: 240 },
        { label: "night", count: 108 },
      ],
      depths: [{ label: "25", count: 420 }],
    },
    updated_at: new Date().toISOString(),
    last_event: new Date().toISOString(),
    first_available: "2026-10-05",
    timezone: "Europe/Berlin",
    recent: [{id:"synthetic-error",created_at:"2026-10-09T11:50:13Z",name:"calculator_error",outcome:"cochem_only",path:"/de/flughafen/hahn",device:"mobile",language:"de",source:"calculator",origin:"unknown",destination:"airport-hahn",route_version:2,passengers:"5-8",tariff:"day"}],
  };
  fixture.recent_errors = fixture.recent;
  fixture.routeReport = {
    version:2,first_available:"2026-10-05",sessions_available:true,legacy_calculations:7,missing_destination:7,
    routes:[{origin:"cochem",destination:"airport-hahn",calculations:8,successes:7,errors:1,call_clicks:3,sessions:4,call_sessions:2,consented_calculations:6,average_fare:120,average_distance:40,first_day:"2026-10-05",last_day:"2026-10-07",breakdown:[{passengers:"1-4",tariff:"day",calculations:8}]}],
    daily:[{day:"2026-10-05",origin:"cochem",destination:"airport-hahn",calculations:8}],
    interests:[{destination:"airport-hahn",searches:3,selections:4}],legacy_destinations:[{destination:"unknown",calculations:7}]
  };
  fixture.routeReport.routes.push({...fixture.routeReport.routes[0],destination:"locality:DE-RP:place.12345:Mayen",calculations:3});
  fixture.routeReport.daily.push({day:"2026-10-05",origin:"cochem",destination:"locality:DE-RP:place.12345:Mayen",calculations:3});
  fixture.routeReport.interests.push({destination:"locality:DE-RP:place.12345:Mayen",searches:0,selections:3});
  let authenticated = false,
    mode = "normal";
  await p.route("**/api/admin/insights?*", (r) =>
    r.fulfill({
      status: authenticated ? (mode === "error" ? 503 : 200) : 401,
      contentType: "application/json",
      body: JSON.stringify(
        !authenticated
          ? { error: "Sign in required." }
          : mode === "error"
            ? { error: "Statistics are temporarily unavailable." }
            : mode === "empty"
              ? {
                  ...fixture,
                  routeReport: {...fixture.routeReport,routes:[],daily:[],interests:[],legacy_destinations:[],legacy_calculations:0,missing_destination:0},
                  total: 0,
                  views: 0,
                  calls: 0,
                  calculations: 0,
                  successes: 0,
                  errors: 0,
                  daily: [],
                  destinations: [],
                  destinationTrends: [],
                  groups: {},
                  recent: [], recent_errors: [],
                }
              : fixture,
      ),
    }),
  );
  await p.route("**/api/admin/login", (r) => {
    authenticated = true;
    return r.fulfill({
      status: 200,
      contentType: "application/json",
      body: '{"ok":true}',
    });
  });
  await p.goto("http://127.0.0.1:9123/admin");
  await p.getByLabel("Password", { exact: true }).fill("synthetic-test-only");
  await p.getByRole("button", { name: "Open dashboard", exact: true }).click();
  await p.getByText("1,284", { exact: true }).waitFor().catch(async e=>{console.error((await p.locator("body").innerText()).slice(-2000));throw e;});
  assert.equal(await p.getByText("The typical estimate",{exact:true}).count(),0);
  assert.equal(await p.getByText("Measured engagement",{exact:true}).count(),0);
  await p.getByRole("button",{name:"Reliability",exact:true}).click();
  await p.locator(".log-entry summary").click();
  await p.getByText("Recorded code:",{exact:false}).waitFor();
  assert.match(await p.locator(".log-body").innerText(),/intentional restriction/);
  assert.match(await p.locator(".log-body").innerText(),/5-8/);
  const logDownload=p.waitForEvent("download");
  await p.getByRole("button",{name:"Export log CSV",exact:true}).click();
  assert.equal((await logDownload).suggestedFilename(),"calculation-error-log.csv");
  await p.getByLabel("Search error log").fill("no-such-route");
  assert.equal(await p.locator(".log-entry").count(),0);
  await p.getByLabel("Search error log").fill("");
  await p.getByRole("button",{name:"Overview",exact:true}).click();
  mkdirSync("docs/previews", { recursive: true });
  await p.screenshot({
    path: "docs/previews/routes-overview-synthetic.jpg",
    fullPage: true,
    type: "jpeg", quality: 75,
  });
  await p.getByRole("button", { name: "Routes & Destinations", exact: true }).click();
  await p.getByRole("heading", { name: "Most calculated routes", exact: true }).waitFor();
  await p.getByLabel("Search routes").fill("Mayen");
  assert.equal(await p.locator(".route-detail").count(),1);
  assert.match(await p.locator(".route-detail summary").innerText(),/Mayen · DE-RP/);
  await p.getByLabel("Search routes").fill("Hahn");
  assert.equal(await p.locator(".route-detail").count(), 1);
  await p.locator(".route-detail summary").click();
  await p.getByText("Consented tab sessions", {exact:true}).waitFor();
  await p.getByLabel("Route chart grouping").selectOption("week");
  await p.getByLabel("Search routes").fill("");
  const routeDownload = p.waitForEvent("download");
  await p.getByRole("button", { name: "Export routes CSV",exact:true }).click();
  assert((await routeDownload).suggestedFilename().startsWith("cochem-routes-"));
  const dl = p.waitForEvent("download");
  await p.getByRole("button", { name: "Export CSV" }).click();
  assert((await dl).suggestedFilename().endsWith(".csv"));
  for (const width of [390, 360, 768]) {
    await p.setViewportSize({ width, height: 844 });
    for (const section of [
      "Overview",
      "Routes & Destinations",
      "Features",
      "Audience",
      "Reliability",
    ]) {
      await p.getByRole("button", { name: section, exact: true }).click();
      if(section === "Reliability" || section === "Features") {
        await p.locator(".log-entry summary").click();
        if(width===390 && section === "Reliability") await p.screenshot({path:"/tmp/diagnostics-mobile.png",fullPage:true});
      }
      assert(
        await p.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `Overflow at ${width} on ${section}`,
      );
    }
    await p.getByRole("button", { name: "Routes & Destinations", exact: true }).click();
    if (width === 390)
      await p.screenshot({
        path: "docs/previews/routes-mobile-synthetic.jpg",
        fullPage: true,
    type: "jpeg", quality: 75,
      });
  }
  await p.getByRole("button", { name: "Filters", exact: true }).click();
  await p.getByLabel("Language", { exact: true }).selectOption("en");
  mode = "empty";
  await p
    .getByRole("button", { name: "Refresh statistics", exact: true })
    .click();
  await p.getByText("No activity in this selection", { exact: true }).waitFor();
  mode = "error";
  await p
    .getByRole("button", { name: "Refresh statistics", exact: true })
    .click();
  await p.getByRole("alert").filter({hasText:"Statistics are temporarily unavailable."}).waitFor();
  assert(
    (await p.getByRole("alert").filter({hasText:"Statistics are temporarily unavailable."}).innerText()).includes("Previously loaded data"),
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS: protected API, login UI, desktop/mobile/tablet layouts, five sections, search, filters, CSV, empty and failed reports; screenshots use synthetic data.",
  );
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
