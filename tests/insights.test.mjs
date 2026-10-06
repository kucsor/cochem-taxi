import { test } from "node:test";
import assert from "node:assert/strict";
import {
  classifyDestination,
  destinations,
} from "../src/lib/analytics-destinations.ts";
import { eventSchema } from "../src/lib/event-schema.ts";
import { groupDays, csvCell } from "../src/lib/analytics-dashboard.ts";
test("destination classifier emits only categories and handles airports before towns", () => {
  assert.equal(classifyDestination("Frankfurt Airport"), "airport-frankfurt");
  assert.equal(
    classifyDestination("Flughafen Köln/Bonn"),
    "airport-koeln-bonn",
  );
  assert.equal(classifyDestination("private address", "hahn"), "airport-hahn");
  assert.equal(classifyDestination("Cochem, Bergstrasse 18"), "cochem");
  assert.equal(classifyDestination("Unknown Street 123"), "other");
  assert.equal(classifyDestination("Valwigerberg"), "valwigerberg");
  assert.equal(classifyDestination("Frankfurter Straße 4"), "other");
  for (const q of [
    "",
    "Jane Doe, Some Road",
    "tel:+123",
    "<script>",
    "51.532 7.273",
  ])
    assert(destinations.includes(classifyDestination(q)));
});
test("ingestion rejects raw destination text and invalid numeric metrics", () => {
  const e = {
    id: crypto.randomUUID(),
    name: "calculator_success",
    path: "/en",
    visit: null,
    referrer: "",
    device: "mobile",
    source: "calculator",
    destination: "airport-hahn",
    passengers: "5-8",
    tariff: "night",
    fare: 142.1,
    distance: 41.6,
    address: "private",
  };
  assert.equal(eventSchema.parse(e).destination, "airport-hahn");
  assert(!("address" in eventSchema.parse(e)));
  for (const extra of [
    { destination: "Bergstrasse 18" },
    { fare: -1 },
    { fare: Infinity },
    { distance: 3001 },
    { passengers: "John" },
  ])
    assert(!eventSchema.safeParse({ ...e, ...extra }).success);
});
test("weekly and monthly aggregation preserves all counts across boundaries", () => {
  const day = (d, n) => ({
    day: d,
    views: n,
    calls: n,
    calculations: n,
    successes: n,
    errors: 0,
  });
  const ds = [day("2026-09-30", 2), day("2026-10-01", 3), day("2026-10-05", 4)];
  assert.deepEqual(
    groupDays(ds, "month").map((x) => [x.day, x.views]),
    [
      ["2026-09", 2],
      ["2026-10", 7],
    ],
  );
  assert.deepEqual(
    groupDays(ds, "week").map((x) => [x.day, x.views]),
    [
      ["2026-09-28", 5],
      ["2026-10-05", 4],
    ],
  );
  assert.equal(groupDays(ds, "day").length, 3);
  assert.equal(ds[0].views, 2);
});
test("CSV export neutralizes spreadsheet formulas and escapes quotes", () => {
  assert.equal(csvCell("=1+1"), '"\'=1+1"');
  assert.equal(csvCell('a"b'), '"a""b"');
});
