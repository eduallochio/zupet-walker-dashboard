'use client';

import { useEffect, useRef, useState } from 'react';

export function QRCodeSection({ username }: { username: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [open, setOpen] = useState(false);
  const url = `https://walker.zupet.io/w/${username}`;

  useEffect(() => {
    if (!open || !canvasRef.current) return;
    // Carrega qrcode.js dinamicamente apenas quando o painel abre
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
    script.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      // limpa antes de regenerar
      canvas.innerHTML = '';
      // @ts-ignore
      new window.QRCode(canvas, {
        text: url,
        width: 200,
        height: 200,
        colorDark: '#00C6A7',
        colorLight: '#0D1F18',
        correctLevel: (window as any).QRCode?.CorrectLevel?.H,
      });
    };
    if (!document.querySelector(`script[src="${script.src}"]`)) {
      document.head.appendChild(script);
    } else {
      script.onload?.(new Event('load'));
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
          <div ref={canvasRef} style={{ borderRadius: 8, overflow: 'hidden' }} />
          <p style={{ fontSize: 11, color: '#4A6B60', margin: 0 }}>
            Escaneie para acessar este perfil
          </p>
        </div>
      )}
    </div>
  );
}
