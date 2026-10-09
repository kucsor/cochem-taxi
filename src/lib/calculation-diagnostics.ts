// Only fixed codes may enter analytics; never store provider messages or addresses.
export const calculationOutcomes = [
  "network_or_timeout", "request_failed", "geocoding", "geocoding_start",
  "geocoding_end", "geocoding_both", "routing", "rate_limited", "validation",
  "server_error", "cochem_only", "forbidden", "success",
] as const;
export function calculationOutcome(code: unknown): (typeof calculationOutcomes)[number] {
  return calculationOutcomes.includes(code as (typeof calculationOutcomes)[number]) && code !== "success"
    ? code as (typeof calculationOutcomes)[number] : "request_failed";
}
export const failureDetails: Record<string, { title: string; explanation: string; action: string }> = {
  cochem_only: { title: "Airport route outside service rules", explanation: "Airport pickup was requested, or an airport transfer started outside the allowed Cochem area.", action: "Airport transfers must start in the allowed Cochem area and end at the airport. This is an intentional restriction." },
  forbidden: { title: "Request rejected by origin check", explanation: "The request did not pass the same-origin security check.", action: "If repeated during normal use, check the deployed domain and request headers." },
  geocoding_start: { title: "Pickup could not be located", explanation: "The map service could not resolve the pickup.", action: "Select a pickup from the suggested places and retry." },
  geocoding_end: { title: "Destination could not be located", explanation: "The map service could not resolve the destination.", action: "Select a destination from the suggested places and retry." },
  geocoding_both: { title: "Neither place could be located", explanation: "The map service could not resolve either endpoint.", action: "Select both places from the suggestions and retry." },
  geocoding: { title: "Place lookup failed", explanation: "This older event did not identify which endpoint failed.", action: "Check selected places; repeated failures may need a map-service check." },
  routing: { title: "No driving route returned", explanation: "The routing service returned no usable driving route.", action: "Retry with accessible road locations; investigate the map service if widespread." },
  rate_limited: { title: "Too many requests", explanation: "The calculator temporarily limited requests.", action: "Wait before retrying. This can be normal during repeated testing." },
  validation: { title: "Invalid calculation input", explanation: "Required input was missing, invalid or too large.", action: "Check both places, passenger group and pickup time." },
  server_error: { title: "Calculator service unavailable", explanation: "The server or its map provider failed to complete the request.", action: "Check server and provider logs around this timestamp if it repeats." },
  network_or_timeout: { title: "Connection or response failure", explanation: "The browser could not finish the request or read its response. A timeout is one possible cause.", action: "Retry on a stable connection; this event alone cannot identify the underlying service." },
  request_failed: { title: "Reason not recorded", explanation: "The request failed, but this event contains no specific cause. Historical causes cannot be reconstructed.", action: "Use the recorded context below. New events distinguish service restrictions and place-lookup failures." },
};
export function describeFailure(code?: string | null) {
  return failureDetails[code || ""] || failureDetails.request_failed;
}
