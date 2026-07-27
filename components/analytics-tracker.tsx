'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Extract story slug if the user is visiting a story read page (e.g. /read/story-slug)
    let storySlug: string | null = null;
    if (pathname.startsWith('/read/')) {
      storySlug = pathname.replace('/read/', '');
    }

    // Send tracking POST request
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page_url: pathname,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
        story_slug: storySlug,
      }),
    }).catch((err) => console.error('Failed to log analytics:', err));
  }, [pathname]);

  return null;
}
