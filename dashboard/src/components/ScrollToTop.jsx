import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * Automatically scrolls to top on route change
 * Instant scroll (no smooth) for better UX - page animations handle visual transition
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Instant scroll to top (animations handle the visual smoothness)
    window.scrollTo(0, 0);
  }, [pathname]);

  return null; // This component doesn't render anything
}
