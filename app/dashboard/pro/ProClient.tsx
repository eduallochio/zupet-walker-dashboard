'use client';

import { useState } from 'react';

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

  const C = {
    card: '#132219', border: 'rgba(0,200,167,0.12)', accent: '#00C6A7',
    accentDim: 'rgba(0,198,167,0.12)', text: '#E8F5F0', textSec: '#7FA898',
    success: '#22D3A5',
  };

  if (isPro) {
    return (
      <div style={{ maxWidth: 560, padding: '28px 24px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: '-0.03em', marginBottom: 28 }}>Plano Pro</h1>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>✦</div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: C.success, marginBottom: 8 }}>Você já é Pro!</h2>
          <p style={{ fontSize: 14, color: C.textSec }}>Aproveite todos os recursos sem limites.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, padding: '28px 24px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: '-0.03em', marginBottom: 28 }}>Assinar Plano Pro</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {/* Benefícios */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px 14px', borderBottom: `1px solid ${C.border}` }}>
            <h2 style={{ fontWeight: 700, color: C.text, fontSize: 13, letterSpacing: '-0.01em' }}>O que você ganha com o Pro</h2>
          </div>
          <div style={{ padding: '16px 20px' }}>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 12, listStyle: 'none' }}>
              {[
                ['🐾', 'Pets ilimitados (free: até 10)'],
                ['🛎️', 'Serviços ilimitados'],
                ['📸', 'Relatórios com fotos do passeio'],
                ['📊', 'Histórico completo (free: 30 dias)'],
                ['🔍', 'Destaque na busca de tutores'],
              ].map(([icon, text]) => (
                <li key={text as string} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: C.textSec }}>
                  <span style={{ fontSize: 16, lineHeight: 1.4 }}>{icon}</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>

            {/* Campo de cupom */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: C.textSec, marginBottom: 8 }}>
                Cupom de desconto
              </p>
              {couponResult ? (
                <div style={{ background: 'rgba(34,211,165,0.1)', border: '1px solid rgba(34,211,165,0.3)', borderRadius: 8, padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontWeight: 700, color: C.success, fontSize: 13 }}>
                        {couponResult.coupon.discountPct ? `${couponResult.coupon.discountPct}% off` : `R$ ${couponResult.coupon.discountBrl?.toFixed(2)} off`}
                        {pricing.isFree && ' — GRÁTIS!'}
                      </p>
                      {couponResult.coupon.description && (
                        <p style={{ fontSize: 11, color: C.textSec, marginTop: 2 }}>{couponResult.coupon.description}</p>
                      )}
                    </div>
                    <button onClick={handleRemover} style={{ fontSize: 11, color: C.textSec, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                      remover
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleValidar()}
                    placeholder="CÓDIGO"
                    style={{ flex: 1, padding: '8px 12px', border: `1px solid ${couponError ? 'rgba(248,113,113,0.5)' : C.border}`, borderRadius: 8, fontSize: 13, fontFamily: 'monospace', fontWeight: 600, background: '#0D2E22', color: C.text, outline: 'none', textTransform: 'uppercase' }}
                  />
                  <button
                    onClick={handleValidar}
                    disabled={loading || !couponCode.trim()}
                    style={{ padding: '8px 14px', background: C.accent, color: '#fff', borderRadius: 8, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', opacity: loading || !couponCode.trim() ? 0.5 : 1 }}
                  >
                    {loading ? '…' : 'Aplicar'}
                  </button>
                </div>
              )}
              {couponError && <p style={{ fontSize: 11, color: '#F87171', marginTop: 6 }}>{couponError}</p>}
            </div>
          </div>
        </div>

        {/* Pagamento */}
        <div style={{ background: '#0A1A14', border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, color: C.text, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: C.textSec, marginBottom: 4 }}>Investimento</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
              {/* Preço cheio riscado: quando promoção ativa (sem cupom) ou quando cupom dá desconto */}
              {(!couponResult && planConfig.promo_active) && (
                <p style={{ fontSize: 18, fontWeight: 500, color: C.textSec, textDecoration: 'line-through' }}>
                  R$ {planConfig.price_full.toFixed(2).replace('.', ',')}
                </p>
              )}
              {(couponResult && pricing.discount > 0) && (
                <p style={{ fontSize: 18, fontWeight: 500, color: C.textSec, textDecoration: 'line-through' }}>
                  R$ {pricing.original.toFixed(2).replace('.', ',')}
                </p>
              )}
              <p style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: pricing.isFree ? C.success : C.text }}>
                {pricing.isFree ? 'GRÁTIS' : `R$ ${pricing.final.toFixed(2).replace('.', ',')}`}
                {!pricing.isFree && <span style={{ fontSize: 14, fontWeight: 500, color: C.textSec }}>/mês</span>}
              </p>
            </div>
            {!couponResult && planConfig.promo_active && (
              <p style={{ fontSize: 11, color: C.success, marginTop: 4 }}>
                {planConfig.promo_label}
              </p>
            )}
            {couponResult && pricing.discount > 0 && (
              <p style={{ fontSize: 11, color: C.success, marginTop: 4 }}>
                Economia de R$ {pricing.discount.toFixed(2).replace('.', ',')} com o cupom {couponResult.coupon.code}
              </p>
            )}
          </div>

          {!pricing.isFree && (
            <div style={{ background: C.accentDim, borderRadius: 10, padding: 16, border: `1px solid rgba(0,198,167,0.2)` }}>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.accent, marginBottom: 6 }}>Chave Pix</p>
              <p style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 16, color: C.text }}>{pixKey}</p>
            </div>
          )}

          <div style={{ background: 'rgba(0,198,167,0.06)', borderRadius: 10, padding: 16, fontSize: 13, color: C.textSec }}>
            <p style={{ fontWeight: 600, color: C.text, marginBottom: 8 }}>Como ativar:</p>
            {pricing.isFree ? (
              <ol style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 16 }}>
                <li>Entre em contato pelo WhatsApp <span style={{ color: C.accent, fontWeight: 600 }}>(27) 99871-4453</span> ou email <span style={{ color: C.accent, fontWeight: 600 }}>eduallochio2@outlook.com</span></li>
                <li>Informe o cupom <strong style={{ color: C.text }}>{couponResult?.coupon.code}</strong> e seu email de cadastro</li>
                <li>Ativamos em até 24h úteis</li>
              </ol>
            ) : (
              <ol style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 16 }}>
                <li>Faça o Pix de <strong style={{ color: C.text }}>R$ {pricing.final.toFixed(2).replace('.', ',')}</strong> para a chave acima</li>
                <li>Envie o comprovante pelo WhatsApp <span style={{ color: C.accent, fontWeight: 600 }}>(27) 99871-4453</span> ou email <span style={{ color: C.accent, fontWeight: 600 }}>eduallochio2@outlook.com</span></li>
                {couponResult && <li>Informe o cupom <strong style={{ color: C.text }}>{couponResult.coupon.code}</strong> no email</li>}
                <li>Informe seu email de cadastro</li>
                <li>Ativamos em até 24h úteis</li>
              </ol>
            )}
          </div>

          <p style={{ fontSize: 12, color: C.textSec }}>
            Seu email: <span style={{ color: C.text, fontWeight: 600 }}>{email}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
