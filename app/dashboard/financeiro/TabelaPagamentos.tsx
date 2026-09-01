'use client';

import { useState, useTransition } from 'react';
import { atualizarStatusPagamento } from './actions';

const MONTHS_PT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

const STATUS_LABEL: Record<string, string> = {
  paid:      'Pago',
  pending:   'Pendente',
  cancelled: 'Cancelado',
};
const STATUS_COLOR: Record<string, { color: string; bg: string }> = {
  paid:      { color: '#fff',    bg: '#00A88E' },
  pending:   { color: '#92400e', bg: '#fef3c7' },
  cancelled: { color: '#6B7280', bg: '#f3f4f6' },
};

const BILLING_TYPE_LABEL: Record<string, string> = {
  walk:        '🦮 Passeio',
  bath:        '🛁 Banho e Tosa',
  boarding:    '🌙 Hospedagem',
  daycare:     '🏠 Creche',
  vet_visit:   '🏥 Visita ao Vet',
  training:    '🎯 Adestramento',
  per_session: '📋 Por sessão',
  daily:       '📅 Diário',
  weekly:      '📆 Semanal',
  monthly:     '🗓️ Mensal',
};

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  cash: '💵 Dinheiro',
  pix:  '📲 PIX',
  card: '💳 Cartão',
};

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

function formatCurrency(v: number) {
  return `R$ ${v.toFixed(2).replace('.', ',')}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' });
}

function PaymentRow({ p, ownerName }: { p: Payment; ownerName: string }) {
  const [isPending, startTransition] = useTransition();
  const sc = STATUS_COLOR[p.status] ?? { color: '#fff', bg: '#6B7280' };

  function atualizar(novoStatus: 'paid' | 'cancelled') {
    startTransition(async () => {
      await atualizarStatusPagamento(p.id, novoStatus);
    });
  }

  return (
    <tr style={{ borderTop: '1px solid rgba(0,200,167,0.12)', opacity: isPending ? 0.6 : 1 }}>
      <td style={{ padding: '12px 20px', color: '#b0cdc9', fontSize: 13 }}>{formatDate(p.created_at)}</td>
      <td style={{ padding: '12px 20px', color: '#e0f2ef', fontSize: 13, fontWeight: 500 }}>{ownerName}</td>
      <td style={{ padding: '12px 20px', color: '#b0cdc9', fontSize: 13 }}>
        <div>{BILLING_TYPE_LABEL[p.service_type ?? p.billing_type] ?? p.description ?? '—'}</div>
        {p.payment_method && (
          <div style={{ fontSize: 11, color: '#4A6B60', marginTop: 2 }}>
            {PAYMENT_METHOD_LABEL[p.payment_method] ?? p.payment_method}
          </div>
        )}
        {!p.payment_method && p.description && (
          <div style={{ fontSize: 11, color: '#4A6B60', marginTop: 2 }}>{p.description}</div>
        )}
      </td>
      <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 700, color: '#00A88E', fontVariantNumeric: 'tabular-nums', fontSize: 13 }}>
        {formatCurrency(p.amount ?? 0)}
      </td>
      <td style={{ padding: '12px 20px', textAlign: 'center' }}>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20,
          color: sc.color, background: sc.bg,
          display: 'inline-block',
        }}>
          {STATUS_LABEL[p.status] ?? p.status}
        </span>
      </td>
      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
        {p.status === 'pending' && (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
            <button
              onClick={() => atualizar('paid')}
              disabled={isPending}
              style={{
                padding: '4px 10px', borderRadius: 6, border: '1px solid #00A88E',
                background: '#00A88E', color: '#fff', fontSize: 11, fontWeight: 700,
                cursor: isPending ? 'default' : 'pointer',
              }}
            >
              ✓ Pago
            </button>
            <button
              onClick={() => atualizar('cancelled')}
              disabled={isPending}
              style={{
                padding: '4px 10px', borderRadius: 6, border: '1px solid #fecaca',
                background: '#fee2e2', color: '#991b1b', fontSize: 11, fontWeight: 700,
                cursor: isPending ? 'default' : 'pointer',
              }}
            >
              ✕
            </button>
          </div>
        )}
        {(p.status === 'paid' || p.status === 'cancelled') && (
          <span style={{ fontSize: 11, color: '#4A6B60' }}>—</span>
        )}
      </td>
    </tr>
  );
}

export function TabelaPagamentos({ payments, ownerNames, viewMonth, viewYear }: {
  payments: Payment[];
  ownerNames: Record<string, string>;
  viewMonth: number;
  viewYear: number;
}) {
  const [statusFilter, setStatusFilter] = useState<'todos' | 'paid' | 'pending' | 'cancelled'>('todos');

  const filtered = statusFilter === 'todos' ? payments : payments.filter(p => p.status === statusFilter);

  const totalPaid    = payments.filter(p => p.status === 'paid').reduce((a, p) => a + (p.amount ?? 0), 0);
  const totalPending = payments.filter(p => p.status === 'pending').reduce((a, p) => a + (p.amount ?? 0), 0);

  return (
    <div>
      {/* Stats + filtro de status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, padding: '12px 20px', borderBottom: '1px solid rgba(0,200,167,0.12)' }}>
        {/* Stats rápidos */}
        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#7FA898' }}>
          <span>Recebido: <strong style={{ color: '#22D3A5' }}>{formatCurrency(totalPaid)}</strong></span>
          <span>Pendente: <strong style={{ color: '#F59E0B' }}>{formatCurrency(totalPending)}</strong></span>
        </div>

        {/* Filtro status */}
        <div style={{ display: 'flex', gap: 6 }}>
          {(['todos', 'paid', 'pending', 'cancelled'] as const).map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              style={{
                padding: '5px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                background: statusFilter === f ? '#00A88E' : 'rgba(0,198,167,0.08)',
                color: statusFilter === f ? '#fff' : '#7FA898',
                transition: 'all 0.15s',
              }}
            >
              {f === 'todos' ? 'Todos' : f === 'paid' ? 'Pagos' : f === 'pending' ? 'Pendentes' : 'Cancelados'}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: '36px 20px', textAlign: 'center', color: '#7FA898', fontSize: 13 }}>
          Nenhum pagamento em {MONTHS_PT[viewMonth]} {viewYear}.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(0,198,167,0.06)' }}>
                {['Data', 'Tutor', 'Tipo / Descrição', 'Valor', 'Status', 'Ações'].map((h, i) => (
                  <th key={h} style={{
                    padding: '10px 20px',
                    textAlign: i === 3 ? 'right' : i === 4 || i === 5 ? 'center' : 'left',
                    fontSize: 11, fontWeight: 600, letterSpacing: '0.05em',
                    textTransform: 'uppercase', color: '#7FA898',
                    borderBottom: '1px solid rgba(0,200,167,0.12)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <PaymentRow key={p.id} p={p} ownerName={ownerNames[p.owner_id ?? ''] ?? '—'} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

