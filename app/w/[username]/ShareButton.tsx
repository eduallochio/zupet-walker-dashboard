'use client';

import { useState } from 'react';

export function ShareButton({ name, username }: { name: string; username: string }) {
  const [copied, setCopied] = useState(false);

  const url = `https://walker.zupet.io/w/${username}`;
  const text = `Confira o perfil de ${name} no Zupet Walker!`;

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: `${name} — Zupet Walker`, text, url });
        return;
      } catch {
        // usuário cancelou ou não suportado
      }
    }
    // fallback: copiar link
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <button
      onClick={handleShare}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        background: 'rgba(0,198,167,0.10)',
        border: '1.5px solid rgba(0,198,167,0.28)',
        color: '#00C6A7',
        fontWeight: 700,
        fontSize: 13,
        padding: '8px 18px',
        borderRadius: 40,
        cursor: 'pointer',
        transition: 'background 0.15s',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,198,167,0.18)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,198,167,0.10)')}
    >
      {copied ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Link copiado!
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Indicar esse profissional
        </>
      )}
    </button>
  );
}
