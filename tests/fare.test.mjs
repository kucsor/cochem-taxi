import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isNightHour,
  getBaseFee,
  getRatePerKm,
  isPointInPolygon,
  COCHEM_POLYGON,
  COCHEM_CENTER_COORDS,
} from "../src/lib/fare.ts";
import { eventSchema } from "../src/lib/event-schema.ts";
test("tariff boundaries and group rates", () => {
  assert.equal(isNightHour(21), false);
  assert.equal(isNightHour(22), true);
  assert.equal(isNightHour(5), true);
  assert.equal(isNightHour(6), false);
  assert.equal(getBaseFee({ large: true }), 6);
  assert.equal(getRatePerKm({ large: true, night: true }), 4.8);
  assert.equal(getRatePerKm({ large: false, night: false }), 3);
});
test("Cochem pickup zone excludes airport pickups", () => {
  assert(isPointInPolygon(COCHEM_CENTER_COORDS, COCHEM_POLYGON));
  assert(!isPointInPolygon({ lat: 50.0512, lon: 8.5718 }, COCHEM_POLYGON));
});
test("event schema strips extra fields and rejects unknown names and paths", () => {
  const event = {
    id: crypto.randomUUID(),
    name: "page_view",
    path: "/de",
    visit: null,
    referrer: "",
    device: "mobile",
    source: "page",
    address: "never store this",
  };
  const parsed = eventSchema.parse(event);
  assert(!("address" in parsed));
  assert(!eventSchema.safeParse({ ...event, path: "/admin" }).success);
  assert(
    !eventSchema.safeParse({ ...event, path: "/de?address=private" }).success,
  );
  assert(!eventSchema.safeParse({ ...event, name: "arbitrary" }).success);
});
