import { z } from "zod";
import { calculationOutcomes } from "./calculation-diagnostics.ts";
import { destinations } from "./analytics-destinations.ts";
export const eventNames = [
  "destination_search",
  "destination_select",
  "pickup_select",
  "passenger_change",
  "time_change",
  "map_toggle",
  "location_success",
  "location_error",
  "page_view",
  "click_call_now",
  "click_calculator",
  "use_calculator",
  "calculator_success",
  "calculator_error",
  "click_locate_me",
  "change_language",
  "view_legal",
  "click_home_nav",
  "click_services_nav",
  "click_scroll_top",
  "load_map_click",
  "view_activities",
  "consent_accept",
  "consent_reject",
  "service_click",
  "navigation_click",
  "outbound_click",
  "email_click",
  "scroll_depth",
  "engagement",
] as const;
// No addresses, coordinates, query strings, free-text errors or full referrer URLs.
export const eventSchema = z.object({
  destination: z.enum(destinations).optional(),
  origin: z.enum(destinations).optional(),
  route_version: z.literal(2).optional(),
  after_estimate: z.literal(1).optional(),
  passengers: z.enum(["1-4", "5-8"]).optional(),
  tariff: z.enum(["day", "night"]).optional(),
  fare: z.number().finite().min(0).max(10000).optional(),
  distance: z.number().finite().min(0).max(3000).optional(),
  id: z.string().uuid(),
  name: z.enum(eventNames),
  path: z
    .string()
    .max(160)
    .regex(/^\/(de|en|nl)(\/[a-z0-9-]+){0,3}$/),
  visit: z.string().uuid().nullable(),
  referrer: z
    .string()
    .max(100)
    .regex(/^[a-zA-Z0-9.-]*$/),
  device: z.enum(["mobile", "tablet", "desktop"]),
  source: z.enum([
    "header",
    "footer",
    "calculator",
    "hero",
    "navigation",
    "service",
    "page",
    "other",
  ]),
  value: z.number().int().min(0).max(3600).optional(),
  outcome: z.enum(calculationOutcomes).optional(),
});
export type AnalyticsEvent = z.infer<typeof eventSchema>;
