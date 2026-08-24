import { createClient } from '@supabase/supabase-js';
import { CitiesMapClient } from './cities-map-client';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function CitiesSection() {
  const { data } = await supabaseAdmin
    .from('walker_profiles')
    .select('city, state')
    .eq('active', true)
    .not('city', 'is', null);

  if (!data || data.length === 0) return null;

  const map = new Map<string, { city: string; state: string; count: number }>();
  for (const row of data) {
    const key = `${row.city}|${row.state}`;
    const existing = map.get(key);
    if (existing) {
      existing.count++;
    } else {
      map.set(key, { city: row.city, state: row.state, count: 1 });
    }
  }
  const cities = Array.from(map.values()).sort((a, b) => b.count - a.count);

  return (
    <section className="lp-cities">
      <p className="lp-section-label">Cobertura</p>
      <h2 className="lp-section-title">Cidades atendidas</h2>
      <p className="lp-cities-sub">
        Walkers verificados já atendem em {cities.length} {cities.length === 1 ? 'cidade' : 'cidades'}.
        Clique em um estado para filtrar.
      </p>
      <CitiesMapClient cities={cities} total={cities.length} />
    </section>
  );
}
