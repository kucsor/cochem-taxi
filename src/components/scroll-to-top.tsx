'use client';

import { useEffect } from 'react';

export function ScrollToTop() {
  useEffect(() => {
    // Respect anchor navigation (e.g. /de#rechner from the bottom nav) -
    // forcing scroll(0,0) here used to fight the browser's hash scrolling.
    if (window.location.hash) return;

    // Scroll to top on page load/navigation
    window.scrollTo(0, 0);

    // Also handle browser back/forward buttons
    const handlePopState = () => {
      if (window.location.hash) return;
      window.scrollTo(0, 0);
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return null; // This component doesn't render anything
}