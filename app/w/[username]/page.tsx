import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const SERVICE_LABEL: Record<string, string> = {
  walk: 'Passeio', bath: 'Banho e Tosa', boarding: 'Hospedagem',
  daycare: 'Creche', vet_visit: 'Visita ao Vet', training: 'Adestramento',
};
const SERVICE_ICON: Record<string, string> = {
  walk: '🦮', bath: '🛁', boarding: '🌙', daycare: '🏠', vet_visit: '🏥', training: '🎯',
};

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const { data: walker } = await supabaseAdmin
    .from('walker_profiles')
    .select('name, city, bio, avatar_url')
    .eq('username', username)
    .eq('plan', 'pro')
    .eq('active', true)
    .single();

  if (!walker) return { title: 'Walker não encontrado' };

  return {
    title: `${walker.name} — Walker Pro · Zupet`,
    description: walker.bio ?? `${walker.name} é um passeador profissional em ${walker.city}.`,
    openGraph: {
      title: `${walker.name} — Walker Pro`,
      description: walker.bio ?? `Passeador profissional em ${walker.city}.`,
      images: walker.avatar_url ? [{ url: walker.avatar_url }] : [],
    },
  };
}

export default async function WalkerProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  const { data: walker } = await supabaseAdmin
    .from('walker_profiles')
    .select(`
      id, name, city, state, bio, avatar_url, rating, plan, active,
      available_days, available_start, available_end,
      service_radius_km, max_pets_per_walk, accepted_sizes,
      social_links, show_prices, username
    `)
    .eq('username', username)
    .eq('plan', 'pro')
    .eq('active', true)
    .single();

  if (!walker) notFound();

  const [{ data: services }, { data: ratings }] = await Promise.all([
    supabaseAdmin
      .from('walker_services')
      .select('id, type, label, price, price_daily, price_weekly, price_monthly, duration_minutes, max_pets, description')
      .eq('walker_id', walker.id)
      .eq('active', true)
      .order('sort_order', { ascending: true }),
    supabaseAdmin
      .from('walker_ratings')
      .select('rating, comment, created_at, user_id')
      .eq('walker_id', walker.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const social = (walker.social_links ?? {}) as Record<string, string>;
  const availDays = (walker.available_days ?? []) as number[];
  const showPrices = walker.show_prices !== false;

  const whatsappNum = social.whatsapp?.replace(/\D/g, '');
  const whatsappUrl = whatsappNum
    ? `https://wa.me/55${whatsappNum}?text=Olá ${encodeURIComponent(walker.name)}, vi seu perfil no Zupet Walker e gostaria de solicitar um serviço!`
    : null;

  const C = {
    bg: '#0A1A12', card: '#132219', border: 'rgba(0,200,167,0.15)',
    accent: '#00C6A7', accentDim: 'rgba(0,198,167,0.12)',
    text: '#E8F5F0', textSec: '#7FA898', textMuted: '#4A6B60',
    success: '#22D3A5',
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'system-ui, sans-serif' }}>

      {/* NAV mínima */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: `1px solid ${C.border}`, background: '#0D1F18' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-simbolo.png" alt="" width={24} height={24} style={{ objectFit: 'contain' }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Zupet Walker</span>
        </a>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.accent, background: C.accentDim, border: `1px solid rgba(0,198,167,0.3)`, borderRadius: 20, padding: '3px 10px' }}>
          ⭐ Walker Pro
        </span>
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* HERO */}
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', marginBottom: 40, flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{ flexShrink: 0 }}>
            {walker.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={walker.avatar_url} alt={walker.name}
                style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${C.accent}` }} />
            ) : (
              <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(145deg,#166534,#0a0f0d)', border: `3px solid ${C.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 800, color: '#86efac' }}>
                {walker.name.split(' ').slice(0, 2).map((p: string) => p[0]).join('').toUpperCase()}
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>{walker.name}</h1>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.accent, background: C.accentDim, border: `1px solid rgba(0,198,167,0.3)`, borderRadius: 20, padding: '2px 10px' }}>Pro</span>
            </div>

            <p style={{ fontSize: 14, color: C.textSec, marginBottom: 10 }}>
              📍 {walker.city}{walker.state ? `, ${walker.state}` : ''}
              {walker.service_radius_km ? ` · raio ${walker.service_radius_km} km` : ''}
            </p>

            {/* Rating */}
            {walker.rating && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                {[1,2,3,4,5].map(i => (
                  <span key={i} style={{ fontSize: 16, color: i <= Math.round(walker.rating) ? '#F59E0B' : C.border }}>★</span>
                ))}
                <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{walker.rating.toFixed(1)}</span>
              </div>
            )}

            {/* Redes sociais */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {social.instagram && (
                <a href={`https://instagram.com/${social.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 12, color: C.accent, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                  📸 @{social.instagram.replace('@','')}
                </a>
              )}
              {social.tiktok && (
                <a href={`https://tiktok.com/@${social.tiktok.replace('@','')}`} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 12, color: C.accent, textDecoration: 'none' }}>
                  🎵 TikTok
                </a>
              )}
            </div>
          </div>
        </div>

        {/* BIO */}
        {walker.bio && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 20px', marginBottom: 20 }}>
            <p style={{ fontSize: 15, color: C.text, lineHeight: 1.65, margin: 0 }}>{walker.bio}</p>
          </div>
        )}

        {/* SERVIÇOS */}
        {(services ?? []).length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.textSec, marginBottom: 12 }}>Serviços</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {(services ?? []).map((svc: any) => (
                <div key={svc.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '16px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 22 }}>{SERVICE_ICON[svc.type] ?? '🐾'}</span>
                    <span style={{ fontWeight: 700, fontSize: 15, color: C.text }}>{svc.label || SERVICE_LABEL[svc.type] || svc.type}</span>
                  </div>
                  {svc.description && (
                    <p style={{ fontSize: 13, color: C.textSec, marginBottom: 10, lineHeight: 1.5 }}>{svc.description}</p>
                  )}
                  {showPrices && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {svc.price > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: C.accent, background: C.accentDim, padding: '2px 10px', borderRadius: 20 }}>R$ {svc.price.toFixed(2).replace('.',',')} /sessão</span>}
                      {svc.price_daily > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: C.accent, background: C.accentDim, padding: '2px 10px', borderRadius: 20 }}>R$ {svc.price_daily.toFixed(2).replace('.',',')} /dia</span>}
                      {svc.price_weekly > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: C.accent, background: C.accentDim, padding: '2px 10px', borderRadius: 20 }}>R$ {svc.price_weekly.toFixed(2).replace('.',',')} /semana</span>}
                      {svc.price_monthly > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: C.accent, background: C.accentDim, padding: '2px 10px', borderRadius: 20 }}>R$ {svc.price_monthly.toFixed(2).replace('.',',')} /mês</span>}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 12, marginTop: 10, fontSize: 12, color: C.textMuted }}>
                    {svc.duration_minutes && <span>⏱ {svc.duration_minutes >= 60 ? `${Math.floor(svc.duration_minutes/60)}h${svc.duration_minutes%60?svc.duration_minutes%60+'min':''}` : `${svc.duration_minutes}min`}</span>}
                    {svc.max_pets && <span>🐾 máx. {svc.max_pets} pet{svc.max_pets !== 1 ? 's' : ''}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DISPONIBILIDADE */}
        {availDays.length > 0 && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 20px', marginBottom: 20 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.textSec, marginBottom: 14 }}>Disponibilidade</h2>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
              {DAYS.map((day, i) => (
                <span key={i} style={{
                  fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20,
                  background: availDays.includes(i) ? C.accentDim : 'transparent',
                  border: `1px solid ${availDays.includes(i) ? 'rgba(0,198,167,0.35)' : C.border}`,
                  color: availDays.includes(i) ? C.accent : C.textMuted,
                }}>
                  {day}
                </span>
              ))}
            </div>
            {(walker.available_start || walker.available_end) && (
              <p style={{ fontSize: 13, color: C.textSec }}>
                ⏰ {walker.available_start ?? '—'} às {walker.available_end ?? '—'}
              </p>
            )}
          </div>
        )}

        {/* AVALIAÇÕES */}
        {(ratings ?? []).length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.textSec, marginBottom: 12 }}>Avaliações</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(ratings ?? []).map((r: any) => (
                <div key={r.user_id + r.created_at} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    {[1,2,3,4,5].map(i => (
                      <span key={i} style={{ fontSize: 13, color: i <= r.rating ? '#F59E0B' : C.border }}>★</span>
                    ))}
                    <span style={{ fontSize: 11, color: C.textMuted }}>
                      {new Date(r.created_at).toLocaleDateString('pt-BR', { day:'2-digit', month:'short', year:'2-digit' })}
                    </span>
                  </div>
                  {r.comment && <p style={{ fontSize: 13, color: C.textSec, lineHeight: 1.55, margin: 0 }}>{r.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA CONTATO */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '24px 20px', textAlign: 'center' }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 6 }}>Interessado nos serviços de {walker.name.split(' ')[0]}?</p>
          <p style={{ fontSize: 13, color: C.textSec, marginBottom: 18 }}>Entre em contato e agende seu serviço.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {whatsappUrl && (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#25D366', color: '#fff', fontWeight: 700, fontSize: 14, padding: '12px 24px', borderRadius: 40, textDecoration: 'none' }}>
                💬 WhatsApp
              </a>
            )}
            {social.instagram && (
              <a href={`https://instagram.com/${social.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.accentDim, color: C.accent, fontWeight: 700, fontSize: 14, padding: '12px 24px', borderRadius: 40, textDecoration: 'none', border: `1px solid rgba(0,198,167,0.3)` }}>
                📸 Instagram
              </a>
            )}
            {!whatsappUrl && !social.instagram && (
              <p style={{ fontSize: 13, color: C.textMuted }}>Encontre {walker.name.split(' ')[0]} no app Zupet.</p>
            )}
          </div>
        </div>

        {/* Rodapé mínimo */}
        <p style={{ textAlign: 'center', marginTop: 40, fontSize: 12, color: C.textMuted }}>
          Perfil verificado · <a href="/" style={{ color: C.textMuted }}>Zupet Walker</a>
        </p>
      </div>
    </div>
  );
}
