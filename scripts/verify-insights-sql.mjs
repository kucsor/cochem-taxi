// Isolated PostgreSQL-compatible WASM validation. Never connects to production.
// Set PGLITE_MODULE to an installed @electric-sql/pglite entry point.
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const { PGlite } = await import(
  process.env.PGLITE_MODULE || "@electric-sql/pglite"
);
const db = new PGlite();
await db.exec(
  `create role anon; create role authenticated; create role service_role bypassrls; create schema cron; create function cron.schedule(text,text,text) returns integer language sql as 'select 1';`,
);
await db.exec(
  readFileSync("supabase/schema.sql", "utf8").replace(
    "create extension if not exists pg_cron;",
    "",
  ),
);
await db.exec(readFileSync("supabase/insights.sql", "utf8"));
const id = crypto.randomUUID();
const sql = `insert into public.analytics_events(id,created_at,name,path,language,device,source,referrer,environment,destination,passengers,tariff,fare,distance) values ($1,$2,$3,'/en','en','mobile','calculator','','production','airport-hahn','5-8','night',$4,$5) on conflict(id) do nothing`;
await db.exec("set role service_role");
await db.query(sql, [
  id,
  "2026-10-05T22:30:00Z",
  "calculator_success",
  150,
  45,
]);
await db.query(sql, [
  id,
  "2026-10-05T22:30:00Z",
  "calculator_success",
  150,
  45,
]);
await db.query(sql, [
  crypto.randomUUID(),
  "2026-10-05T22:29:00Z",
  "use_calculator",
  null,
  null,
]);
await db.query(sql, [
  crypto.randomUUID(),
  "2026-10-05T22:28:00Z",
  "destination_search",
  null,
  null,
]);
const report = async (day = "2026-10-06", device = "mobile") =>
  (
    await db.query(
      `select analytics_insights($1::date,$1::date,'en',$2,'production') report`,
      [day, device],
    )
  ).rows[0].report;
let r = await report();
assert.equal(r.calculations, 1);
assert.equal(r.successes, 1);
assert.equal(r.total, 3);
assert.equal(r.destinations[0].average_fare, 150);
assert.equal(r.destinations[0].searches, 1);
assert.equal(r.groups.hours, undefined);
assert.equal(r.groups.passengers[0].label, "5-8");
assert.equal((await report("2026-10-05")).total, 0);
assert.equal((await report("2026-10-06", "desktop")).total, 0);
await db.exec("delete from public.analytics_events");
assert.equal((await report()).successes, 1);
assert.equal((await report()).recent.length, 0);
await db.exec("reset role; set role anon");
await assert.rejects(
  db.query("select * from public.analytics_daily"),
  /permission denied/,
);
await assert.rejects(
  db.query("select analytics_insights('2026-10-06','2026-10-06')"),
  /permission denied/,
);
console.log(
  "PASS: migration, atomic rollup, duplicate protection, destination aggregates, Berlin date boundary, filters, raw retention independence, denied public access",
);
await db.close();
