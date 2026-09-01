'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { registrarPagamentoDinheiro } from './actions';

const METODOS = [
  { value: 'cash', label: '💵 Dinheiro' },
  { value: 'pix',  label: '📲 PIX' },
  { value: 'card', label: '💳 Cartão' },
];

export function BotaoRegistrarPagamento({
  scheduleId, ownerId, serviceType, amount,
}: {
  scheduleId: string;
  ownerId: string;
  serviceType: string;
  amount: number;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const [isPending, startTransition] = useTransition();
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, right: window.innerWidth - r.right });
    }
  }, [open]);

  function registrar(method: string) {
    setOpen(false);
    startTransition(async () => {
      const result = await registrarPagamentoDinheiro(scheduleId, ownerId, serviceType, amount, method);
      if (result.error) alert('Erro: ' + result.error);
    });
  }

  if (isPending) {
    return <span style={{ fontSize: 11, color: '#7FA898' }}>Salvando...</span>;
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        ref={btnRef}
        onClick={() => setOpen(o => !o)}
        style={{
          padding: '4px 12px', borderRadius: 20, border: '1px solid rgba(0,168,142,0.4)',
          background: 'rgba(0,168,142,0.1)', color: '#00A88E',
          fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
        }}
      >
        + Registrar ▾
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
          <div style={{
            position: 'fixed',
            top: pos.top,
            right: pos.right,
            zIndex: 20,
            background: '#132219',
            border: '1px solid rgba(0,200,167,0.2)',
            borderRadius: 10,
            overflow: 'hidden',
            minWidth: 140,
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          }}>
            {METODOS.map((m, i) => (
              <button
                key={m.value}
                onClick={() => registrar(m.value)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '9px 14px', border: 'none', background: 'transparent',
                  color: '#E8F5F0', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  borderBottom: i < METODOS.length - 1 ? '1px solid rgba(0,200,167,0.1)' : 'none',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,198,167,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {m.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
