'use client';

import { useState, useTransition } from 'react';
import { atualizarStatusPagamento } from './actions';
import { T } from '@/components/walker/dash-ui';
import { brl, dataCurta } from '@/lib/format';

const MONTHS_PT = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];

const STATUS: Record<string, { label: string; fg: string; bg: string }> = {
  paid:      { label: 'Pago',      fg: T.accentLt, bg: T.accentDim },
  pending:   { label: 'Pendente',  fg: T.amber,    bg: T.amberDim },
  cancelled: { label: 'Cancelado', fg: T.muted,    bg: 'rgba(255,255,255,0.06)' },
};

const TIPO_LABEL: Record<string, string> = {
  walk: 'Passeio', bath: 'Banho e Tosa', boarding: 'Hospedagem', daycare: 'Day Care',
  vet_visit: 'Visita Veterinária', training: 'Adestramento',
  per_session: 'Por sessão', daily: 'Diário', weekly: 'Semanal', monthly: 'Mensal',
};

const METODO_LABEL: Record<string, string> = { cash: 'Dinheiro', pix: 'PIX', card: 'Cartão' };

type Payment = {
  id: string;
  amount: number;
  status: string;
  billing_type: string;
  service_type?: string;
  payment_method?: string;
  description?: string;
  created_at: string;
  owner_id?: string;
};

const th: React.CSSProperties = {
  textAlign: 'left', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
  color: T.label, padding: '12px 18px', borderBottom: `1px solid ${T.line}`, whiteSpace: 'nowrap',
};
const td: React.CSSProperties = { padding: '14px 18px', borderTop: `1px solid ${T.line}`, whiteSpace: 'nowrap', fontSize: 14 };

function PaymentRow({ p, ownerName }: { p: Payment; ownerName: string }) {
  const [isPending, startTransition] = useTransition();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [erro, setErro] = useState(false);
  const st = STATUS[p.status] ?? STATUS.cancelled;

  function atualizar(novoStatus: 'paid' | 'cancelled') {
    setErro(false);
    startTransition(async () => {
      const r = await atualizarStatusPagamento(p.id, novoStatus);
      if (r.error) setErro(true);
      setConfirmCancel(false);
    });
  }

  const tipo = TIPO_LABEL[p.service_type ?? p.billing_type] ?? p.description ?? '—';
  const detalhe = p.payment_method ? METODO_LABEL[p.payment_method] ?? p.payment_method : p.description && p.description !== tipo ? p.description : null;

  return (
    <tr style={{ opacity: isPending ? 0.6 : 1 }}>
      <td style={{ ...td, color: T.muted }}>{dataCurta(p.created_at)}</td>
      <td style={{ ...td, fontWeight: 700 }}>{ownerName}</td>
      <td style={td}>
        <div>{tipo}</div>
        {detalhe && <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{detalhe}</div>}
      </td>
      <td style={{ ...td, textAlign: 'right', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{brl(p.amount)}</td>
      <td style={td}>
        <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20, color: st.fg, background: st.bg }}>{st.label}</span>
      </td>
      <td style={{ ...td, textAlign: 'right' }}>
        {p.status === 'pending' && !confirmCancel && (
          <span style={{ display: 'inline-flex', gap: 8 }}>
            <button className="zw-btn zw-btn-ghost zw-btn-s" disabled={isPending} onClick={() => atualizar('paid')}>Marcar como pago</button>
            <button className="zw-btn zw-btn-ghost zw-btn-s" disabled={isPending} onClick={() => setConfirmCancel(true)} style={{ color: T.danger }}>Cancelar</button>
          </span>
        )}
        {p.status === 'pending' && confirmCancel && (
          <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: T.muted }}>Cancelar esta cobrança?</span>
            <button className="zw-btn zw-btn-ghost zw-btn-s" disabled={isPending} onClick={() => setConfirmCancel(false)}>Não</button>
            <button className="zw-btn zw-btn-ghost zw-btn-s" disabled={isPending} onClick={() => atualizar('cancelled')} style={{ color: T.danger }}>Sim, cancelar</button>
          </span>
        )}
        {erro && <div style={{ fontSize: 12, color: T.danger, marginTop: 4 }}>Não deu certo. Tente de novo.</div>}
      </td>
    </tr>
  );
}

export function TabelaPagamentos({ payments, ownerNames, viewMonth }: {
  payments: Payment[];
  ownerNames: Record<string, string>;
  viewMonth: number;
  viewYear: number;
}) {
  const [statusFilter, setStatusFilter] = useState<'todos' | 'pending' | 'paid' | 'cancelled'>('todos');
  const filtered = statusFilter === 'todos' ? payments : payments.filter((p) => p.status === statusFilter);
  const filtros = [['todos', 'Todos'], ['pending', 'Pendentes'], ['paid', 'Pagos'], ['cancelled', 'Cancelados']] as const;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, padding: '16px 18px' }}>
        <h2 style={{ fontSize: 16, fontWeight: 800 }}>Lançamentos</h2>
        <div role="tablist" aria-label="Filtrar lançamentos" style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.line}`, flexWrap: 'wrap' }}>
          {filtros.map(([f, label]) => (
            <button
              key={f}
              role="tab"
              aria-selected={statusFilter === f}
              onClick={() => setStatusFilter(f)}
              style={{
                border: 0, cursor: 'pointer', font: '700 13px var(--font)', padding: '8px 12px', borderRadius: 9,
                background: statusFilter === f ? T.card2 : 'transparent', color: statusFilter === f ? T.text : T.muted,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: '28px 18px', textAlign: 'center', color: T.muted, fontSize: 14, borderTop: `1px solid ${T.line}` }}>
          {statusFilter === 'todos' ? `Nenhum lançamento em ${MONTHS_PT[viewMonth]}.` : 'Nenhum lançamento neste filtro.'}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: T.text }}>
            <thead>
              <tr>
                <th style={th}>Data</th>
                <th style={th}>Tutor</th>
                <th style={th}>Serviço</th>
                <th style={{ ...th, textAlign: 'right' }}>Valor</th>
                <th style={th}>Status</th>
                <th style={{ ...th, textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <PaymentRow key={p.id} p={p} ownerName={ownerNames[p.owner_id ?? ''] ?? '—'} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
