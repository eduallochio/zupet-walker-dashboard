'use client';

import { useState } from 'react';

const BASE_PRICE = 29;

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

export default function ProClient({ isPro, email, pixKey }: { isPro: boolean; email: string; pixKey: string }) {
  const [couponCode, setCouponCode] = useState('');
  const [couponResult, setCouponResult] = useState<CouponResult | null>(null);
  const [couponError, setCouponError] = useState('');
  const [loading, setLoading] = useState(false);

  const pricing = couponResult?.pricing ?? { original: BASE_PRICE, discount: 0, final: BASE_PRICE, isFree: false };

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

  if (isPro) {
    return (
      <div style={{ maxWidth: 560 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0D2926', letterSpacing: '-0.03em', marginBottom: 28 }}>Plano Pro</h1>
        <div style={{ background: '#fff', border: '1px solid #D1EEEA', borderRadius: 12, padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>✦</div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#00A88E', marginBottom: 8 }}>Você já é Pro!</h2>
          <p style={{ fontSize: 14, color: '#6B7280' }}>Aproveite todos os recursos sem limites.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0D2926', letterSpacing: '-0.03em', marginBottom: 28 }}>Assinar Plano Pro</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Benefícios */}
        <div style={{ background: '#fff', border: '1px solid #D1EEEA', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px 14px', borderBottom: '1px solid #e8f4f2' }}>
            <h2 style={{ fontWeight: 700, color: '#0D2926', fontSize: 13, letterSpacing: '-0.01em' }}>O que você ganha com o Pro</h2>
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
                <li key={text as string} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#4a6b65' }}>
                  <span style={{ fontSize: 16, lineHeight: 1.4 }}>{icon}</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>

            {/* Campo de cupom */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #e8f4f2' }}>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#6B7280', marginBottom: 8 }}>
                Cupom de desconto
              </p>
              {couponResult ? (
                <div style={{ background: '#f0fdf8', border: '1px solid #6ee7b7', borderRadius: 8, padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontWeight: 700, color: '#065f46', fontSize: 13 }}>
                        {couponResult.coupon.discountPct ? `${couponResult.coupon.discountPct}% off` : `R$ ${couponResult.coupon.discountBrl?.toFixed(2)} off`}
                        {pricing.isFree && ' — GRÁTIS!'}
                      </p>
                      {couponResult.coupon.description && (
                        <p style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{couponResult.coupon.description}</p>
                      )}
                    </div>
                    <button onClick={handleRemover} style={{ fontSize: 11, color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
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
                    style={{ flex: 1, padding: '8px 12px', border: `1px solid ${couponError ? '#fca5a5' : '#D1EEEA'}`, borderRadius: 8, fontSize: 13, fontFamily: 'monospace', fontWeight: 600, background: '#fff', outline: 'none', textTransform: 'uppercase' }}
                  />
                  <button
                    onClick={handleValidar}
                    disabled={loading || !couponCode.trim()}
                    style={{ padding: '8px 14px', background: '#0D2926', color: '#fff', borderRadius: 8, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', opacity: loading || !couponCode.trim() ? 0.5 : 1 }}
                  >
                    {loading ? '…' : 'Aplicar'}
                  </button>
                </div>
              )}
              {couponError && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 6 }}>{couponError}</p>}
            </div>
          </div>
        </div>

        {/* Pagamento */}
        <div style={{ background: '#0D2926', borderRadius: 12, padding: 24, color: '#fff', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 4 }}>Investimento</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              {couponResult && pricing.discount > 0 && (
                <p style={{ fontSize: 18, fontWeight: 500, color: 'rgba(255,255,255,0.35)', textDecoration: 'line-through' }}>
                  R$ {pricing.original}
                </p>
              )}
              <p style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: pricing.isFree ? '#6ee7b7' : '#fff' }}>
                {pricing.isFree ? 'GRÁTIS' : `R$ ${pricing.final.toFixed(2).replace('.', ',')}`}
                {!pricing.isFree && <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.5)' }}>/mês</span>}
              </p>
            </div>
            {couponResult && pricing.discount > 0 && (
              <p style={{ fontSize: 11, color: '#6ee7b7', marginTop: 4 }}>
                Economia de R$ {pricing.discount.toFixed(2).replace('.', ',')} com o cupom {couponResult.coupon.code}
              </p>
            )}
          </div>

          {!pricing.isFree && (
            <div style={{ background: 'rgba(0,198,167,0.12)', borderRadius: 10, padding: 16, border: '1px solid rgba(0,198,167,0.2)' }}>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#00C6A7', marginBottom: 6 }}>Chave Pix</p>
              <p style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 16, color: '#fff' }}>{pixKey}</p>
            </div>
          )}

          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 16, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
            <p style={{ fontWeight: 600, color: '#fff', marginBottom: 8 }}>Como ativar:</p>
            {pricing.isFree ? (
              <ol style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 16 }}>
                <li>Envie um email para <span style={{ color: '#00C6A7', fontWeight: 600 }}>contato@zupet.io</span></li>
                <li>Informe o cupom <strong>{couponResult?.coupon.code}</strong> e seu email de cadastro</li>
                <li>Ativamos em até 24h úteis</li>
              </ol>
            ) : (
              <ol style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 16 }}>
                <li>Faça o Pix de <strong>R$ {pricing.final.toFixed(2).replace('.', ',')}</strong> para a chave acima</li>
                <li>Envie o comprovante para <span style={{ color: '#00C6A7', fontWeight: 600 }}>contato@zupet.io</span></li>
                {couponResult && <li>Informe o cupom <strong>{couponResult.coupon.code}</strong> no email</li>}
                <li>Informe seu email de cadastro</li>
                <li>Ativamos em até 24h úteis</li>
              </ol>
            )}
          </div>

          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)' }}>
            Seu email: <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{email}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
