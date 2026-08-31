import { createClient } from '@supabase/supabase-js';
import { AnimatedCounter } from './animated-counter';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function StatsSection() {
  const [{ count: walkersCount }, { count: citiesCount }, { count: ratingsCount }] =
    await Promise.all([
      supabaseAdmin
        .from('walker_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('active', true)
        .eq('is_test_profile', false)
        .then((r) => ({ count: r.count ?? 0 })),
      supabaseAdmin
        .from('walker_profiles')
        .select('city', { count: 'exact', head: false })
        .eq('active', true)
        .eq('is_test_profile', false)
        .not('city', 'is', null)
        .then((r) => {
          const unique = new Set((r.data ?? []).map((x: { city: string }) => x.city));
          return { count: unique.size };
        }),
      supabaseAdmin
        .from('walker_ratings')
        .select('walker_id, walker_profiles!inner(is_test_profile)', { count: 'exact', head: true })
        .eq('walker_profiles.is_test_profile', false)
        .then((r) => ({ count: r.count ?? 0 })),
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
