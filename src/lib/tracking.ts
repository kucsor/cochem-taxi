'use client';

import { track } from '@vercel/analytics';

export type TrackedEvent =
  | 'click_call_now'
  | 'click_calculator'
  | 'click_scroll_top'
  | 'use_calculator'
  | 'calculator_success'
  | 'calculator_error'
  | 'click_locate_me'
  | 'change_language'
  | 'view_legal'
  | 'click_home_nav'
  | 'click_services_nav'
  | 'load_map_click'
  | 'view_activities'
  | 'click_activity_widget'
  | 'click_affiliate_link'
  | 'consent_accept'
  | 'consent_reject';

/**
 * The events that actually represent money: a phone call placed, a fare
 * calculated, an affiliate link followed. These are the numbers you need to
 * show the taxi company how many bookings this site sends them.
 */
const CONVERSION_EVENTS: ReadonlySet<TrackedEvent> = new Set<TrackedEvent>([
  'click_call_now',
  'use_calculator',
  'calculator_success',
  'click_affiliate_link',
  'view_activities',
]);

/**
 * Tracks a custom event.
 *
 * Two destinations, deliberately:
 * - Google Analytics: only after cookie consent, so it under-counts by design.
 * - Vercel Analytics: cookieless and needs no consent, so conversions are
 *   counted for 100% of visitors. Without this, every visitor who declines
 *   cookies would be invisible - which is most of them.
 */
export function trackEvent(
  actionName: TrackedEvent,
  params?: Record<string, string | number | undefined>
) {
  const eventParams = {
    event_category: 'UserActions',
    ...params,
  };

  // Google Analytics - present only once consent has been granted.
  if (typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', actionName, eventParams);
  }

  // Vercel Analytics - cookieless, always counted. Keep the payload to plain
  // strings/numbers; undefined values are dropped.
  if (CONVERSION_EVENTS.has(actionName)) {
    const properties: Record<string, string | number> = {};
    for (const [key, value] of Object.entries(params ?? {})) {
      if (value !== undefined) properties[key] = value;
    }
    track(actionName, Object.keys(properties).length > 0 ? properties : undefined);
  }
}
