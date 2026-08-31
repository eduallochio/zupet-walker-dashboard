import { createClient } from '@supabase/supabase-js';
import { AnimatedCounter } from './animated-counter';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const isProd = process.env.NODE_ENV === 'production';

export async function StatsSection() {
  let wq = supabaseAdmin.from('walker_profiles').select('*', { count: 'exact', head: true }).eq('active', true);
  if (isProd) wq = wq.eq('is_test_profile', false);

  let cq = supabaseAdmin.from('walker_profiles').select('city', { count: 'exact', head: false }).eq('active', true);
  if (isProd) cq = cq.eq('is_test_profile', false);

  let rq = supabaseAdmin.from('walker_ratings').select('walker_id, walker_profiles!inner(is_test_profile)', { count: 'exact', head: true });
  if (isProd) rq = rq.eq('walker_profiles.is_test_profile', false);

  const [{ count: walkersCount }, { count: citiesCount }, { count: ratingsCount }] =
    await Promise.all([
      wq.then((r) => ({ count: r.count ?? 0 })),
      cq.not('city', 'is', null).then((r) => {
        const unique = new Set((r.data ?? []).map((x: { city: string }) => x.city));
        return { count: unique.size };
      }),
      rq.then((r) => ({ count: r.count ?? 0 })),
    ]);

  const stats = [
    { value: walkersCount, suffix: '', label: 'Walkers ativos' },
    { value: citiesCount,  suffix: '', label: 'Cidades atendidas' },
    { value: ratingsCount, suffix: '', label: 'Avaliações' },
  ];

  // Only show if at least one metric has real data
  const hasData = stats.some((s) => s.value > 0);
  if (!hasData) return null;

  return (
    <section className="lp-stats">
      {stats.map((s) => (
        <div key={s.label} className="lp-stat-item">
          <div className="lp-stat-num">
            <AnimatedCounter value={s.value} suffix={s.suffix} />
          </div>
          <div className="lp-stat-label">{s.label}</div>
        </div>
      ))}
    </section>
  );
}
