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

function formatTime(t: string | null) {
  if (!t) return null;
  // Remove segundos: "08:00:00" → "08:00"
  return t.slice(0, 5);
}

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

  const initials = walker.name.split(' ').slice(0, 2).map((p: string) => p[0]).join('').toUpperCase();
  const timeStart = formatTime(walker.available_start);
  const timeEnd   = formatTime(walker.available_end);

  return (
    <div style={{ minHeight: '100vh', background: '#080F0B', color: '#E8F5F0', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: '1px solid rgba(0,198,167,0.12)', background: 'rgba(8,15,11,0.95)', backdropFilter: 'blur(8px)', position: 'sticky', top: 0, zIndex: 10 }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-simbolo.png" alt="" width={22} height={22} style={{ objectFit: 'contain' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(232,245,240,0.7)' }}>Zupet Walker</span>
        </a>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#00C6A7', background: 'rgba(0,198,167,0.12)', border: '1px solid rgba(0,198,167,0.25)', borderRadius: 20, padding: '3px 12px' }}>
          ⭐ Walker Pro
        </span>
      </nav>

      {/* HERO com gradiente de fundo */}
      <div style={{ background: 'linear-gradient(180deg, #0D2318 0%, #080F0B 100%)', padding: '48px 24px 40px', textAlign: 'center', borderBottom: '1px solid rgba(0,198,167,0.08)' }}>
        {/* Avatar grande */}
        <div style={{ display: 'inline-block', position: 'relative', marginBottom: 20 }}>
          {walker.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={walker.avatar_url} alt={walker.name}
              style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: '3px solid #00C6A7', display: 'block' }} />
          ) : (
            <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'linear-gradient(145deg,#166534,#0a0f0d)', border: '3px solid #00C6A7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 42, fontWeight: 800, color: '#86efac' }}>
              {initials}
            </div>
          )}
          {/* Badge Pro no avatar */}
          <div style={{ position: 'absolute', bottom: 4, right: 4, background: '#00C6A7', borderRadius: 20, padding: '2px 8px', fontSize: 10, fontWeight: 800, color: '#080F0B', border: '2px solid #080F0B' }}>PRO</div>
        </div>

        {/* Nome */}
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 8px', lineHeight: 1.1 }}>{walker.name}</h1>

        {/* Cidade + raio */}
        <p style={{ fontSize: 14, color: '#7FA898', marginBottom: 12 }}>
          📍 {walker.city}{walker.state ? `, ${walker.state}` : ''}
          {walker.service_radius_km ? ` · raio ${walker.service_radius_km} km` : ''}
        </p>

        {/* Rating */}
        {walker.rating && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 16 }}>
            {[1,2,3,4,5].map(i => (
              <span key={i} style={{ fontSize: 18, color: i <= Math.round(walker.rating) ? '#F59E0B' : 'rgba(0,198,167,0.2)' }}>★</span>
            ))}
            <span style={{ fontSize: 16, fontWeight: 800, color: '#E8F5F0', marginLeft: 4 }}>{walker.rating.toFixed(1)}</span>
          </div>
        )}

        {/* Redes sociais */}
        {(social.instagram || social.tiktok) && (
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {social.instagram && (
              <a href={`https://instagram.com/${social.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 13, color: '#00C6A7', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(0,198,167,0.1)', border: '1px solid rgba(0,198,167,0.2)', borderRadius: 20, padding: '5px 14px' }}>
                📸 @{social.instagram.replace('@','')}
              </a>
            )}
            {social.tiktok && (
              <a href={`https://tiktok.com/@${social.tiktok.replace('@','')}`} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 13, color: '#00C6A7', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(0,198,167,0.1)', border: '1px solid rgba(0,198,167,0.2)', borderRadius: 20, padding: '5px 14px' }}>
                🎵 TikTok
              </a>
            )}
          </div>
        )}
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 20px 120px' }}>

        {/* BIO */}
        {walker.bio && (
          <div style={{ background: 'rgba(0,198,167,0.05)', border: '1px solid rgba(0,198,167,0.12)', borderRadius: 16, padding: '20px 22px', marginBottom: 28 }}>
            <p style={{ fontSize: 15, color: '#C8E8DF', lineHeight: 1.7, margin: 0 }}>{walker.bio}</p>
          </div>
        )}

        {/* SERVIÇOS */}
        {(services ?? []).length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4A6B60', marginBottom: 14 }}>Serviços</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
              {(services ?? []).map((svc: any) => (
                <div key={svc.id} style={{ background: '#0D1F18', border: '1px solid rgba(0,198,167,0.14)', borderRadius: 16, padding: '18px 18px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 28, lineHeight: 1 }}>{SERVICE_ICON[svc.type] ?? '🐾'}</span>
                    <span style={{ fontWeight: 800, fontSize: 16, color: '#E8F5F0' }}>{svc.label || SERVICE_LABEL[svc.type] || svc.type}</span>
                  </div>
                  {svc.description && (
                    <p style={{ fontSize: 13, color: '#7FA898', lineHeight: 1.55, margin: 0 }}>{svc.description}</p>
                  )}
                  {showPrices && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {svc.price > 0 && <span style={{ fontSize: 13, fontWeight: 700, color: '#00C6A7', background: 'rgba(0,198,167,0.12)', padding: '3px 12px', borderRadius: 20 }}>R$ {svc.price.toFixed(2).replace('.',',')} <span style={{ fontWeight: 400, fontSize: 11 }}>/sessão</span></span>}
                      {svc.price_daily > 0 && <span style={{ fontSize: 13, fontWeight: 700, color: '#00C6A7', background: 'rgba(0,198,167,0.12)', padding: '3px 12px', borderRadius: 20 }}>R$ {svc.price_daily.toFixed(2).replace('.',',')} <span style={{ fontWeight: 400, fontSize: 11 }}>/dia</span></span>}
                      {svc.price_weekly > 0 && <span style={{ fontSize: 13, fontWeight: 700, color: '#00C6A7', background: 'rgba(0,198,167,0.12)', padding: '3px 12px', borderRadius: 20 }}>R$ {svc.price_weekly.toFixed(2).replace('.',',')} <span style={{ fontWeight: 400, fontSize: 11 }}>/semana</span></span>}
                      {svc.price_monthly > 0 && <span style={{ fontSize: 13, fontWeight: 700, color: '#00C6A7', background: 'rgba(0,198,167,0.12)', padding: '3px 12px', borderRadius: 20 }}>R$ {svc.price_monthly.toFixed(2).replace('.',',')} <span style={{ fontWeight: 400, fontSize: 11 }}>/mês</span></span>}
                    </div>
                  )}
                  {(svc.duration_minutes || svc.max_pets) && (
                    <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#4A6B60', borderTop: '1px solid rgba(0,198,167,0.08)', paddingTop: 8, marginTop: 2 }}>
                      {svc.duration_minutes && <span>⏱ {svc.duration_minutes >= 60 ? `${Math.floor(svc.duration_minutes/60)}h${svc.duration_minutes%60 ? svc.duration_minutes%60+'min' : ''}` : `${svc.duration_minutes}min`}</span>}
                      {svc.max_pets && <span>🐾 máx. {svc.max_pets} pet{svc.max_pets !== 1 ? 's' : ''}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DISPONIBILIDADE */}
        {availDays.length > 0 && (
          <div style={{ background: '#0D1F18', border: '1px solid rgba(0,198,167,0.14)', borderRadius: 16, padding: '18px 20px', marginBottom: 28 }}>
            <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4A6B60', marginBottom: 14 }}>Disponibilidade</h2>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 12 }}>
              {DAYS.map((day, i) => (
                <span key={i} style={{
                  fontSize: 13, fontWeight: 700, padding: '6px 14px', borderRadius: 20,
                  background: availDays.includes(i) ? 'rgba(0,198,167,0.15)' : 'transparent',
                  border: `1.5px solid ${availDays.includes(i) ? 'rgba(0,198,167,0.4)' : 'rgba(0,198,167,0.1)'}`,
                  color: availDays.includes(i) ? '#00C6A7' : '#2A4A40',
                }}>
                  {day}
                </span>
              ))}
            </div>
            {(timeStart || timeEnd) && (
              <p style={{ fontSize: 13, color: '#7FA898', margin: 0 }}>
                ⏰ {timeStart ?? '—'} às {timeEnd ?? '—'}
              </p>
            )}
          </div>
        )}

        {/* AVALIAÇÕES */}
        {(ratings ?? []).length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4A6B60', marginBottom: 14 }}>Avaliações</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(ratings ?? []).map((r: any) => (
                <div key={r.user_id + r.created_at} style={{ background: '#0D1F18', border: '1px solid rgba(0,198,167,0.14)', borderRadius: 14, padding: '14px 16px', display: 'flex', gap: 12 }}>
                  {/* Inicial do tutor */}
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,198,167,0.12)', border: '1px solid rgba(0,198,167,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#00C6A7', flexShrink: 0 }}>
                    🐾
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {[1,2,3,4,5].map(i => (
                          <span key={i} style={{ fontSize: 14, color: i <= r.rating ? '#F59E0B' : 'rgba(0,198,167,0.15)' }}>★</span>
                        ))}
                      </div>
                      <span style={{ fontSize: 11, color: '#4A6B60' }}>
                        {new Date(r.created_at).toLocaleDateString('pt-BR', { day:'2-digit', month:'short', year:'2-digit' })}
                      </span>
                    </div>
                    {r.comment && <p style={{ fontSize: 13, color: '#C8E8DF', lineHeight: 1.55, margin: 0 }}>{r.comment}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA inline */}
        <div style={{ background: 'linear-gradient(135deg, #0D2318 0%, #0D1F18 100%)', border: '1px solid rgba(0,198,167,0.2)', borderRadius: 20, padding: '28px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 18, fontWeight: 800, color: '#E8F5F0', marginBottom: 6 }}>
            Agende com {walker.name.split(' ')[0]}
          </p>
          <p style={{ fontSize: 13, color: '#7FA898', marginBottom: 22 }}>Entre em contato e reserve seu horário</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {whatsappUrl && (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#25D366', color: '#fff', fontWeight: 800, fontSize: 15, padding: '14px 28px', borderRadius: 40, textDecoration: 'none', boxShadow: '0 4px 20px rgba(37,211,102,0.3)' }}>
                💬 WhatsApp
              </a>
            )}
            {social.instagram && (
              <a href={`https://instagram.com/${social.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,198,167,0.12)', color: '#00C6A7', fontWeight: 700, fontSize: 15, padding: '14px 28px', borderRadius: 40, textDecoration: 'none', border: '1.5px solid rgba(0,198,167,0.3)' }}>
                📸 Instagram
              </a>
            )}
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 32, fontSize: 11, color: '#2A4A40' }}>
          Perfil verificado · <a href="/" style={{ color: '#2A4A40', textDecoration: 'none' }}>Zupet Walker</a>
        </p>
      </div>

      {/* CTA FIXO NO MOBILE */}
      {whatsappUrl && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 20px 20px', background: 'linear-gradient(0deg, #080F0B 60%, transparent)', display: 'flex', justifyContent: 'center', zIndex: 20 }}>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#25D366', color: '#fff', fontWeight: 800, fontSize: 16, padding: '15px 36px', borderRadius: 40, textDecoration: 'none', boxShadow: '0 4px 24px rgba(37,211,102,0.4)', width: '100%', maxWidth: 360, justifyContent: 'center' }}>
            💬 Falar no WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}
