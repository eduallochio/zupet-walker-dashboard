import { createClient } from '@supabase/supabase-js';

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

  // Group and count by city+state
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
        Baixe o app e encontre um walker perto de você.
      </p>
      <div className="lp-cities-grid">
        {cities.map(({ city, state, count }) => (
          <div key={`${city}-${state}`} className="lp-city-chip">
            <span className="lp-city-dot" />
            <span className="lp-city-name">{city}</span>
            <span className="lp-city-state">{state}</span>
            <span className="lp-city-count">{count} walker{count > 1 ? 's' : ''}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
