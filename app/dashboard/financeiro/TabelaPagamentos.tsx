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
  paid:      { color: '#fff',     bg: '#00A88E' },
  pending:   { color: '#92400e',  bg: '#fef3c7' },
  cancelled: { color: '#6B7280',  bg: '#f3f4f6' },
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
    <tr style={{ borderTop: '1px solid #e8f4f2', opacity: isPending ? 0.6 : 1 }}>
      <td style={{ padding: '12px 20px', color: '#b0cdc9', fontSize: 13 }}>{formatDate(p.created_at)}</td>
      <td style={{ padding: '12px 20px', color: '#e0f2ef', fontSize: 13, fontWeight: 500 }}>{ownerName}</td>
      <td style={{ padding: '12px 20px', color: '#b0cdc9', fontSize: 13 }}>
        <div>{BILLING_TYPE_LABEL[p.service_type ?? p.billing_type] ?? p.description ?? '—'}</div>
        {p.payment_method && (
          <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
            {PAYMENT_METHOD_LABEL[p.payment_method] ?? p.payment_method}
          </div>
        )}
        {!p.payment_method && p.description && (
          <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{p.description}</div>
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
              title="Marcar como pago"
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
              title="Cancelar"
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
          <span style={{ fontSize: 11, color: '#9CA3AF' }}>—</span>
        )}
      </td>
    </tr>
  );
}

export function TabelaPagamentos({ payments, ownerNames }: {
  payments: Payment[];
  ownerNames: Record<string, string>;
}) {
  const now = new Date();
  const [viewYear, setViewYear]   = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [statusFilter, setStatusFilter] = useState<'todos' | 'paid' | 'pending' | 'cancelled'>('todos');

  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (isCurrentMonth) return;
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  const monthStart = new Date(viewYear, viewMonth, 1).toISOString();
  const monthEnd   = new Date(viewYear, viewMonth + 1, 0, 23, 59, 59, 999).toISOString();

  const monthPayments = payments.filter(p => p.created_at >= monthStart && p.created_at <= monthEnd);
  const filtered = statusFilter === 'todos' ? monthPayments : monthPayments.filter(p => p.status === statusFilter);

  const totalPaid    = monthPayments.filter(p => p.status === 'paid').reduce((a, p) => a + (p.amount ?? 0), 0);
  const totalPending = monthPayments.filter(p => p.status === 'pending').reduce((a, p) => a + (p.amount ?? 0), 0);

  return (
    <div>
      {/* Month nav + status filter */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        {/* Mês */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#F5FAFA', borderRadius: 10, padding: '4px 6px', border: '1px solid #D1EEEA' }}>
          <button onClick={prevMonth} style={navBtn}>‹</button>
          <span style={{ minWidth: 110, textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#1a3330' }}>
            {MONTHS_PT[viewMonth]} {viewYear}
          </span>
          <button onClick={nextMonth} disabled={isCurrentMonth} style={{ ...navBtn, opacity: isCurrentMonth ? 0.3 : 1 }}>›</button>
        </div>

        {/* Stats rápidos */}
        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#b0cdc9' }}>
          <span>Recebido: <strong style={{ color: '#00A88E' }}>{formatCurrency(totalPaid)}</strong></span>
          <span>Pendente: <strong style={{ color: '#d97706' }}>{formatCurrency(totalPending)}</strong></span>
        </div>

        {/* Filtro status */}
        <div style={{ display: 'flex', gap: 6 }}>
          {(['todos', 'paid', 'pending', 'cancelled'] as const).map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              style={{
                padding: '5px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                background: statusFilter === f ? '#00A88E' : '#F5FAFA',
                color: statusFilter === f ? '#fff' : '#4a6b65',
                transition: 'all 0.15s',
              }}
            >
              {f === 'todos' ? 'Todos' : f === 'paid' ? 'Pagos' : f === 'pending' ? 'Pendentes' : 'Cancelados'}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: '36px 20px', textAlign: 'center', color: '#6B7280', fontSize: 13 }}>
          Nenhum pagamento em {MONTHS_PT[viewMonth]} {viewYear}.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F5FAFA' }}>
                {['Data', 'Tutor', 'Tipo / Descrição', 'Valor', 'Status', 'Ações'].map((h, i) => (
                  <th key={h} style={{
                    padding: '10px 20px',
                    textAlign: i === 3 ? 'right' : i === 4 || i === 5 ? 'center' : 'left',
                    fontSize: 11, fontWeight: 600, letterSpacing: '0.05em',
                    textTransform: 'uppercase', color: '#6B7280',
                    borderBottom: '1px solid #D1EEEA',
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

const navBtn: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 7, border: 'none',
  background: 'transparent', cursor: 'pointer', fontSize: 18,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: '#1a3330', fontWeight: 700, lineHeight: 1,
};
