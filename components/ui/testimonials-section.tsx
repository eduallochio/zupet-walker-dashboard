import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Rating {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  walker_profiles: { name: string; avatar_url: string | null } | null;
}

function Stars({ n }: { n: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 16 16" width="14" height="14"
          fill={i < n ? '#22c55e' : 'rgba(148,184,164,.2)'}>
          <polygon points="8,1 10.2,5.5 15,6.3 11.5,9.7 12.4,14.5 8,12.1 3.6,14.5 4.5,9.7 1,6.3 5.8,5.5" />
        </svg>
      ))}
    </div>
  );
}

export async function TestimonialsSection() {
  const { data: ratings } = await supabaseAdmin
    .from('walker_ratings')
    .select('id, rating, comment, created_at, walker_profiles!inner(name, avatar_url, is_test_profile)')
    .eq('walker_profiles.is_test_profile', false)
    .not('comment', 'is', null)
    .order('rating', { ascending: false })
    .limit(6);

  if (!ratings || ratings.length === 0) return null;

  return (
    <section className="lp-testimonials">
      <p className="lp-section-label">Avaliações</p>
      <h2 className="lp-section-title">O que dizem sobre os walkers</h2>
      <div className="lp-testimonials-grid">
        {(ratings as unknown as Rating[]).map((r) => {
          const walker = r.walker_profiles;
          const initials = walker?.name
            ? walker.name.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase()
            : '?';
          return (
            <div key={r.id} className="lp-testimonial-card">
              <Stars n={r.rating} />
              <p className="lp-testimonial-text">"{r.comment}"</p>
              <div className="lp-testimonial-walker">
                {walker?.avatar_url ? (
                  <img src={walker.avatar_url} alt={walker.name} className="lp-testimonial-avatar" />
                ) : (
                  <div className="lp-testimonial-avatar-fallback">{initials}</div>
                )}
                <span className="lp-testimonial-name">{walker?.name ?? 'Walker'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
