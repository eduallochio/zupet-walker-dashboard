import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { formatCurrency } from '@/lib/utils';

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

export default async function DashboardPage() {
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
    .select('id, name, rating, plan')
    .eq('user_id', user.id)
    .single();

  const profileId = profile?.id;

  const [{ data: sessions }, { data: links }, { data: payments }, { data: recentReports }] = await Promise.all([
    profileId
      ? supabase.from('walk_sessions').select('id').eq('walker_id', profileId)
      : Promise.resolve({ data: [] }),
    profileId
      ? supabase.from('walker_pet_links').select('id, pet_id, status, linked_at').eq('walker_id', profileId).eq('status', 'active')
      : Promise.resolve({ data: [] }),
    profileId
      ? supabase.from('walker_payments').select('amount, status').eq('walker_id', profileId)
      : Promise.resolve({ data: [] }),
    profileId
      ? supabase.from('walk_reports').select('id, created_at, duration_minutes, distance_meters, pee_count, poop_count, photos').eq('walker_id', profileId).order('created_at', { ascending: false }).limit(3)
      : Promise.resolve({ data: [] }),
  ]);

  const petIds = (links ?? []).map((l: any) => l.pet_id).filter(Boolean);
  const { data: pets } = petIds.length
    ? await supabase.from('pets').select('id, name, breed, photo_uri, species').in('id', petIds)
    : { data: [] };

  const totalEarned = (payments ?? [])
    .filter((p: any) => p.status === 'paid')
    .reduce((s: number, p: any) => s + (p.amount ?? 0), 0);

  const firstName = profile?.name?.split(' ')[0] ?? 'Walker';

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0D2926', letterSpacing: '-0.03em' }}>Olá, {firstName} 👋</h1>
          <p style={{ fontSize: 13, color: '#6B7280', marginTop: 3 }}>Aqui está um resumo da sua atividade</p>
        </div>
        {profile?.plan === 'free' && (
          <a href="/dashboard/pro" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#00C6A7', color: '#fff', textDecoration: 'none',
            padding: '8px 16px', borderRadius: 8,
            fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em',
          }}>
            ⭐ Upgrade Pro
          </a>
        )}
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        <StatCard label="Passeios" value={String(sessions?.length ?? 0)} sub="no total" />
        <StatCard label="Pets vinculados" value={String(petIds.length)} sub="ativo agora" />
        <StatCard
          label="Avaliação"
          value={profile?.rating ? profile.rating.toFixed(1) : '—'}
          suffix={profile?.rating ? '/ 5' : undefined}
          sub={profile?.rating ? undefined : 'sem avaliações ainda'}
        />
        <StatCard label="Total recebido" value={formatCurrency(totalEarned)} sub="este mês" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Pets vinculados */}
        <div style={{ background: '#fff', border: '1px solid #D1EEEA', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 14px', borderBottom: '1px solid #e8f4f2' }}>
            <h2 style={{ fontWeight: 700, fontSize: 13, color: '#0D2926', letterSpacing: '-0.01em' }}>Pets vinculados</h2>
            <span style={{ fontSize: 11.5, color: '#6B7280', fontWeight: 500 }}>{petIds.length} ativo{petIds.length !== 1 ? 's' : ''}</span>
          </div>
          {!petIds.length ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>
              Nenhum pet vinculado ainda.<br />
              <span style={{ fontSize: 12, color: '#9CA3AF' }}>Tutores vinculam pets pelo app.</span>
            </div>
          ) : (
            <ul style={{ listStyle: 'none' }}>
              {(pets ?? []).map((pet: any, i: number) => (
                <li key={pet.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: i < (pets ?? []).length - 1 ? '1px solid #e8f4f2' : 'none' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#F5FAFA', border: '1px solid #e8f4f2', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                    {pet.photo_uri
                      ? <img src={pet.photo_uri} alt={pet.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : pet.species === 'cat' ? '🐱' : '🐶'}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 13.5, color: '#0D2926', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pet.name}</p>
                    <p style={{ fontSize: 12, color: '#6B7280', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pet.breed ?? pet.species ?? '—'}</p>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#00A88E', background: '#D1EEEA', padding: '3px 8px', borderRadius: 20, flexShrink: 0, letterSpacing: '0.01em' }}>Ativo</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Passeios recentes */}
        <div style={{ background: '#fff', border: '1px solid #D1EEEA', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 14px', borderBottom: '1px solid #e8f4f2' }}>
            <h2 style={{ fontWeight: 700, fontSize: 13, color: '#0D2926', letterSpacing: '-0.01em' }}>Passeios recentes</h2>
            <a href="/dashboard/relatorios" style={{ fontSize: 12, fontWeight: 600, color: '#00A88E', textDecoration: 'none' }}>Ver todos</a>
          </div>
          {!recentReports?.length ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>
              Nenhum passeio registrado ainda.
            </div>
          ) : (
            <ul style={{ listStyle: 'none' }}>
              {recentReports.map((r: any, i: number) => (
                <li key={r.id} style={{ padding: '13px 20px', borderBottom: i < recentReports.length - 1 ? '1px solid #e8f4f2' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#0D2926' }}>{formatRelative(r.created_at)}</span>
                    <span style={{ fontSize: 12, color: '#6B7280', fontVariantNumeric: 'tabular-nums' }}>{formatDuration(r.duration_minutes)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#4a6b65' }}>
                    {r.distance_meters > 0 && <span>📍 {(r.distance_meters / 1000).toFixed(1)} km</span>}
                    {r.pee_count > 0 && <span>💧 {r.pee_count}</span>}
                    {r.poop_count > 0 && <span>💩 {r.poop_count}</span>}
                    {r.photos?.length > 0 && <span>📸 {r.photos.length}</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, suffix, sub }: {
  label: string;
  value: string;
  suffix?: string;
  sub?: string;
}) {
  return (
    <div style={{ background: '#ffffff', border: '1px solid #D1EEEA', borderRadius: 12, padding: '18px 20px' }}>
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6B7280', marginBottom: 10 }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <p style={{ fontSize: 26, fontWeight: 800, color: '#0D2926', letterSpacing: '-0.04em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</p>
        {suffix && <span style={{ fontSize: 13, color: '#6B7280' }}>{suffix}</span>}
      </div>
      {sub && <p style={{ fontSize: 11.5, color: '#6B7280', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>{sub}</p>}
    </div>
  );
}

