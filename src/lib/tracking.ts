'use client';

/**
 * Tracks a custom event with Google Analytics.
 * @param actionName - The name of the action to track.
 * @param params - Optional parameters to send with the event.
 */
export function trackEvent(
  actionName:
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
    | 'load_map_click',
  params?: Record<string, string | number | undefined>
) {
  const eventParams = {
    event_category: 'UserActions',
    ...params,
  };

  // Check if the gtag function is available on the window object
  if (typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', actionName, eventParams);
  } else {
    // Fallback to console.log if Google Analytics is not available
    console.log(`GA Event tracked (fallback): ${actionName}`, eventParams);
  }
}
