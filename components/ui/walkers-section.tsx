import { createClient } from '@supabase/supabase-js';
import { ChromaItem } from './chroma-grid';
import { WalkersGridClient } from './walkers-grid-client';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Rotating green-themed gradients that match the Zupet Walker palette
const GRADIENTS = [
  'linear-gradient(145deg, #166534, #0a0f0d)',
  'linear-gradient(210deg, #14532d, #052e16)',
  'linear-gradient(165deg, #15803d, #0a0f0d)',
  'linear-gradient(195deg, #16a34a, #052e16)',
  'linear-gradient(225deg, #166534, #14271e)',
  'linear-gradient(135deg, #059669, #0a0f0d)',
];

const BORDER_COLORS = [
  '#22c55e', '#16a34a', '#86efac', '#4ade80', '#15803d', '#34d399',
];

function buildInitialsImage(name: string): string {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
  // Transparent background so the card gradient shows through
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui,sans-serif" font-size="108" font-weight="800" fill="#86efac">${initials}</text></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

export async function WalkersSection() {
  const { data: walkers } = await supabaseAdmin
    .from('walker_profiles')
    .select('id, name, city, state, bio, avatar_url, price_per_hour, rating, experience_years, services')
    .eq('active', true)
    .order('rating', { ascending: false, nullsFirst: false })
    .limit(6);

  if (!walkers || walkers.length === 0) return null;

  const items: ChromaItem[] = walkers.map((w, i) => {
    const location = [w.city, w.state].filter(Boolean).join(', ');
    const priceLabel = w.price_per_hour
      ? `R$ ${Number(w.price_per_hour).toFixed(0)}/h`
      : 'Consultar';
    const ratingLabel = w.rating ? `⭐ ${Number(w.rating).toFixed(1)}` : null;
    const subtitle = [priceLabel, ratingLabel].filter(Boolean).join('  ·  ');

    return {
      image: w.avatar_url || buildInitialsImage(w.name),
      title: w.name,
      subtitle,
      location: location || undefined,
      handle: w.experience_years ? `${w.experience_years} anos exp.` : undefined,
      borderColor: BORDER_COLORS[i % BORDER_COLORS.length],
      gradient: GRADIENTS[i % GRADIENTS.length],
      meta: {
        bio: w.bio,
        rating: w.rating,
        price_per_hour: w.price_per_hour,
        experience_years: w.experience_years,
        services: w.services,
        city: w.city,
        state: w.state,
      },
    };
  });

  return (
    <section className="wk-section">
      <p className="lp-section-label">Comunidade</p>
      <h2 className="lp-section-title">Walkers na plataforma</h2>
      <div className="wk-chroma-wrap">
        <WalkersGridClient items={items} />
      </div>
    </section>
  );
}
