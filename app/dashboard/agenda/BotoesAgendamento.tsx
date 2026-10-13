'use client';

import { useState, useTransition } from 'react';
import { Check, X } from 'lucide-react';
import { atualizarStatusAgendamento } from './actions';

type Acao = 'confirmed' | 'cancelled';

const PERIGO = { color: '#FCA5A5', borderColor: 'rgba(252,165,165,0.4)' };

export function BotoesAgendamento({ scheduleId }: { scheduleId: string }) {
  const [isPending, startTransition] = useTransition();
  const [confirmando, setConfirmando] = useState<Acao | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  function atualizar(newStatus: Acao) {
    setErro(null);
    startTransition(async () => {
      const result = await atualizarStatusAgendamento(scheduleId, newStatus);
      if (result.error) setErro(result.error);
      setConfirmando(null);
    });
  }

  if (isPending) {
    return <span style={{ fontSize: 13, color: '#A3BCB0' }}>Salvando…</span>;
  }

  if (confirmando) {
    const aceitar = confirmando === 'confirmed';
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: '#EEF6F1' }}>
          {aceitar ? 'Aceitar esta solicitação?' : 'Recusar esta solicitação?'}
        </span>
        <button
          className={`zw-btn zw-btn-s ${aceitar ? 'zw-btn-primary' : 'zw-btn-ghost'}`}
          style={aceitar ? undefined : PERIGO}
          onClick={() => atualizar(confirmando)}
        >
          {aceitar ? 'Sim, aceitar' : 'Sim, recusar'}
        </button>
        <button className="zw-btn zw-btn-s zw-btn-ghost" onClick={() => setConfirmando(null)}>
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="zw-btn zw-btn-s zw-btn-primary" onClick={() => setConfirmando('confirmed')}>
          <Check size={14} aria-hidden /> Aceitar
        </button>
        <button className="zw-btn zw-btn-s zw-btn-ghost" style={PERIGO} onClick={() => setConfirmando('cancelled')}>
          <X size={14} aria-hidden /> Recusar
        </button>
      </div>
      {erro && <span role="alert" style={{ fontSize: 12, color: '#FCA5A5' }}>Não foi possível salvar: {erro}</span>}
    </div>
  );
}
