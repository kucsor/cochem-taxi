/**
 * JS-initiated smooth scrolling ignores the CSS `scroll-behavior` override in
 * the reduced-motion media query, so callers pick the behavior explicitly.
 */
export function scrollBehavior(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'auto'
    : 'smooth';
}
