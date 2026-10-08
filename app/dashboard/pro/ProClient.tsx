'use client';

import { useState } from 'react';
import { Camera, Check, Copy, Crown, History, PawPrint, Search, Sparkles, Tag, Wrench, X } from 'lucide-react';

type PlanConfig = {
  price_full: number;
  price_promo: number;
  promo_active: boolean;
  promo_label: string;
  currency: string;
};

type Pricing = {
  original: number;
  discount: number;
  final: number;
  isFree: boolean;
};

type CouponResult = {
  valid: boolean;
  coupon: { id: string; code: string; description: string | null; discountPct: number | null; discountBrl: number | null };
  pricing: Pricing;
};

export default function ProClient({ isPro, email, pixKey, planConfig }: { isPro: boolean; email: string; pixKey: string; planConfig: PlanConfig }) {
  const [couponCode, setCouponCode] = useState('');
  const [couponResult, setCouponResult] = useState<CouponResult | null>(null);
  const [couponError, setCouponError] = useState('');
  const [loading, setLoading] = useState(false);
  const [assinando, setAssinando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const basePrice = planConfig.promo_active ? planConfig.price_promo : planConfig.price_full;
  const pricing = couponResult?.pricing ?? { original: basePrice, discount: 0, final: basePrice, isFree: false };

  async function handleValidar() {
    if (!couponCode.trim()) return;
    setLoading(true);
    setCouponError('');
    setCouponResult(null);
    try {
      const res = await fetch(`/api/cupom/validar?code=${encodeURIComponent(couponCode.trim())}`);
      const data = await res.json();
      if (!res.ok) { setCouponError(data.error ?? 'Cupom inválido'); return; }
      setCouponResult(data);
    } catch {
      setCouponError('Erro ao validar cupom');
    } finally {
      setLoading(false);
    }
  }

  function handleRemover() {
    setCouponResult(null);
    setCouponError('');
    setCouponCode('');
  }

  async function copiarPix() {
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch { /* sem permissão de clipboard: a chave continua visível */ }
  }

  const C = {
    card: '#11201B', card2: '#152822', border: 'rgba(134,239,172,0.12)', accent: '#22C55E', accentLt: '#86EFAC',
    accentDim: 'rgba(34,197,94,0.12)', text: '#EEF6F1', textSec: '#A3BCB0', label: '#8FAB9E',
    amber: '#FBBF24', amberDim: 'rgba(251,191,36,0.12)', danger: '#FCA5A5',
  };
  const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const labelStyle = { fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: C.label };

  const BENEFICIOS = [
    { icon: PawPrint, titulo: 'Pets ilimitados', sub: 'No gratuito, até 10' },
    { icon: Wrench, titulo: 'Serviços ilimitados', sub: 'Ofereça tudo o que você faz' },
    { icon: Camera, titulo: 'Relatórios com fotos', sub: 'O tutor acompanha cada passeio' },
    { icon: History, titulo: 'Histórico completo', sub: 'No gratuito, 30 dias' },
    { icon: Search, titulo: 'Destaque na busca', sub: 'Apareça primeiro para tutores' },
    { icon: Sparkles, titulo: 'Link público', sub: 'walker.zupet.io/w/seu-nome' },
  ];

  if (isPro) {
    return (
      <div className="zw-page" style={{ maxWidth: 760 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>Plano Pro</h1>
        <section style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center' }}>
          <span className="zw-pop" style={{ width: 56, height: 56, borderRadius: 16, background: C.amberDim, color: C.amber, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Crown size={28} aria-hidden />
          </span>
          <h2 style={{ fontSize: 20, fontWeight: 800 }}>Você é Pro</h2>
          <p style={{ fontSize: 14, color: C.textSec }}>Todos os recursos estão liberados na sua conta.</p>
        </section>
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          {BENEFICIOS.map(({ icon: Icon, titulo }) => (
            <div key={titulo} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 700 }}>
              <Icon size={18} color={C.accent} aria-hidden /> {titulo}
            </div>
          ))}
        </section>
      </div>
    );
  }

  return (
    <div className="zw-page" style={{ maxWidth: 980 }}>
      <header className="zw-in" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>Seja Pro</h1>
        <span style={{ fontSize: 14, color: C.textSec }}>Mais clientes, mais confiança dos tutores e nenhum limite no seu trabalho.</span>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, alignItems: 'start' }}>
        {/* Benefícios */}
        <section style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, padding: '16px 18px' }}>O que muda no Pro</h2>
          <ul style={{ listStyle: 'none' }}>
            {BENEFICIOS.map(({ icon: Icon, titulo, sub }) => (
              <li key={titulo} className="zw-row">
                <span style={{ width: 36, height: 36, borderRadius: 10, background: C.accentDim, color: C.accent, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} aria-hidden />
                </span>
                <span style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{titulo}</span>
                  <span style={{ fontSize: 13, color: C.textSec }}>{sub}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Preço e pagamento */}
        <section style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={labelStyle}>Assinatura mensal</span>
              {!couponResult && planConfig.promo_active && (
                <span style={{ fontSize: 12, fontWeight: 700, borderRadius: 20, padding: '3px 10px', background: C.amberDim, color: C.amber }}>{planConfig.promo_label}</span>
              )}
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
              {((!couponResult && planConfig.promo_active) || (couponResult && pricing.discount > 0)) && (
                <span style={{ fontSize: 18, color: C.label, textDecoration: 'line-through' }}>
                  {brl(couponResult ? pricing.original : planConfig.price_full)}
                </span>
              )}
              <span style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em', color: pricing.isFree ? C.accentLt : C.text, fontVariantNumeric: 'tabular-nums' }}>
                {pricing.isFree ? 'Grátis' : brl(pricing.final)}
              </span>
              {!pricing.isFree && <span style={{ fontSize: 14, color: C.textSec }}>/mês</span>}
            </div>
            {couponResult && pricing.discount > 0 && (
              <span style={{ fontSize: 13, color: C.accentLt }}>Você economiza {brl(pricing.discount)} com o cupom {couponResult.coupon.code}</span>
            )}
          </div>

          {/* Cupom */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label htmlFor="pro-cupom" style={labelStyle}>Cupom de desconto</label>
            {couponResult ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.accentDim, border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '10px 12px' }}>
                <Tag size={16} color={C.accent} aria-hidden />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, color: C.accentLt, fontSize: 14 }}>
                    {couponResult.coupon.code} · {couponResult.coupon.discountPct ? `${couponResult.coupon.discountPct}% de desconto` : `${brl(couponResult.coupon.discountBrl ?? 0)} de desconto`}
                  </p>
                  {couponResult.coupon.description && <p style={{ fontSize: 12, color: C.textSec, marginTop: 2 }}>{couponResult.coupon.description}</p>}
                </div>
                <button onClick={handleRemover} aria-label="Remover cupom" style={{ color: C.textSec, background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', padding: 4 }}>
                  <X size={16} aria-hidden />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  id="pro-cupom"
                  value={couponCode}
                  onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleValidar()}
                  placeholder="CÓDIGO"
                  style={{ flex: 1, minWidth: 0, padding: '10px 12px', border: `1px solid ${couponError ? 'rgba(252,165,165,0.5)' : C.border}`, borderRadius: 10, fontSize: 14, fontFamily: 'monospace', fontWeight: 700, background: '#0B1512', color: C.text, outline: 'none', textTransform: 'uppercase' }}
                />
                <button onClick={handleValidar} disabled={loading || !couponCode.trim()} className="zw-btn zw-btn-ghost">
                  {loading ? 'Validando…' : 'Aplicar'}
                </button>
              </div>
            )}
            {couponError && <p role="alert" style={{ fontSize: 13, color: C.danger }}>{couponError}</p>}
          </div>

          {!assinando ? (
            <button onClick={() => setAssinando(true)} className="zw-btn zw-btn-primary" style={{ width: '100%', padding: '13px 16px', fontSize: 15 }}>
              <Crown size={17} aria-hidden /> {pricing.isFree ? 'Ativar com cupom' : 'Assinar com Pix'}
            </button>
          ) : (
            <div className="zw-in" style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
              {!pricing.isFree && (
                <div style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={labelStyle}>Chave Pix (CNPJ)</span>
                    <p style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 16, marginTop: 4, overflowWrap: 'anywhere' }}>{pixKey}</p>
                  </div>
                  <button onClick={copiarPix} className="zw-btn zw-btn-ghost zw-btn-s">
                    {copiado ? <><Check size={14} aria-hidden /> Copiada</> : <><Copy size={14} aria-hidden /> Copiar</>}
                  </button>
                </div>
              )}
              <ol style={{ display: 'flex', flexDirection: 'column', gap: 10, listStyle: 'none', counterReset: 'passo' }}>
                {(pricing.isFree
                  ? [
                      <>Fale com a gente pelo WhatsApp <b style={{ color: C.accentLt }}>(27) 99871-4453</b> ou pelo email <b style={{ color: C.accentLt }}>eduallochio2@outlook.com</b></>,
                      <>Informe o cupom <b>{couponResult?.coupon.code}</b> e o email da sua conta</>,
                      <>Ativamos em até 24h úteis</>,
                    ]
                  : [
                      <>Faça o Pix de <b>{brl(pricing.final)}</b> para a chave acima</>,
                      <>Envie o comprovante pelo WhatsApp <b style={{ color: C.accentLt }}>(27) 99871-4453</b> ou pelo email <b style={{ color: C.accentLt }}>eduallochio2@outlook.com</b>{couponResult ? <>, com o cupom <b>{couponResult.coupon.code}</b></> : null}</>,
                      <>Informe o email da sua conta: <b>{email}</b></>,
                      <>Ativamos em até 24h úteis</>,
                    ]
                ).map((passo, i) => (
                  <li key={i} style={{ display: 'flex', gap: 10, fontSize: 14, color: C.textSec, lineHeight: 1.5 }}>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', background: C.accentDim, color: C.accentLt, fontSize: 12, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                    <span>{passo}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <p style={{ fontSize: 12, color: C.label }}>Conta: {email}</p>
        </section>
      </div>
    </div>
  );
}
