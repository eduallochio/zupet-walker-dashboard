'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { Check } from 'lucide-react';
import { atualizarStatusPagamento } from '@/app/dashboard/financeiro/actions';
import { resolverAgendamentoAtrasado } from '@/app/dashboard/pendencias-actions';

const ok = { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#86EFAC' } as const;
const err = { fontSize: 12, color: '#FCA5A5' } as const;

export function MarcarPago({ paymentId }: { paymentId: string }) {
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  if (done) return <span className="zw-pop" style={ok}><Check size={16} strokeWidth={3} aria-hidden />Pago</span>;

  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
      <button
        className="zw-btn zw-btn-ghost zw-btn-s"
        disabled={pending}
        onClick={() => start(async () => {
          setErro(null);
          const r = await atualizarStatusPagamento(paymentId, 'paid');
          if (r.error) setErro('Não deu certo. Tente de novo.');
          else setDone(true);
        })}
      >
        {pending ? 'Salvando…' : 'Marcar como pago'}
      </button>
      {erro && <span style={err}>{erro}</span>}
    </span>
  );
}

export function ResolverAtrasado({ scheduleId }: { scheduleId: string }) {
  const [pending, start] = useTransition();
  const [resultado, setResultado] = useState<'done' | 'cancelled' | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  if (resultado) {
    return <span className="zw-pop" style={ok}><Check size={16} strokeWidth={3} aria-hidden />{resultado === 'done' ? 'Registrado' : 'Marcado como não realizado'}</span>;
  }

  const run = (r: 'done' | 'cancelled') => start(async () => {
    setErro(null);
    const res = await resolverAgendamentoAtrasado(scheduleId, r);
    if (res.error) setErro('Não deu certo. Tente de novo.');
    else setResultado(r);
  });

  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
      <span style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <button className="zw-btn zw-btn-primary zw-btn-s" disabled={pending} onClick={() => run('done')}>Foi realizado</button>
        <button className="zw-btn zw-btn-ghost zw-btn-s" disabled={pending} onClick={() => run('cancelled')}>Não aconteceu</button>
        <Link className="zw-btn zw-btn-ghost zw-btn-s" href="/dashboard/agenda">Remarcar</Link>
      </span>
      {erro && <span style={err}>{erro}</span>}
    </span>
  );
}

export function CopiarLink({ url }: { url: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <button
      className="zw-btn zw-btn-ghost"
      onClick={async () => {
        try { await navigator.clipboard.writeText(url); setCopiado(true); setTimeout(() => setCopiado(false), 2000); } catch {}
      }}
    >
      {copiado ? 'Link copiado' : 'Copiar meu link'}
    </button>
  );
}
