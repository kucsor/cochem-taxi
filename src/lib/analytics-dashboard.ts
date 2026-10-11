export type ActivityEvent = {
  id?: string;
  created_at: string;
  name: string;
  path: string;
  device: string;
  language: string;
  destination: string;
  origin?: string | null;
  source?: string | null;
  outcome?: string | null;
  route_version?: number | null;
  passengers?: string | null;
  tariff?: string | null;
  fare?: number | null;
  distance?: number | null;
  after_estimate?: number | null;
};
export type Row = { label: string; count: number };
export type Day = {
  day: string;
  views: number;
  calls: number;
  calculations: number;
  successes: number;
  errors: number;
};
export type DestinationRow = {
  destination: string;
  searches: number;
  selections: number;
  calculations: number;
  successes: number;
  errors: number;
  average_fare: number | null;
  average_distance: number | null;
};
export type Insights = {
  journeyReport?: JourneyReport;
  routeReport?: RouteReport;
  views: number;
  calls: number;
  calculations: number;
  successes: number;
  errors: number;
  total: number;
  average_engagement: number | null;
  average_fare: number | null;
  previous: { views: number; calls: number; calculations: number };
  daily: Day[];
  destinations: DestinationRow[];
  destinationTrends: {
    month: string;
    destination: string;
    calculations: number;
  }[];
  groups: Record<string, Row[]>;
  updated_at: string;
  last_event: string | null;
  first_available: string | null;
  timezone: string;
  recent: ActivityEvent[];
  recent_errors?: ActivityEvent[];
};
export const eventLabels: Record<string, string> = {
  session_start: "Consented session started",
  page_timing: "Visible / active time sample",
  page_view: "Page view",
  click_call_now: "Call taxi",
  click_calculator: "Open calculator",
  use_calculator: "Calculation started",
  calculator_success: "Calculation completed",
  calculator_error: "Calculation failed",
  destination_search: "Destination search",
  destination_select: "Destination selected",
  pickup_select: "Pickup selected",
  passenger_change: "Passenger group changed",
  time_change: "Pickup time changed",
  map_toggle: "Map visibility changed",
  location_success: "Location permission succeeded",
  location_error: "Location failed / denied",
  click_locate_me: "Use my location",
  change_language: "Language changed",
  view_legal: "Legal notice opened",
  click_home_nav: "Home navigation",
  click_services_nav: "Services navigation",
  click_scroll_top: "Back to top",
  load_map_click: "Load interactive map",
  view_activities: "Activities opened",
  consent_accept: "Session statistics allowed",
  consent_reject: "Session statistics declined",
  service_click: "Service link",
  navigation_click: "Navigation link",
  outbound_click: "External link",
  email_click: "Email link",
  scroll_depth: "Scroll milestone",
  engagement: "Measured page engagement",
};
export function groupDays(
  days: Day[],
  period: "day" | "week" | "month",
): Day[] {
  const result = new Map<string, Day>();
  for (const d of days) {
    let key = d.day;
    if (period === "month") key = d.day.slice(0, 7);
    if (period === "week") {
      const dt = new Date(d.day + "T12:00:00Z");
      dt.setUTCDate(dt.getUTCDate() - ((dt.getUTCDay() + 6) % 7));
      key = dt.toISOString().slice(0, 10);
    }
    const row = result.get(key) || {
      day: key,
      views: 0,
      calls: 0,
      calculations: 0,
      successes: 0,
      errors: 0,
    };
    for (const k of [
      "views",
      "calls",
      "calculations",
      "successes",
      "errors",
    ] as const)
      row[k] += d[k];
    result.set(key, row);
  }
  return [...result.values()];
}
export const berlinToday = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
export function daysAgo(days: number) {
  const d = new Date(berlinToday() + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}
export function csvCell(value: unknown) {
  return (
    '"' +
    String(value ?? "")
      .replace(/^[=+@-]/, "'$&")
      .replace(/"/g, '""') +
    '"'
  );
}

export type RouteRow = {
  origin: string; destination: string;
  calculations: number; successes: number; errors: number; call_clicks: number;
  sessions: number | null; call_sessions: number | null; consented_calculations: number | null;
  average_fare: number | null; average_distance: number | null;
  first_day: string; last_day: string;
  breakdown: { passengers: string; tariff: string; calculations: number }[];
};
export type RouteReport = {
  version: number; first_available: string | null; sessions_available: boolean;
  legacy_calculations: number; missing_destination: number;
  routes: RouteRow[];
  daily: { day: string; origin: string; destination: string; calculations: number }[];
  interests: { destination: string; searches: number; selections: number }[];
  legacy_destinations: { destination: string; calculations: number }[];
};

export type JourneyReport = {
  version: number;
  coverage: { views: number; country_views: number; session_views: number; measured_views: number; timing_samples: number; visible_ms: number; active_ms: number; session_starts: number; calls: number; linked_calls: number; session_calls: number };
  countries: { country: string; views: number; session_starts: number; calculations: number; successes: number; errors: number; calls: number; linked_calls: number; visible_ms: number; active_ms: number }[];
  routes: { country: string; origin: string; destination: string; calculations: number; errors: number; linked_calls: number }[];
  targets: { name: string; source: string; target: string; target_language: string; count: number }[];
  daily: { day: string; country: string; views: number; calculations: number; calls: number }[];
};
export type SessionRow = {
  visit: string; first_at: string; last_at: string; span_seconds: number; countries: string[]; languages: string[]; devices: string[];
  actions: number; views: number; calculations: number; successes: number; errors: number; calls: number; linked_calls: number;
  timing_samples: number; visible_ms: number; active_ms: number; recorded_start: boolean;
};
export type JourneyEvent = ActivityEvent & {
  country?: string; value?: number; target?: string; target_language?: string;
  calculation_id?: string; call_delay_seconds?: number; visible_ms?: number; active_ms?: number; measurement_version?: number;
};
export type SessionReport = { total: number; events_total: number; sessions: SessionRow[]; events: JourneyEvent[]; retained_from: string; updated_at: string };
