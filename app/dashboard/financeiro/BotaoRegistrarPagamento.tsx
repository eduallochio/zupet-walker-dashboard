'use client';

import { useTransition } from 'react';
import { registrarPagamentoDinheiro } from './actions';

export function BotaoRegistrarPagamento({
  scheduleId, ownerId, serviceType, amount,
}: {
  scheduleId: string;
  ownerId: string;
  serviceType: string;
  amount: number;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await registrarPagamentoDinheiro(scheduleId, ownerId, serviceType, amount);
      if (result.error) alert('Erro: ' + result.error);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      style={{
        padding: '4px 12px', borderRadius: 20, border: '1px solid #00A88E',
        background: isPending ? 'rgba(0,168,142,0.2)' : 'rgba(0,168,142,0.12)',
        color: '#00A88E', fontSize: 11, fontWeight: 700,
        cursor: isPending ? 'default' : 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.15s',
      }}
    >
      {isPending ? '...' : '💵 Registrar dinheiro'}
    </button>
  );
}
