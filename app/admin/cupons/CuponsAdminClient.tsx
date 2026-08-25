'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

type Coupon = {
  id: string;
  code: string;
  description: string | null;
  discount_pct: number | null;
  discount_brl: number | null;
  max_uses: number | null;
  used_count: number;
  valid_from: string | null;
  valid_until: string | null;
  active: boolean;
  created_at: string;
  uses: number;
};

function fmt(d: string | null) {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR');
}

function ToggleButton({ coupon, onToggle }: { coupon: Coupon; onToggle: (id: string, active: boolean) => void }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(async () => {
        await fetch('/api/admin/cupons', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: coupon.id, active: !coupon.active }),
        });
        onToggle(coupon.id, !coupon.active);
      })}
      style={{
        padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer',
        background: coupon.active ? '#065f46' : '#374151',
        color: coupon.active ? '#6ee7b7' : '#9ca3af',
        opacity: isPending ? 0.6 : 1,
      }}
    >
      {coupon.active ? 'Ativo' : 'Inativo'}
    </button>
  );
}

export default function CuponsAdminClient({ cupons: initial }: { cupons: Coupon[] }) {
  const router = useRouter();
  const [cupons, setCupons] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    code: '', description: '', discount_pct: '', discount_brl: '',
    max_uses: '', valid_from: '', valid_until: '', type: 'pct' as 'pct' | 'brl',
  });
  const [formError, setFormError] = useState('');

  function handleToggle(id: string, active: boolean) {
    setCupons((prev) => prev.map((c) => c.id === id ? { ...c, active } : c));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    startTransition(async () => {
      const body: Record<string, unknown> = {
        code: form.code,
        description: form.description || null,
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
        valid_from: form.valid_from || null,
        valid_until: form.valid_until || null,
      };
      if (form.type === 'pct') body.discount_pct = parseInt(form.discount_pct);
      else body.discount_brl = parseFloat(form.discount_brl);

      const res = await fetch('/api/admin/cupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error ?? 'Erro ao criar cupom'); return; }
      setShowForm(false);
      setForm({ code: '', description: '', discount_pct: '', discount_brl: '', max_uses: '', valid_from: '', valid_until: '', type: 'pct' });
      router.refresh();
    });
  }

  const totalUses = cupons.reduce((a, c) => a + c.uses, 0);
  const activeCount = cupons.filter((c) => c.active).length;

  const inputStyle = {
    width: '100%', padding: '8px 12px', background: '#1f2937', border: '1px solid #374151',
    borderRadius: 8, color: '#fff', fontSize: 13, outline: 'none',
  } as React.CSSProperties;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-white">Cupons de Desconto</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 rounded-lg text-sm font-semibold"
          style={{ background: '#00A88E', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          {showForm ? 'Cancelar' : '+ Novo cupom'}
        </button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total de cupons', value: cupons.length },
          { label: 'Ativos', value: activeCount },
          { label: 'Usos totais', value: totalUses },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 12, padding: 20 }}>
            <p style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Formulário de criação */}
      {showForm && (
        <div style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 12, padding: 24 }}>
          <h2 style={{ fontWeight: 700, color: '#fff', fontSize: 15, marginBottom: 20 }}>Novo Cupom</h2>
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: 11, color: '#9ca3af', display: 'block', marginBottom: 6 }}>CÓDIGO *</label>
              <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="EX: WALKER30" style={inputStyle} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: 11, color: '#9ca3af', display: 'block', marginBottom: 6 }}>DESCRIÇÃO INTERNA</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Campanha Instagram agosto/26" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: '#9ca3af', display: 'block', marginBottom: 6 }}>TIPO DE DESCONTO</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'pct' | 'brl' })}
                style={inputStyle}>
                <option value="pct">Percentual (%)</option>
                <option value="brl">Valor fixo (R$)</option>
              </select>
            </div>
            <div>
              {form.type === 'pct' ? (
                <>
                  <label style={{ fontSize: 11, color: '#9ca3af', display: 'block', marginBottom: 6 }}>DESCONTO (%) *</label>
                  <input required type="number" min={1} max={100} value={form.discount_pct}
                    onChange={(e) => setForm({ ...form, discount_pct: e.target.value })}
                    placeholder="30" style={inputStyle} />
                </>
              ) : (
                <>
                  <label style={{ fontSize: 11, color: '#9ca3af', display: 'block', marginBottom: 6 }}>DESCONTO (R$) *</label>
                  <input required type="number" min={0.01} step="0.01" value={form.discount_brl}
                    onChange={(e) => setForm({ ...form, discount_brl: e.target.value })}
                    placeholder="10.00" style={inputStyle} />
                </>
              )}
            </div>
            <div>
              <label style={{ fontSize: 11, color: '#9ca3af', display: 'block', marginBottom: 6 }}>USO MÁXIMO</label>
              <input type="number" min={1} value={form.max_uses}
                onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                placeholder="Ilimitado" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: '#9ca3af', display: 'block', marginBottom: 6 }}>VÁLIDO ATÉ</label>
              <input type="date" value={form.valid_until}
                onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
                style={inputStyle} />
            </div>
            {formError && <p style={{ gridColumn: '1 / -1', color: '#f87171', fontSize: 12 }}>{formError}</p>}
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" disabled={isPending}
                style={{ padding: '10px 24px', background: '#00A88E', color: '#fff', borderRadius: 8, fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', opacity: isPending ? 0.6 : 1 }}>
                {isPending ? 'Criando…' : 'Criar cupom'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de cupons */}
      <div style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #374151' }}>
          <h2 style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>Todos os Cupons</h2>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ color: '#9ca3af', textAlign: 'left' }}>
              {['Código', 'Desconto', 'Usos', 'Validade', 'Status'].map((h) => (
                <th key={h} style={{ padding: '10px 24px', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cupons.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '32px 24px', textAlign: 'center', color: '#6b7280' }}>Nenhum cupom cadastrado</td></tr>
            ) : cupons.map((c) => (
              <tr key={c.id} style={{ borderTop: '1px solid #374151' }}>
                <td style={{ padding: '12px 24px' }}>
                  <p style={{ fontFamily: 'monospace', fontWeight: 700, color: '#fff', fontSize: 14 }}>{c.code}</p>
                  {c.description && <p style={{ color: '#6b7280', fontSize: 11, marginTop: 2 }}>{c.description}</p>}
                </td>
                <td style={{ padding: '12px 24px', color: '#6ee7b7', fontWeight: 700 }}>
                  {c.discount_pct ? `${c.discount_pct}%` : `R$ ${(c.discount_brl ?? 0).toFixed(2)}`}
                </td>
                <td style={{ padding: '12px 24px', color: '#d1d5db' }}>
                  {c.uses}{c.max_uses !== null ? ` / ${c.max_uses}` : ''}
                </td>
                <td style={{ padding: '12px 24px', color: '#d1d5db' }}>
                  {c.valid_until ? `até ${fmt(c.valid_until)}` : 'Sem expiração'}
                </td>
                <td style={{ padding: '12px 24px' }}>
                  <ToggleButton coupon={c} onToggle={handleToggle} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
