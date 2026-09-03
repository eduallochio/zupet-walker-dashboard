'use client';

import { useEffect, useRef, useState } from 'react';

export function QRCodeSection({ username }: { username: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const url = `https://walker.zupet.io/w/${username}`;

  useEffect(() => {
    if (!open || !containerRef.current) return;
    const container = containerRef.current;

    const generate = () => {
      // Limpa conteúdo anterior
      container.innerHTML = '';
      // @ts-ignore
      new window.QRCode(container, {
        text: url,
        width: 200,
        height: 200,
        colorDark: '#00C6A7',
        colorLight: '#0D1F18',
        correctLevel: (window as any).QRCode?.CorrectLevel?.H,
      });
    };

    const src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      // Lib já carregada
      if ((window as any).QRCode) generate();
      else existing.addEventListener('load', generate, { once: true });
    } else {
      const script = document.createElement('script');
      script.src = src;
      script.onload = generate;
      document.head.appendChild(script);
    }
  }, [open, url]);

  return (
    <div style={{ marginTop: 12, textAlign: 'center' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'transparent', border: '1px solid rgba(0,198,167,0.2)',
          color: '#4A6B60', fontSize: 12, fontWeight: 600,
          padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3z M17 17h3v3h-3z M14 20h3"/>
        </svg>
        {open ? 'Fechar QR Code' : 'Ver QR Code'}
      </button>

      {open && (
        <div style={{ marginTop: 16, display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 10,
          background: '#0D1F18', border: '1px solid rgba(0,198,167,0.18)', borderRadius: 16, padding: '20px 24px' }}>
          <div ref={containerRef} style={{ borderRadius: 8, overflow: 'hidden' }} />
          <p style={{ fontSize: 11, color: '#4A6B60', margin: 0 }}>
            Escaneie para acessar este perfil
          </p>
        </div>
      )}
    </div>
  );
}
