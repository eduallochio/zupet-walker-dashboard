'use client';

import { useTransition } from 'react';
import { atualizarStatusPagamento } from './actions';

const STATUS_LABEL: Record<string, string> = {
  paid:      'Pago',
  pending:   'Pendente',
  cancelled: 'Cancelado',
};
const STATUS_COLOR: Record<string, { color: string; bg: string }> = {
  paid:      { color: '#00A88E', bg: '#D1EEEA' },
  pending:   { color: '#92400e', bg: '#fef3c7' },
  cancelled: { color: '#6B7280', bg: '#f3f4f6' },
};

const BILLING_TYPE_LABEL: Record<string, string> = {
  walk:        '🦮 Passeio',
  bath:        '🛁 Banho',
  hotel:       '🏠 Hospedagem',
  vet:         '🩺 Veterinário',
  day_care:    '☀️ Day care',
  training:    '🎓 Treinamento',
  per_session: '📋 Por sessão',
  daily:       '📅 Diário',
  weekly:      '📆 Semanal',
  monthly:     '🗓️ Mensal',
};

type Payment = {
  id: string;
  amount: number;
  status: string;
  billing_type: string;
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
  const sc = STATUS_COLOR[p.status] ?? { color: '#6B7280', bg: '#f3f4f6' };

  function atualizar(novoStatus: 'paid' | 'cancelled') {
    startTransition(async () => {
      await atualizarStatusPagamento(p.id, novoStatus);
    });
  }

  return (
    <tr style={{ borderTop: '1px solid #e8f4f2', opacity: isPending ? 0.6 : 1 }}>
      <td style={{ padding: '12px 20px', color: '#4a6b65', fontSize: 13 }}>{formatDate(p.created_at)}</td>
      <td style={{ padding: '12px 20px', color: '#4a6b65', fontSize: 13 }}>{ownerName}</td>
      <td style={{ padding: '12px 20px', color: '#4a6b65', fontSize: 13 }}>
        <div>{BILLING_TYPE_LABEL[p.billing_type] ?? p.billing_type ?? '—'}</div>
        {p.description && <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{p.description}</div>}
      </td>
      <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 700, color: '#0D2926', fontVariantNumeric: 'tabular-nums', fontSize: 13 }}>
        {formatCurrency(p.amount ?? 0)}
      </td>
      <td style={{ padding: '12px 20px', textAlign: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, color: sc.color, background: sc.bg }}>
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
                padding: '4px 10px', borderRadius: 6, border: '1px solid #D1EEEA',
                background: '#D1EEEA', color: '#00A88E', fontSize: 11, fontWeight: 700,
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
        {p.status === 'paid' && (
          <span style={{ fontSize: 11, color: '#9CA3AF' }}>—</span>
        )}
        {p.status === 'cancelled' && (
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
  if (!payments.length) {
    return (
      <div style={{ padding: '36px 20px', textAlign: 'center', color: '#6B7280', fontSize: 13 }}>
        Nenhum pagamento registrado.
      </div>
    );
  }

  return (
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
          {payments.map(p => (
            <PaymentRow key={p.id} p={p} ownerName={ownerNames[p.owner_id ?? ''] ?? '—'} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
