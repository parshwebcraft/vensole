'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function ContentProtector() {
  const pathname = usePathname();

  useEffect(() => {
    // Allow developer tools on admin and analytics routes, or if secret debug parameters are present in the URL
    const searchParams = new URLSearchParams(window.location.search);
    const isDebugMode = searchParams.get('debug') === 'true' || searchParams.get('dev') === 'true';

    if (pathname.startsWith('/admin') || pathname.startsWith('/analytics') || isDebugMode) {
      return;
    }

    const preventRightClick = (e: MouseEvent) => {
      e.preventDefault();
    };

    const preventDevTools = (e: KeyboardEvent) => {
      // Disable F12
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+U or Cmd+Opt+U (View Source)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+Shift+I or Cmd+Opt+I (Inspect element)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        return false;
      }
      if (e.metaKey && e.altKey && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+Shift+J or Cmd+Opt+J (Console)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        return false;
      }
      if (e.metaKey && e.altKey && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+Shift+C or Cmd+Opt+C (Inspector)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        return false;
      }
      if (e.metaKey && e.altKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+S or Cmd+S (Save page)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('contextmenu', preventRightClick);
    document.addEventListener('keydown', preventDevTools);

    return () => {
      document.removeEventListener('contextmenu', preventRightClick);
      document.removeEventListener('keydown', preventDevTools);
    };
  }, [pathname]);

  return null;
}
