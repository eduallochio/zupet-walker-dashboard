'use client';
import { useState } from 'react';
import ChromaGrid, { ChromaItem } from './chroma-grid';
import { WalkerModal } from './walker-modal';

interface WalkersGridClientProps {
  items: ChromaItem[];
}

export function WalkersGridClient({ items }: WalkersGridClientProps) {
  const [selected, setSelected] = useState<ChromaItem | null>(null);

  return (
    <>
      <ChromaGrid items={items} radius={320} onCardClick={setSelected} />
      <WalkerModal item={selected} onClose={() => setSelected(null)} />
    </>
  );
}
