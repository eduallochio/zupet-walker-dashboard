import { createClient } from '@supabase/supabase-js';
import { AnimatedCounter } from './animated-counter';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function ActivityStatsSection() {
  // Em produção filtra perfis de teste; em dev mostra todos
  let wq = supabaseAdmin.from('walker_profiles').select('id');
  if (process.env.NODE_ENV === 'production') wq = wq.eq('is_test_profile', false);
  const { data: realWalkers } = await wq;
  const realWalkerIds = (realWalkers ?? []).map((w: { id: string }) => w.id);

  const [sessionsResult, distanceResult] = await Promise.all([
    realWalkerIds.length === 0
      ? Promise.resolve({ count: 0 })
      : supabaseAdmin
          .from('walk_sessions')
          .select('*', { count: 'exact', head: true })
          .not('ended_at', 'is', null)
          .in('walker_id', realWalkerIds),
    realWalkerIds.length === 0
      ? Promise.resolve({ data: [] })
      : supabaseAdmin
          .from('walk_sessions')
          .select('distance_meters')
          .not('ended_at', 'is', null)
          .not('distance_meters', 'is', null)
          .in('walker_id', realWalkerIds),
  ]);

  const totalSessions = sessionsResult.count ?? 0;
  const totalKm = Math.round(
    ((distanceResult.data ?? []) as { distance_meters: number }[])
      .reduce((sum, r) => sum + (r.distance_meters ?? 0), 0) / 1000
  );

  if (totalSessions === 0 && totalKm === 0) return null;

  const stats = [
    {
      value: totalSessions,
      suffix: '',
      label: 'Passeios realizados',
      icon: '🦮',
    },
    {
      value: totalKm,
      suffix: ' km',
      label: 'Percorridos com pets',
      icon: '📍',
    },
  ];

  return (
    <section className="lp-activity-stats">
      <p className="lp-section-label">Impacto</p>
      <h2 className="lp-section-title">Cada passeio conta</h2>
      <div className="lp-activity-grid">
        {stats.map((s) => (
          <div key={s.label} className="lp-activity-card">
            <span className="lp-activity-icon">{s.icon}</span>
            <div className="lp-activity-num">
              <AnimatedCounter value={s.value} suffix={s.suffix} />
            </div>
            <div className="lp-activity-label">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
