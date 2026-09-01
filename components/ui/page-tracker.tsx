'use client';

import { useEffect } from 'react';

export function PageTracker() {
  useEffect(() => {
    fetch('/api/track/pageview', { method: 'POST' }).catch(() => {});
  }, []);

  return null;
}
