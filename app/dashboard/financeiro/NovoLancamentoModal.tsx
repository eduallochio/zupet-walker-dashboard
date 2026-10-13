'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, Clock, Plus, X } from 'lucide-react';
import { criarLancamento } from './actions';

const BILLING_OPTIONS = [
  { value: 'per_session', label: 'Por sessão' },
  { value: 'walk',        label: 'Passeio' },
  { value: 'bath',        label: 'Banho' },
  { value: 'hotel',       label: 'Hospedagem' },
  { value: 'day_care',    label: 'Day care' },
  { value: 'training',    label: 'Adestramento' },
  { value: 'monthly',     label: 'Mensal' },
  { value: 'weekly',      label: 'Semanal' },
];

const C = {
  card: '#11201B', input: '#0B1512', line: 'rgba(134,239,172,0.12)', lineStrong: 'rgba(134,239,172,0.22)',
  text: '#EEF6F1', muted: '#A3BCB0', label: '#8FAB9E',
  accent: '#22C55E', accentLt: '#86EFAC', accentDim: 'rgba(34,197,94,0.12)',
  amber: '#FBBF24', amberDim: 'rgba(251,191,36,0.12)', danger: '#FCA5A5',
};

type Owner = { user_id: string; name: string };
type Status = 'pending' | 'paid';

export function NovoLancamentoModal({ owners }: { owners: Owner[] }) {
  const [open, setOpen] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('pending');
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  function fechar() {
    setOpen(false);
    setErro(null);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set('status', status);
    setErro(null);
    startTransition(async () => {
      const result = await criarLancamento(fd);
      if (result.error) {
        setErro(result.error);
      } else {
        formRef.current?.reset();
        setStatus('pending');
        setOpen(false);
      }
    });
  }

  const STATUS_OPTS: { value: Status; label: string; icon: typeof Clock; fg: string; bg: string; border: string }[] = [
    { value: 'pending', label: 'Pendente', icon: Clock,        fg: C.amber,    bg: C.amberDim,  border: 'rgba(251,191,36,0.45)' },
    { value: 'paid',    label: 'Já pago',  icon: CheckCircle2, fg: C.accentLt, bg: C.accentDim, border: 'rgba(34,197,94,0.5)' },
  ];

  return (
    <>
      <button onClick={() => setOpen(true)} className="zw-btn zw-btn-primary">
        <Plus size={16} aria-hidden /> Novo lançamento
      </button>

      {open && createPortal(
        <div
          onClick={fechar}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)',
            zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="nl-titulo"
            onClick={e => e.stopPropagation()}
            className="zw-in"
            style={{
              background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, width: '100%', maxWidth: 500,
              maxHeight: 'calc(100dvh - 32px)', overflowY: 'auto',
              boxShadow: '0 24px 60px rgba(0,0,0,0.5)', color: C.text,
            }}
          >
            {/* Cabeçalho */}
            <div style={{ padding: '20px 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 id="nl-titulo" style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em' }}>Novo lançamento</h2>
              <button onClick={fechar} aria-label="Fechar" style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 4, display: 'inline-flex' }}>
                <X size={20} aria-hidden />
              </button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit}>
              <div style={{ padding: '0 24px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label htmlFor="nl-tutor" style={labelStyle}>Tutor</label>
                  <select id="nl-tutor" name="owner_id" style={inputStyle}>
                    <option value="">Sem tutor (lançamento avulso)</option>
                    {owners.map(o => (
                      <option key={o.user_id} value={o.user_id}>{o.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                  <div>
                    <label htmlFor="nl-valor" style={labelStyle}>Valor</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: C.label, pointerEvents: 'none' }}>R$</span>
                      <input id="nl-valor" name="amount" type="text" inputMode="decimal" placeholder="0,00" required style={{ ...inputStyle, paddingLeft: 38, fontVariantNumeric: 'tabular-nums' }} />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="nl-tipo" style={labelStyle}>Tipo de serviço</label>
                    <select id="nl-tipo" name="billing_type" required style={inputStyle}>
                      {BILLING_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="nl-desc" style={labelStyle}>Descrição <span style={opcional}>opcional</span></label>
                  <input id="nl-desc" name="description" type="text" placeholder="Ex: Passeio de segunda, banho e tosa…" style={inputStyle} />
                </div>

                <div role="radiogroup" aria-label="Status do pagamento">
                  <span style={labelStyle}>Status</span>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {STATUS_OPTS.map(opt => {
                      const sel = status === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          role="radio"
                          aria-checked={sel}
                          onClick={() => setStatus(opt.value)}
                          style={{
                            flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            padding: '11px 14px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
                            fontSize: 14, fontWeight: 700, transition: 'all .15s',
                            border: `1px solid ${sel ? opt.border : C.line}`,
                            background: sel ? opt.bg : 'transparent',
                            color: sel ? opt.fg : C.muted,
                          }}
                        >
                          <opt.icon size={16} aria-hidden /> {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label htmlFor="nl-obs" style={labelStyle}>Observações <span style={opcional}>opcional</span></label>
                  <textarea id="nl-obs" name="notes" placeholder="Informações adicionais" rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>

                {erro && (
                  <p role="alert" style={{ background: 'rgba(252,165,165,0.08)', border: '1px solid rgba(252,165,165,0.3)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: C.danger }}>
                    Não foi possível salvar: {erro}
                  </p>
                )}
              </div>

              <div style={{ padding: '16px 24px', borderTop: `1px solid ${C.line}`, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={fechar} className="zw-btn zw-btn-ghost">Cancelar</button>
                <button type="submit" disabled={isPending} className="zw-btn zw-btn-primary">
                  {isPending ? 'Salvando…' : 'Salvar lançamento'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em',
  textTransform: 'uppercase', color: C.label, marginBottom: 6,
};

const opcional: React.CSSProperties = { textTransform: 'none', letterSpacing: 0, fontWeight: 500, color: C.label, opacity: 0.8 };

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 12px', borderRadius: 10,
  border: `1px solid ${C.lineStrong}`, fontSize: 14, color: C.text,
  background: C.input, outline: 'none', boxSizing: 'border-box',
  fontFamily: 'inherit', colorScheme: 'dark',
};
