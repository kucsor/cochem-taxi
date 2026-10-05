import { spawn } from "node:child_process";
import assert from "node:assert/strict";
import { createHmac, randomBytes, scryptSync } from "node:crypto";
// Uses an isolated test admin password without changing deployed credentials.
const password = randomBytes(24).toString("hex");
const salt = randomBytes(24).toString("hex");
const origin = "http://127.0.0.1:9137";
const server = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    "9137",
  ],
  {
    env: {
      ...process.env,
      ADMIN_PASSWORD_HASH: `${salt}:${scryptSync(password, salt, 64).toString("hex")}`,
      VERCEL_ENV: "development",
    },
    stdio: ["ignore", "pipe", "pipe"],
  },
);
const ids = [];
let cookie = "";
async function request(path, body, headers = {}) {
  return fetch(origin + path, {
    method: body === undefined ? "GET" : "POST",
    headers: { origin, "content-type": "application/json", ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  });
}
try {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("Server startup timeout")),
      30000,
    );
    server.stdout.on("data", (d) => {
      if (String(d).includes("Ready")) {
        clearTimeout(timer);
        resolve();
      }
    });
    server.once("exit", (c) => {
      clearTimeout(timer);
      reject(new Error(`Server exited ${c}`));
    });
    server.stderr.on("data", (d) => process.stderr.write(d));
  });
  for (const path of [
    "/de",
    "/en",
    "/nl",
    "/admin",
    "/nl/prijzen",
    "/en/things-to-do",
    "/de/legal",
  ])
    assert.equal((await request(path)).status, 200, path);
  for (const lang of ["de", "en", "nl"])
    for (const airport of [
      "hahn",
      "frankfurt",
      "koeln-bonn",
      "duesseldorf",
      "luxemburg",
    ])
      assert.equal(
        (await request(`/${lang}/flughafen/${airport}`)).status,
        200,
      );
  for (const path of [
    "/apple-touch-icon-precomposed.png",
    "/.well-known/traffic-advice",
    "/de/non-existent-page",
  ])
    assert.equal((await request(path)).status, 404, path);
  assert.equal((await request("/api/admin/stats")).status, 401);
  assert.equal(
    (
      await request(
        "/api/admin/login",
        { username: "kuxor", password },
        { origin: "https://evil.example" },
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await request("/api/admin/login", {
        username: "kuxor",
        password: "wrong",
      })
    ).status,
    401,
  );
  let res = await request("/api/admin/login", { username: "kuxor", password });
  assert.equal(res.status, 200);
  cookie = res.headers.get("set-cookie").split(";")[0];
  assert.match(res.headers.get("set-cookie"), /HttpOnly/i);
  assert.match(res.headers.get("set-cookie"), /SameSite=strict/i);
  assert.equal(
    (
      await request("/api/admin/stats", undefined, {
        cookie: cookie + "corrupt",
      })
    ).status,
    401,
  );
  assert.equal(
    (
      await request("/api/admin/stats?environment=development", undefined, {
        cookie,
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await request(
        "/api/admin/stats?from=2020-01-01&to=2026-10-05",
        undefined,
        { cookie },
      )
    ).status,
    400,
  );
  const event = {
    id: crypto.randomUUID(),
    name: "page_view",
    path: "/de",
    visit: null,
    referrer: "",
    device: "desktop",
    source: "page",
  };
  ids.push(event.id);
  assert.equal(
    (await request("/api/events", { ...event, path: "/admin" })).status,
    400,
  );
  assert.equal((await request("/api/events", event)).status, 204);
  assert.equal((await request("/api/events", event)).status, 204);
  const data = await (
    await request("/api/admin/stats?environment=development", undefined, {
      cookie,
    })
  ).json();
  assert(data.views >= 1);
  assert.equal(
    (await request("/api/admin/logout", {}, { cookie })).status,
    200,
  );
  assert.equal(
    (await request("/api/admin/stats", undefined, { cookie })).status,
    401,
    "logout must revoke copied tokens",
  );
  const base = {
    startAddress: "Cochem",
    startLat: "50.1475",
    startLon: "7.1685",
    endAddress: "airport",
    pickupTime: "12:00",
    passengers: "1-4",
  };
  assert.equal(
    (await request("/api/calculate", { ...base, startLat: "Infinity" })).status,
    400,
  );
  assert.equal(
    (await request("/api/calculate", { ...base, pickupTime: "25:00" })).status,
    400,
  );
  assert.equal(
    (
      await request("/api/calculate", {
        ...base,
        airportSlug: "hahn",
        startLat: "50.0512",
        startLon: "8.5718",
      })
    ).status,
    422,
  );
  for (const airportSlug of [
    "hahn",
    "frankfurt",
    "koeln-bonn",
    "duesseldorf",
    "luxemburg",
  ]) {
    const r = await request("/api/calculate", { ...base, airportSlug });
    const d = await r.json();
    assert.equal(r.status, 200, `${airportSlug}: ${d.code}`);
    assert(d.price > 0 && d.duration > 0);
    console.log(
      `${airportSlug}: ${d.distance.toFixed(1)} km, ${Math.ceil(d.duration)} min, ${d.price.toFixed(2)} EUR`,
    );
  }
  const night = await (
    await request("/api/calculate", {
      ...base,
      airportSlug: "hahn",
      pickupTime: "23:00",
      passengers: "5-8",
    })
  ).json();
  assert(night.price > 0);
  console.log(
    "PASS: 15 airport pages, locales, 404 handling, auth, CSRF, tampered/revoked session, tracking, filters, input validation and airport routes.",
  );
} finally {
  console.log("TEST_EVENT_IDS=" + JSON.stringify(ids));
  server.kill("SIGTERM");
}
