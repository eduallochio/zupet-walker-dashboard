'use client';

import { useState, useTransition, useRef } from 'react';
import { criarLancamento } from './actions';

const BILLING_OPTIONS = [
  { value: 'per_session', label: '📋 Por sessão' },
  { value: 'walk',        label: '🦮 Passeio' },
  { value: 'bath',        label: '🛁 Banho' },
  { value: 'hotel',       label: '🏠 Hospedagem' },
  { value: 'day_care',    label: '☀️ Day care' },
  { value: 'training',    label: '🎓 Treinamento' },
  { value: 'monthly',     label: '🗓️ Mensal' },
  { value: 'weekly',      label: '📆 Semanal' },
];

type Owner = { user_id: string; name: string };

export function NovoLancamentoModal({ owners }: { owners: Owner[] }) {
  const [open, setOpen] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setErro(null);
    startTransition(async () => {
      const result = await criarLancamento(fd);
      if (result.error) {
        setErro(result.error);
      } else {
        formRef.current?.reset();
        setOpen(false);
      }
    });
  }

  return (
    <>
      {/* Botão de abertura */}
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: '#00C6A7', color: '#fff', border: 'none', cursor: 'pointer',
          padding: '8px 16px', borderRadius: 8,
          fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em',
        }}
      >
        + Novo lançamento
      </button>

      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(13,41,38,0.45)',
            zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20,
          }}
        >
          {/* Modal */}
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480,
              boxShadow: '0 20px 60px rgba(0,0,0,0.18)', overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{ padding: '18px 24px 16px', borderBottom: '1px solid #e8f4f2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0D2926', letterSpacing: '-0.02em' }}>Novo lançamento financeiro</h2>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 20, lineHeight: 1, padding: 4 }}>✕</button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit}>
              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Tutor */}
                <div>
                  <label style={labelStyle}>Tutor</label>
                  <select name="owner_id" style={inputStyle}>
                    <option value="">Sem tutor (lançamento avulso)</option>
                    {owners.map(o => (
                      <option key={o.user_id} value={o.user_id}>{o.name}</option>
                    ))}
                  </select>
                </div>

                {/* Valor + Tipo */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Valor (R$) *</label>
                    <input
                      name="amount"
                      type="text"
                      inputMode="decimal"
                      placeholder="0,00"
                      required
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Tipo de serviço *</label>
                    <select name="billing_type" required style={inputStyle}>
                      {BILLING_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Descrição */}
                <div>
                  <label style={labelStyle}>Descrição</label>
                  <input
                    name="description"
                    type="text"
                    placeholder="Ex: Passeio segunda-feira, Banho + tosa..."
                    style={inputStyle}
                  />
                </div>

                {/* Status */}
                <div>
                  <label style={labelStyle}>Status *</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {[
                      { value: 'pending', label: '⏳ Pendente', color: '#92400e', bg: '#fef3c7' },
                      { value: 'paid',    label: '✅ Já pago',  color: '#00A88E', bg: '#D1EEEA' },
                    ].map(opt => (
                      <label key={opt.value} style={{ flex: 1, cursor: 'pointer' }}>
                        <input type="radio" name="status" value={opt.value} defaultChecked={opt.value === 'pending'} style={{ display: 'none' }} />
                        <StatusOption label={opt.label} color={opt.color} bg={opt.bg} />
                      </label>
                    ))}
                  </div>
                </div>

                {/* Observações */}
                <div>
                  <label style={labelStyle}>Observações</label>
                  <textarea
                    name="notes"
                    placeholder="Informações adicionais (opcional)"
                    rows={2}
                    style={{ ...inputStyle, resize: 'none', fontFamily: 'inherit' }}
                  />
                </div>

                {erro && (
                  <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#991b1b' }}>
                    {erro}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div style={{ padding: '16px 24px', borderTop: '1px solid #e8f4f2', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid #D1EEEA', background: '#fff', fontSize: 13, fontWeight: 600, color: '#6B7280', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  style={{
                    padding: '9px 22px', borderRadius: 8, border: 'none',
                    background: isPending ? '#9CA3AF' : '#00C6A7',
                    color: '#fff', fontSize: 13, fontWeight: 700,
                    cursor: isPending ? 'default' : 'pointer',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {isPending ? 'Salvando…' : 'Salvar lançamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// Radio button visual customizado — lê o estado via CSS :has
function StatusOption({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <div style={{
      padding: '10px 14px', borderRadius: 8, textAlign: 'center',
      border: `1.5px solid ${color}40`, background: bg,
      fontSize: 13, fontWeight: 600, color,
    }}>
      {label}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em',
  textTransform: 'uppercase', color: '#6B7280', marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 8,
  border: '1px solid #D1EEEA', fontSize: 13, color: '#0D2926',
  background: '#F5FAFA', outline: 'none', boxSizing: 'border-box',
  fontFamily: 'inherit',
};
