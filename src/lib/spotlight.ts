/**
 * Drives the `.spotlight` CSS class (globals.css): a gold radial that follows
 * the cursor inside a card. Attach as `onMouseMove` - hover-only by nature, so
 * it is inert on touch devices and costs nothing there.
 */
export function trackSpotlight(e: React.MouseEvent<HTMLElement>) {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
  e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
}
