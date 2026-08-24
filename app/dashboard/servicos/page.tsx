import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

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
    <div className="space-y-6">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0D2926', letterSpacing: '-0.03em' }}>Serviços</h1>
          <p style={{ fontSize: 13, color: '#6B7280', marginTop: 3 }}>
            {active.length} serviço{active.length !== 1 ? 's' : ''} ativo{active.length !== 1 ? 's' : ''} no seu perfil
          </p>
        </div>
        <div style={{ fontSize: 12, color: '#6B7280', background: '#F5FAFA', border: '1px solid #D1EEEA', padding: '6px 14px', borderRadius: 20 }}>
          Gerencie no app
        </div>
      </div>

      {rows.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #D1EEEA', borderRadius: 12, padding: '48px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🦮</div>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#0D2926', marginBottom: 6 }}>Nenhum serviço cadastrado</p>
          <p style={{ fontSize: 13, color: '#6B7280' }}>Adicione serviços no app para que tutores possam te contratar.</p>
        </div>
      ) : (
        <>
          {/* Ativos */}
          <div style={{ background: '#fff', border: '1px solid #D1EEEA', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px 14px', borderBottom: '1px solid #e8f4f2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontWeight: 700, fontSize: 13, color: '#0D2926', letterSpacing: '-0.01em' }}>Ativos</h2>
              <span style={{ fontSize: 12, color: '#00A88E', background: '#D1EEEA', padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>{active.length}</span>
            </div>
            {active.length === 0 ? (
              <div style={{ padding: '24px 20px', textAlign: 'center', fontSize: 13, color: '#9CA3AF' }}>Nenhum serviço ativo.</div>
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
            <div style={{ background: '#fff', border: '1px solid #D1EEEA', borderRadius: 12, overflow: 'hidden', opacity: 0.7 }}>
              <div style={{ padding: '16px 20px 14px', borderBottom: '1px solid #e8f4f2' }}>
                <h2 style={{ fontWeight: 700, fontSize: 13, color: '#6B7280', letterSpacing: '-0.01em' }}>Inativos</h2>
              </div>
              <ul>
                {inactive.map((svc: any, i: number) => (
                  <ServiceRow key={svc.id} svc={svc} i={i} />
                ))}
              </ul>
            </div>
          )}
        </>
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

  return (
    <li style={{ padding: '14px 20px', borderTop: i > 0 ? '1px solid #e8f4f2' : 'none', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: '#F5FAFA', border: '1px solid #D1EEEA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
        {emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#0D2926' }}>{svc.label}</span>
          {svc.active
            ? <span style={{ fontSize: 11, fontWeight: 600, color: '#00A88E', background: '#D1EEEA', padding: '2px 8px', borderRadius: 20 }}>Ativo</span>
            : <span style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', background: '#F3F4F6', padding: '2px 8px', borderRadius: 20 }}>Inativo</span>
          }
        </div>
        {svc.description && (
          <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{svc.description}</p>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 12, color: '#4a6b65' }}>
          {prices.map((p, j) => (
            <span key={j} style={{ background: '#F5FAFA', border: '1px solid #D1EEEA', padding: '2px 10px', borderRadius: 20, fontWeight: 600, color: '#0D2926' }}>{p}</span>
          ))}
          {dur && <span style={{ color: '#6B7280' }}>⏱ {dur}</span>}
          {svc.max_pets && <span style={{ color: '#6B7280' }}>🐶 até {svc.max_pets} pets</span>}
        </div>
      </div>
    </li>
  );
}
