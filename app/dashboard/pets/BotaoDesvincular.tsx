'use client';

import { useState, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { desvincularPet } from './actions';

const C = {
  border: 'rgba(134,239,172,0.12)',
  text: '#EEF6F1', textSec: '#A3BCB0',
  danger: '#FCA5A5', dangerDim: 'rgba(252,165,165,0.1)',
  warning: '#FBBF24',
};

type Step = 'idle' | 'confirmUnlink' | 'confirmPayments' | 'confirmSchedules';

export function BotaoDesvincular({
  linkId, petId, ownerId, petName,
}: {
  linkId: string;
  petId: string;
  ownerId: string | null;
  petName: string;
}) {
  const [step, setStep] = useState<Step>('idle');
  const [cancelPayments, setCancelPayments] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  const executar = (cancelPay: boolean, cancelSched: boolean) => {
    setErro(null);
    startTransition(async () => {
      const result = await desvincularPet(linkId, petId, ownerId, cancelPay, cancelSched);
      if (result.error) setErro(result.error);
      else setStep('idle');
    });
  };

  if (step === 'idle') {
    return (
      <button onClick={() => setStep('confirmUnlink')} className="zw-btn zw-btn-s zw-btn-ghost" style={{ color: C.danger, borderColor: 'rgba(252,165,165,0.35)' }}>
        Desvincular
      </button>
    );
  }

  const overlay: React.CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
    zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
  };
  const box: React.CSSProperties = {
    background: '#11201B', borderRadius: 16, padding: 24,
    border: '1px solid rgba(134,239,172,0.2)', maxWidth: 380, width: '100%', gap: 16,
    display: 'flex', flexDirection: 'column',
  };
  const btn = (color: string, bg: string, border: string): React.CSSProperties => ({
    flex: 1, padding: '10px 0', borderRadius: 10, border,
    background: bg, color, fontSize: 13, fontWeight: 700, cursor: 'pointer',
  });

  return (
    <>
      <button onClick={() => setStep('confirmUnlink')} className="zw-btn zw-btn-s zw-btn-ghost" style={{ color: C.danger, borderColor: 'rgba(252,165,165,0.35)' }}>
        Desvincular
      </button>

      {createPortal(
      <div style={overlay} onClick={() => setStep('idle')}>
        <div style={box} onClick={(e) => e.stopPropagation()}>

          {step === 'confirmUnlink' && (
            <>
              <p style={{ fontSize: 16, fontWeight: 800, color: C.text, textAlign: 'center' }}>Desvincular {petName}?</p>
              <p style={{ fontSize: 13, color: C.textSec, textAlign: 'center', lineHeight: 1.5 }}>
                O tutor será notificado. O vínculo será encerrado.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStep('idle')} style={btn(C.textSec, 'transparent', `1px solid ${C.border}`)}>Cancelar</button>
                <button onClick={() => setStep('confirmPayments')} style={btn(C.danger, C.dangerDim, `1px solid rgba(248,113,113,0.35)`)}>Desvincular</button>
              </div>
            </>
          )}

          {step === 'confirmPayments' && (
            <>
              <p style={{ fontSize: 16, fontWeight: 800, color: C.text, textAlign: 'center' }}>Pagamentos pendentes</p>
              <p style={{ fontSize: 13, color: C.textSec, textAlign: 'center', lineHeight: 1.5 }}>
                Deseja cancelar os pagamentos pendentes de <strong style={{ color: C.text }}>{petName}</strong>?
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => { setCancelPayments(false); setStep('confirmSchedules'); }}
                  style={btn(C.textSec, 'transparent', `1px solid ${C.border}`)}
                >
                  Não cancelar
                </button>
                <button
                  onClick={() => { setCancelPayments(true); setStep('confirmSchedules'); }}
                  style={btn(C.warning, 'rgba(251,191,36,0.1)', `1px solid rgba(251,191,36,0.3)`)}
                >
                  Cancelar pagamentos
                </button>
              </div>
            </>
          )}

          {erro && <p role="alert" style={{ fontSize: 13, color: C.danger, textAlign: 'center' }}>Não foi possível desvincular: {erro}</p>}

          {step === 'confirmSchedules' && (
            <>
              <p style={{ fontSize: 16, fontWeight: 800, color: C.text, textAlign: 'center' }}>Agendamentos futuros</p>
              <p style={{ fontSize: 13, color: C.textSec, textAlign: 'center', lineHeight: 1.5 }}>
                Deseja cancelar os agendamentos futuros de <strong style={{ color: C.text }}>{petName}</strong>?
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => executar(cancelPayments, false)}
                  disabled={isPending}
                  style={btn(C.textSec, 'transparent', `1px solid ${C.border}`)}
                >
                  {isPending ? 'Salvando...' : 'Não cancelar'}
                </button>
                <button
                  onClick={() => executar(cancelPayments, true)}
                  disabled={isPending}
                  style={btn(C.warning, 'rgba(251,191,36,0.1)', `1px solid rgba(251,191,36,0.3)`)}
                >
                  {isPending ? 'Salvando...' : 'Cancelar agendamentos'}
                </button>
              </div>
            </>
          )}

        </div>
      </div>,
        document.body,
      )}
    </>
  );
}
