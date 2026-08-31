import type { Metadata } from 'next';
import { SlidesClient } from './slides-client';

export const metadata: Metadata = {
  title: 'Slides — Zupet Walker',
  description: 'Apresentação do Zupet Walker em formato de slides.',
  robots: { index: false },
};

export default function SlidesPage() {
  return <SlidesClient />;
}
