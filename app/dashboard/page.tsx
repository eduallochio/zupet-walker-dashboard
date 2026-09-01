import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { formatCurrency } from '@/lib/utils';
import { MonthNav } from './financeiro/MonthNav';

function formatRelative(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return 'hoje';
  if (diffDays === 1) return 'ontem';
  if (diffDays < 7) return `${diffDays} dias atrás`;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function formatDuration(min: number | null) {
  if (!min) return '—';
  if (min < 60) return `${min}min`;
  return `${Math.floor(min / 60)}h${min % 60 ? (min % 60) + 'min' : ''}`;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

const SERVICE_LABEL: Record<string, string> = {
  walk: 'Passeio', bath: 'Banho e Tosa', boarding: 'Hospedagem',
  daycare: 'Creche', vet_visit: 'Visita ao Vet', training: 'Adestramento',
};
const SERVICE_ICON: Record<string, string> = {
  walk: '🦮', bath: '🛁', boarding: '🌙', daycare: '🏠', vet_visit: '🏥', training: '🎯',
};

export default async function DashboardPage({ searchParams }: { searchParams?: Promise<{ mes?: string; ano?: string }> }) {
  const sp = await (searchParams ?? Promise.resolve({} as { mes?: string; ano?: string }));
  const now = new Date();
  // URL usa mês 1-based; internamente 0-based
  const viewMonth = sp.mes !== undefined ? parseInt(sp.mes) - 1 : now.getMonth();
  const viewYear  = sp.ano !== undefined ? parseInt(sp.ano)     : now.getFullYear();

  const filterStart = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-01T00:00:00.000Z`;
  const lastDay = new Date(Date.UTC(viewYear, viewMonth + 1, 0)).getUTCDate();
  const filterEnd   = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}T23:59:59.999Z`;
  // Mês anterior para comparação de faturamento
  const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
  const prevYear  = viewMonth === 0 ? viewYear - 1 : viewYear;
  const prevFilterStart = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-01T00:00:00.000Z`;
  const prevFilterEnd   = filterStart;

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
    .from('walker_profiles')
    .select('id, name, rating, plan, avatar_url, city, experience_years')
    .eq('user_id', user.id)
    .single();

  const profileId = profile?.id;

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const next7days = new Date(); next7days.setDate(next7days.getDate() + 7);

  const [
    { data: allSessions },
    { data: links },
    { data: allPayments },
    { data: prevPayments },
    { data: recentReports },
    { data: ratingsData },
    { data: upcomingSchedules },
    { data: pendingSchedules },
  ] = await Promise.all([
    profileId
      ? supabase.from('walk_sessions').select('id').eq('walker_id', profileId)
      : Promise.resolve({ data: [] }),
    profileId
      ? supabase.from('walker_pet_links').select('id, pet_id, status, linked_at').eq('walker_id', profileId).eq('status', 'active')
      : Promise.resolve({ data: [] }),
    profileId
      ? supabase.from('walker_payments').select('amount, status, created_at').eq('walker_id', profileId).gte('created_at', filterStart).lte('created_at', filterEnd)
      : Promise.resolve({ data: [] }),
    profileId
      ? supabase.from('walker_payments').select('amount, status').eq('walker_id', profileId).gte('created_at', prevFilterStart).lt('created_at', prevFilterEnd)
      : Promise.resolve({ data: [] }),
    profileId
      ? supabase.from('walk_reports').select('id, created_at, duration_minutes, distance_meters, pee_count, poop_count, photos').eq('walker_id', profileId).gte('created_at', filterStart).lte('created_at', filterEnd).order('created_at', { ascending: false }).limit(4)
      : Promise.resolve({ data: [] }),
    profileId
      ? supabase.from('walker_ratings').select('rating').eq('walker_id', profileId)
      : Promise.resolve({ data: [] }),
    profileId
      ? supabase.from('walk_schedules')
          .select('id, scheduled_at, status, pet_ids, walker_services(type, label)')
          .eq('walker_id', profileId)
          .in('status', ['confirmed', 'proposed'])
          .gte('scheduled_at', todayStart.toISOString())
          .lte('scheduled_at', next7days.toISOString())
          .order('scheduled_at', { ascending: true })
          .limit(5)
      : Promise.resolve({ data: [] }),
    profileId
      ? supabase.from('walk_schedules')
          .select('id', { count: 'exact', head: true })
          .eq('walker_id', profileId)
          .eq('status', 'proposed')
      : Promise.resolve({ data: [], count: 0 }),
  ]);

  const avgRating = ratingsData && ratingsData.length > 0
    ? Math.round(ratingsData.reduce((s: number, r: any) => s + Number(r.rating), 0) / ratingsData.length * 10) / 10
    : null;
  const ratingCount = ratingsData?.length ?? 0;

  const petIds = (links ?? []).map((l: any) => l.pet_id).filter(Boolean);
  const { data: pets } = petIds.length
    ? await supabase.from('pets').select('id, name, breed, photo_uri, species').in('id', petIds)
    : { data: [] };

  const thisMonthEarned = (allPayments ?? [])
    .filter((p: any) => p.status === 'paid')
    .reduce((s: number, p: any) => s + (p.amount ?? 0), 0);

  const prevMonthEarned = (prevPayments ?? [])
    .filter((p: any) => p.status === 'paid')
    .reduce((s: number, p: any) => s + (p.amount ?? 0), 0);

  const earningTrend = prevMonthEarned > 0
    ? Math.round(((thisMonthEarned - prevMonthEarned) / prevMonthEarned) * 100)
    : null;

  const pendingCount = (pendingSchedules as any)?.count ?? 0;
  const firstName = profile?.name?.split(' ')[0] ?? 'Walker';
  const initials = profile?.name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() ?? '?';

  const MONTHS_PT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

  // Estrelas para avaliação
  const starFull = Math.floor(avgRating ?? 0);
  const starHalf = avgRating ? ((avgRating % 1) >= 0.5 ? 1 : 0) : 0;

  const C = {
    bg: '#0D1F18',
    card: '#132219',
    cardBorder: 'rgba(0,200,167,0.12)',
    cardBorderHover: 'rgba(0,200,167,0.25)',
    accent: '#00C6A7',
    accentDim: 'rgba(0,198,167,0.12)',
    accentDimStrong: 'rgba(0,198,167,0.2)',
    textPrimary: '#E8F5F0',
    textSecondary: '#7FA898',
    textMuted: '#4A6B60',
    success: '#22D3A5',
    warning: '#F59E0B',
    danger: '#F87171',
    gold: '#FFB800',
    purple: '#A78BFA',
    blue: '#60A5FA',
  };

  return (
    <div style={{ color: C.textPrimary, fontFamily: 'inherit' }}>

      {/* ── HEADER ── */}
      <div className="db-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
            background: profile?.avatar_url ? 'transparent' : `linear-gradient(135deg, ${C.accent}, #008F7A)`,
            border: `2px solid ${C.accentDimStrong}`,
            overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 700, color: '#fff',
            boxShadow: `0 0 0 4px ${C.accentDim}`,
          }}>
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt={firstName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initials}
          </div>
          <div>
            <p style={{ fontSize: 12, color: C.textMuted, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>
              {getGreeting()}
            </p>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: C.textPrimary, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              {firstName}
              {profile?.city && (
                <span style={{ fontSize: 13, fontWeight: 400, color: C.textSecondary, marginLeft: 10 }}>
                  📍 {profile.city}
                </span>
              )}
            </h1>
          </div>
          <MonthNav viewMonth={viewMonth} viewYear={viewYear} basePath="/dashboard" />
        </div>

        <div className="db-header-actions">
          {/* Badge plano */}
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
            padding: '5px 12px', borderRadius: 20,
            background: profile?.plan === 'pro' ? 'linear-gradient(135deg, #FFB800, #FF8C00)' : C.accentDim,
            color: profile?.plan === 'pro' ? '#fff' : C.accent,
            border: profile?.plan === 'pro' ? 'none' : `1px solid ${C.cardBorder}`,
          }}>
            {profile?.plan === 'pro' ? '⭐ PRO' : 'FREE'}
          </span>

          {pendingCount > 0 && (
            <a href="/dashboard/agenda" style={{
              display: 'flex', alignItems: 'center', gap: 7,
              background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
              color: C.warning, textDecoration: 'none',
              padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
            }}>
              <span style={{
                width: 18, height: 18, background: C.warning, borderRadius: '50%',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 800, color: '#1a0f00',
              }}>{pendingCount}</span>
              solicitaç{pendingCount === 1 ? 'ão' : 'ões'} pendente{pendingCount !== 1 ? 's' : ''}
            </a>
          )}

          {profile?.plan === 'free' && (
            <a href="/dashboard/pro" style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'linear-gradient(135deg, #00C6A7, #008F7A)',
              color: '#fff', textDecoration: 'none',
              padding: '8px 18px', borderRadius: 20,
              fontSize: 12, fontWeight: 700, letterSpacing: '-0.01em',
              boxShadow: '0 4px 16px rgba(0,198,167,0.3)',
            }}>
              ⭐ Upgrade Pro
            </a>
          )}
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="db-stat-grid">
        <StatCard
          icon="🦮" label="Passeios" value={String(allSessions?.length ?? 0)}
          sub="no total" accent={C.accent} accentDim={C.accentDim} C={C}
        />
        <StatCard
          icon="🐾" label="Pets vinculados" value={String(petIds.length)}
          sub="ativos agora" accent={C.purple} accentDim="rgba(167,139,250,0.12)" C={C}
        />
        <StatCard
          icon="⭐" label="Avaliação"
          value={avgRating ? avgRating.toFixed(1) : '—'}
          suffix={avgRating ? `/ 5` : undefined}
          sub={avgRating ? `${ratingCount} avaliação${ratingCount !== 1 ? 'ões' : ''}` : 'sem avaliações ainda'}
          accent={C.gold} accentDim="rgba(255,184,0,0.12)" C={C}
        />
        <StatCard
          icon="💰" label={`Faturamento — ${MONTHS_PT[viewMonth]}`}
          value={formatCurrency(thisMonthEarned)}
          sub={earningTrend !== null
            ? earningTrend >= 0 ? `▲ ${earningTrend}% vs. mês anterior` : `▼ ${Math.abs(earningTrend)}% vs. mês anterior`
            : `${MONTHS_PT[viewMonth]} ${viewYear}`}
          subColor={earningTrend !== null ? (earningTrend >= 0 ? C.success : C.danger) : undefined}
          accent={C.success} accentDim="rgba(34,211,165,0.12)" C={C}
        />
      </div>

      {/* ── LINHA 2: próximos agendamentos + pets ── */}
      <div className="db-row2">

        {/* Próximos agendamentos */}
        <div style={{
          background: C.card, border: `1px solid ${C.cardBorder}`,
          borderRadius: 16, overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px 14px', borderBottom: `1px solid ${C.cardBorder}`,
          }}>
            <h2 style={{ fontWeight: 700, fontSize: 13, color: C.textPrimary, letterSpacing: '-0.01em' }}>
              Próximos 7 dias
            </h2>
            <a href="/dashboard/agenda" style={{ fontSize: 12, fontWeight: 600, color: C.accent, textDecoration: 'none' }}>
              Ver agenda →
            </a>
          </div>
          {!upcomingSchedules?.length ? (
            <div style={{ padding: '36px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>📅</div>
              <p style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.5 }}>
                Nenhum agendamento nos próximos 7 dias.
              </p>
            </div>
          ) : (
            <ul style={{ listStyle: 'none' }}>
              {(upcomingSchedules as any[]).map((s: any, i: number) => {
                const svcType = s.walker_services?.type ?? 'walk';
                const isToday = new Date(s.scheduled_at).toDateString() === new Date().toDateString();
                const isPending = s.status === 'proposed';
                return (
                  <li key={s.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 20px',
                    borderBottom: i < upcomingSchedules.length - 1 ? `1px solid ${C.cardBorder}` : 'none',
                    background: isToday ? C.accentDim : 'transparent',
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: isToday ? C.accentDimStrong : 'rgba(255,255,255,0.04)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                    }}>
                      {SERVICE_ICON[svcType] ?? '📋'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {SERVICE_LABEL[svcType] ?? s.walker_services?.label ?? 'Serviço'}
                        {isToday && <span style={{ fontSize: 10, fontWeight: 700, color: C.accent, marginLeft: 8, letterSpacing: '0.06em' }}>HOJE</span>}
                      </p>
                      <p style={{ fontSize: 11.5, color: C.textSecondary, marginTop: 2 }}>
                        {new Date(s.scheduled_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} · {new Date(s.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        {' · '}{s.pet_ids?.length ?? 0} pet{(s.pet_ids?.length ?? 0) !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                      background: isPending ? 'rgba(245,158,11,0.15)' : C.accentDim,
                      color: isPending ? C.warning : C.accent,
                      border: `1px solid ${isPending ? 'rgba(245,158,11,0.25)' : C.cardBorder}`,
                      whiteSpace: 'nowrap',
                    }}>
                      {isPending ? 'Aguardando' : 'Confirmado'}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Pets vinculados */}
        <div style={{
          background: C.card, border: `1px solid ${C.cardBorder}`,
          borderRadius: 16, overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px 14px', borderBottom: `1px solid ${C.cardBorder}`,
          }}>
            <h2 style={{ fontWeight: 700, fontSize: 13, color: C.textPrimary, letterSpacing: '-0.01em' }}>
              Pets vinculados
            </h2>
            <span style={{ fontSize: 11.5, color: C.textSecondary, fontWeight: 500 }}>
              {petIds.length} ativo{petIds.length !== 1 ? 's' : ''}
            </span>
          </div>
          {!petIds.length ? (
            <div style={{ padding: '36px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🐾</div>
              <p style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.5 }}>
                Nenhum pet vinculado ainda.<br />
                <span style={{ fontSize: 12, color: C.textMuted }}>Tutores vinculam pets pelo app.</span>
              </p>
            </div>
          ) : (
            <ul style={{ listStyle: 'none' }}>
              {(pets ?? []).map((pet: any, i: number) => (
                <li key={pet.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 20px',
                  borderBottom: i < (pets ?? []).length - 1 ? `1px solid ${C.cardBorder}` : 'none',
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.cardBorder}`,
                    overflow: 'hidden', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                  }}>
                    {pet.photo_uri
                      ? <img src={pet.photo_uri} alt={pet.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : (pet.species?.toLowerCase().includes('cat') || pet.species?.toLowerCase().includes('gato') ? '🐱' : '🐶')}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 13.5, color: C.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {pet.name}
                    </p>
                    <p style={{ fontSize: 12, color: C.textSecondary, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {pet.breed ?? pet.species ?? '—'}
                    </p>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: C.success,
                    background: 'rgba(34,211,165,0.12)',
                    border: '1px solid rgba(34,211,165,0.2)',
                    padding: '3px 9px', borderRadius: 20, letterSpacing: '0.04em',
                  }}>
                    Ativo
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ── LINHA 3: Passeios recentes ── */}
      <div style={{
        background: C.card, border: `1px solid ${C.cardBorder}`,
        borderRadius: 16, overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px 14px', borderBottom: `1px solid ${C.cardBorder}`,
        }}>
          <h2 style={{ fontWeight: 700, fontSize: 13, color: C.textPrimary, letterSpacing: '-0.01em' }}>
            Passeios recentes
          </h2>
          <a href="/dashboard/relatorios" style={{ fontSize: 12, fontWeight: 600, color: C.accent, textDecoration: 'none' }}>
            Ver relatórios →
          </a>
        </div>
        {!recentReports?.length ? (
          <div style={{ padding: '36px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🦮</div>
            <p style={{ fontSize: 13, color: C.textSecondary }}>Nenhum passeio registrado ainda.</p>
          </div>
        ) : (
          <div className="db-reports-grid">
            {recentReports.map((r: any, i: number) => (
              <div key={r.id} style={{
                padding: '16px 20px',
                borderRight: i < recentReports.length - 1 ? `1px solid ${C.cardBorder}` : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary }}>{formatRelative(r.created_at)}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: C.accent,
                    background: C.accentDim, padding: '2px 8px', borderRadius: 20,
                  }}>{formatDuration(r.duration_minutes)}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {r.distance_meters > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.textSecondary }}>
                      <span style={{ fontSize: 14 }}>📍</span>
                      <span style={{ fontVariantNumeric: 'tabular-nums' }}>{(r.distance_meters / 1000).toFixed(1)} km</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 10, fontSize: 12, color: C.textSecondary }}>
                    {r.pee_count > 0 && <span>💧 {r.pee_count}</span>}
                    {r.poop_count > 0 && <span>💩 {r.poop_count}</span>}
                    {r.photos?.length > 0 && <span>📸 {r.photos.length}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

function StatCard({ icon, label, value, suffix, sub, subColor, accent, accentDim, C }: {
  icon: string;
  label: string;
  value: string;
  suffix?: string;
  sub?: string;
  subColor?: string;
  accent: string;
  accentDim: string;
  C: Record<string, string>;
}) {
  return (
    <div style={{
      background: C.card,
      border: `1px solid rgba(255,255,255,0.06)`,
      borderRadius: 16, padding: '20px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Glow de fundo */}
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 80, height: 80, borderRadius: '50%',
        background: accentDim, filter: 'blur(20px)',
        pointerEvents: 'none',
      }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase' as const, color: C.textMuted }}>
          {label}
        </p>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: accentDim, display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: 15,
        }}>
          {icon}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: 6 }}>
        <p style={{
          fontSize: 28, fontWeight: 800, color: C.textPrimary,
          letterSpacing: '-0.04em', lineHeight: 1, fontVariantNumeric: 'tabular-nums',
        }}>{value}</p>
        {suffix && <span style={{ fontSize: 13, color: C.textSecondary }}>{suffix}</span>}
      </div>
      {sub && (
        <p style={{ fontSize: 11.5, color: subColor ?? C.textMuted, fontWeight: subColor ? 600 : 400 }}>
          {sub}
        </p>
      )}
    </div>
  );
}
