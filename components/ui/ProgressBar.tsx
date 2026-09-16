'use client';

import { AppProgressBar } from 'next-nprogress-bar';

export default function ProgressBar() {
  return (
    <AppProgressBar
      height="3px"
      color="#00C6A7"
      options={{ showSpinner: false }}
      shallowRouting
    />
  );
}
