'use client';

import { useTransition } from 'react';
import { atualizarStatusAgendamento } from './actions';

export function BotoesAgendamento({ scheduleId }: { scheduleId: string }) {
  const [isPending, startTransition] = useTransition();

  function atualizar(newStatus: 'confirmed' | 'cancelled') {
    if (!confirm(newStatus === 'confirmed' ? 'Aceitar este agendamento?' : 'Recusar este agendamento?')) return;
    startTransition(async () => {
      const result = await atualizarStatusAgendamento(scheduleId, newStatus);
      if (result.error) alert('Erro: ' + result.error);
    });
  }

  if (isPending) {
    return <span style={{ fontSize: 11, color: '#7FA898' }}>Salvando...</span>;
  }

  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <button
        onClick={() => atualizar('confirmed')}
        style={{
          padding: '5px 14px', borderRadius: 20, border: 'none',
          background: '#00A88E', color: '#fff',
          fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
        }}
      >
        ✓ Aceitar
      </button>
      <button
        onClick={() => atualizar('cancelled')}
        style={{
          padding: '5px 14px', borderRadius: 20,
          border: '1px solid rgba(248,113,113,0.4)',
          background: 'rgba(248,113,113,0.1)', color: '#F87171',
          fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
        }}
      >
        ✕ Recusar
      </button>
    </div>
  );
}
