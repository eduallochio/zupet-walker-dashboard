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
    .select('id, name, city, state, bio, avatar_url, rating, social_links, show_prices')
    .eq('active', true)
    .order('rating', { ascending: false, nullsFirst: false })
    .limit(6);

  if (!walkers || walkers.length === 0) return null;

  // Busca todos os serviços ativos de cada walker para o modal
  const walkerIds = walkers.map((w) => w.id);
  const { data: services } = await supabaseAdmin
    .from('walker_services')
    .select('walker_id, type, label, price, price_daily')
    .in('walker_id', walkerIds)
    .eq('active', true)
    .order('price', { ascending: true });

  // Agrupa serviços por walker_id
  const servicesMap: Record<string, { type: string; label: string; price: number | null; price_daily: number | null }[]> = {};
  (services ?? []).forEach((s: any) => {
    if (!servicesMap[s.walker_id]) servicesMap[s.walker_id] = [];
    servicesMap[s.walker_id].push({ type: s.type, label: s.label, price: s.price, price_daily: s.price_daily });
  });

  const items: ChromaItem[] = walkers.map((w, i) => {
    const location = [w.city, w.state].filter(Boolean).join(', ');
    const ratingLabel = w.rating ? `⭐ ${Number(w.rating).toFixed(1)}` : null;
    const subtitle = ratingLabel ?? '';
    const instagram = (w.social_links as any)?.instagram ?? null;

    return {
      image: w.avatar_url || buildInitialsImage(w.name),
      title: w.name,
      subtitle,
      location: location || undefined,
      handle: instagram ? `@${instagram.replace(/^@/, '')}` : undefined,
      borderColor: BORDER_COLORS[i % BORDER_COLORS.length],
      gradient: GRADIENTS[i % GRADIENTS.length],
      meta: {
        bio: w.bio,
        rating: w.rating,
        services: servicesMap[w.id] ?? [],
        showPrices: (w as any).show_prices !== false,
        instagram,
        tiktok: (w.social_links as any)?.tiktok ?? null,
        whatsapp: (w.social_links as any)?.whatsapp ?? null,
        city: w.city,
        state: w.state,
      },
    };
  });

  return (
    <section className="wk-section" suppressHydrationWarning>
      <p className="lp-section-label" suppressHydrationWarning>Comunidade</p>
      <h2 className="lp-section-title" suppressHydrationWarning>Walkers na plataforma</h2>
      <div className="wk-chroma-wrap" suppressHydrationWarning>
        <WalkersGridClient items={items} />
      </div>
    </section>
  );
}
