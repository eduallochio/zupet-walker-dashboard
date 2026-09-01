'use client';

import { useState, useTransition } from 'react';
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
  const [isPending, startTransition] = useTransition();

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
        onClick={() => setOpen(o => !o)}
        style={{
          padding: '4px 12px', borderRadius: 20, border: '1px solid rgba(0,168,142,0.4)',
          background: 'rgba(0,168,142,0.1)', color: '#00A88E',
          fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
        }}
      >
        + Registrar pagamento ▾
      </button>

      {open && (
        <>
          {/* overlay para fechar ao clicar fora */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 10 }}
          />
          <div style={{
            position: 'absolute', right: 0, top: '110%', zIndex: 20,
            background: '#132219', border: '1px solid rgba(0,200,167,0.2)',
            borderRadius: 10, overflow: 'hidden', minWidth: 140,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}>
            {METODOS.map(m => (
              <button
                key={m.value}
                onClick={() => registrar(m.value)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '9px 14px', border: 'none', background: 'transparent',
                  color: '#E8F5F0', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  borderBottom: m.value !== 'card' ? '1px solid rgba(0,200,167,0.1)' : 'none',
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
