'use client';

import { Suspense } from 'react';
import { AppProgressBar } from 'next-nprogress-bar';

function Bar() {
  return (
    <AppProgressBar
      height="3px"
      color="#00C6A7"
      options={{ showSpinner: false }}
      shallowRouting
    />
  );
}

export default function ProgressBar() {
  return (
    <Suspense fallback={null}>
      <Bar />
    </Suspense>
  );
}
