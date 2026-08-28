import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const C = {
  bg: '#0D1F18', card: '#132219', border: 'rgba(0,200,167,0.12)',
  accent: '#00C6A7', accentDim: 'rgba(0,198,167,0.12)',
  text: '#E8F5F0', textSec: '#7FA898', textMuted: '#4A6B60',
  success: '#22D3A5', warning: '#F59E0B', danger: '#F87171',
};

const TYPE_EMOJI: Record<string, string> = {
  walk:    '🦮',
  bath:    '🛁',
  hotel:   '🏠',
  vet:     '🩺',
  day_care:'☀️',
  training:'🎓',
};

const BILLING_LABEL: Record<string, string> = {
  per_session: 'por sessão',
  daily:       'diário',
  weekly:      'semanal',
  biweekly:    'quinzenal',
  monthly:     'mensal',
};

function formatPrice(v: number | null) {
  if (v == null) return null;
  return `R$ ${v.toFixed(2).replace('.', ',')}`;
}

function formatDuration(min: number | null) {
  if (!min) return null;
  if (min < 60) return `${min}min`;
  return `${Math.floor(min / 60)}h${min % 60 ? (min % 60) + 'min' : ''}`;
}

export default async function ServicosPage() {
  const jar = await cookies();
  const accessToken = jar.get('sb-access-token')?.value!;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('walker_profiles').select('id').eq('user_id', user.id).single();

  const { data: services } = profile?.id ? await supabase
    .from('walker_services')
    .select('id, type, label, description, price, price_daily, price_weekly, price_biweekly, price_monthly, duration_minutes, max_pets, active, sort_order')
    .eq('walker_id', profile.id)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true }) : { data: [] };

  const rows = (services ?? []) as any[];
  const active   = rows.filter((s: any) => s.active);
  const inactive = rows.filter((s: any) => !s.active);

  return (
    <div style={{ padding: '28px 24px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: '-0.03em' }}>Serviços</h1>
          <p style={{ fontSize: 13, color: C.textSec, marginTop: 3 }}>
            {active.length} serviço{active.length !== 1 ? 's' : ''} ativo{active.length !== 1 ? 's' : ''} no seu perfil
          </p>
        </div>
        <div style={{ fontSize: 12, color: C.textSec, background: C.card, border: `1px solid ${C.border}`, padding: '6px 14px', borderRadius: 20 }}>
          Gerencie no app
        </div>
      </div>

      {rows.length === 0 ? (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '48px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🦮</div>
          <p style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 6 }}>Nenhum serviço cadastrado</p>
          <p style={{ fontSize: 13, color: C.textSec }}>Adicione serviços no app para que tutores possam te contratar.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Ativos */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontWeight: 700, fontSize: 13, color: C.text, letterSpacing: '-0.01em' }}>Ativos</h2>
              <span style={{ fontSize: 12, color: C.accent, background: C.accentDim, padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>{active.length}</span>
            </div>
            {active.length === 0 ? (
              <div style={{ padding: '24px 20px', textAlign: 'center', fontSize: 13, color: C.textMuted }}>Nenhum serviço ativo.</div>
            ) : (
              <ul>
                {active.map((svc: any, i: number) => (
                  <ServiceRow key={svc.id} svc={svc} i={i} />
                ))}
              </ul>
            )}
          </div>

          {/* Inativos */}
          {inactive.length > 0 && (
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', opacity: 0.6 }}>
              <div style={{ padding: '16px 20px 14px', borderBottom: `1px solid ${C.border}` }}>
                <h2 style={{ fontWeight: 700, fontSize: 13, color: C.textSec, letterSpacing: '-0.01em' }}>Inativos</h2>
              </div>
              <ul>
                {inactive.map((svc: any, i: number) => (
                  <ServiceRow key={svc.id} svc={svc} i={i} />
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ServiceRow({ svc, i }: { svc: any; i: number }) {
  const emoji = TYPE_EMOJI[svc.type] ?? '🐾';
  const dur   = formatDuration(svc.duration_minutes);

  const prices: string[] = [];
  if (svc.price != null)          prices.push(`${formatPrice(svc.price)} ${BILLING_LABEL['per_session'] ?? 'por sessão'}`);
  if (svc.price_daily != null)    prices.push(`${formatPrice(svc.price_daily)} ${BILLING_LABEL['daily']}`);
  if (svc.price_weekly != null)   prices.push(`${formatPrice(svc.price_weekly)} ${BILLING_LABEL['weekly']}`);
  if (svc.price_biweekly != null) prices.push(`${formatPrice(svc.price_biweekly)} ${BILLING_LABEL['biweekly']}`);
  if (svc.price_monthly != null)  prices.push(`${formatPrice(svc.price_monthly)} ${BILLING_LABEL['monthly']}`);

  const Sr = {
    card: '#132219', border: 'rgba(0,200,167,0.12)', accent: '#00C6A7',
    accentDim: 'rgba(0,198,167,0.12)', text: '#E8F5F0', textSec: '#7FA898', textMuted: '#4A6B60',
    success: '#22D3A5',
  };
  return (
    <li style={{ padding: '14px 20px', borderTop: i > 0 ? `1px solid ${Sr.border}` : 'none', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: Sr.accentDim, border: `1px solid ${Sr.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
        {emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 4, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: Sr.text }}>{svc.label}</span>
          {svc.active
            ? <span style={{ fontSize: 11, fontWeight: 600, color: Sr.success, background: 'rgba(34,211,165,0.15)', padding: '2px 8px', borderRadius: 20 }}>Ativo</span>
            : <span style={{ fontSize: 11, fontWeight: 600, color: Sr.textSec, background: 'rgba(127,168,152,0.12)', padding: '2px 8px', borderRadius: 20 }}>Inativo</span>
          }
        </div>
        {svc.description && (
          <p style={{ fontSize: 12, color: Sr.textSec, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{svc.description}</p>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 12 }}>
          {prices.map((p, j) => (
            <span key={j} style={{ background: Sr.accentDim, border: `1px solid ${Sr.border}`, padding: '2px 10px', borderRadius: 20, fontWeight: 600, color: Sr.accent }}>{p}</span>
          ))}
          {dur && <span style={{ color: Sr.textSec }}>⏱ {dur}</span>}
          {svc.max_pets && <span style={{ color: Sr.textSec }}>🐶 até {svc.max_pets} pets</span>}
        </div>
      </div>
    </li>
  );
}
