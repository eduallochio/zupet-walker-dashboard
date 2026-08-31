import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function IconInstagram() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}
function IconTikTok() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.79 1.52V6.76a4.85 4.85 0 0 1-1.02-.07z"/>
    </svg>
  );
}
function IconWhatsApp() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
    </svg>
  );
}

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
    .$call((q) => process.env.NODE_ENV === 'production' ? q.eq('is_test_profile', false) : q)
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
    .$call((q) => process.env.NODE_ENV === 'production' ? q.eq('is_test_profile', false) : q)
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
      .select('rating, comment, created_at, owner_id, service_type')
      .eq('walker_id', walker.id)
      .order('created_at', { ascending: false })
      .limit(8),
  ]);

  // Buscar nomes dos tutores
  const ownerIds = [...new Set((ratings ?? []).map((r: any) => r.owner_id).filter(Boolean))];
  let ownerNames: Record<string, string> = {};
  if (ownerIds.length > 0) {
    const { data: ownerProfiles } = await supabaseAdmin
      .from('user_profiles')
      .select('user_id, name')
      .in('user_id', ownerIds);
    (ownerProfiles ?? []).forEach((p: any) => { ownerNames[p.user_id] = p.name; });
  }

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
                style={{ fontSize: 13, color: '#E8F5F0', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, background: 'linear-gradient(45deg,#833ab4,#fd1d1d,#fcb045)', borderRadius: 20, padding: '6px 16px', fontWeight: 600 }}>
                <IconInstagram /> @{social.instagram.replace('@','')}
              </a>
            )}
            {social.tiktok && (
              <a href={`https://tiktok.com/@${social.tiktok.replace('@','')}`} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 13, color: '#E8F5F0', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, background: '#010101', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '6px 16px', fontWeight: 600 }}>
                <IconTikTok /> TikTok
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
              {(ratings ?? []).map((r: any) => {
                const ownerName = ownerNames[r.owner_id] ?? null;
                const initial = ownerName ? ownerName.trim()[0].toUpperCase() : '?';
                return (
                  <div key={r.owner_id + r.created_at} style={{ background: '#0D1F18', border: '1px solid rgba(0,198,167,0.14)', borderRadius: 14, padding: '14px 16px', display: 'flex', gap: 12 }}>
                    {/* Inicial do tutor */}
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(0,198,167,0.12)', border: '1px solid rgba(0,198,167,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: '#00C6A7', flexShrink: 0 }}>
                      {initial}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        {ownerName && <span style={{ fontSize: 13, fontWeight: 700, color: '#E8F5F0' }}>{ownerName.split(' ')[0]}</span>}
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
                      {!r.comment && <p style={{ fontSize: 12, color: '#4A6B60', fontStyle: 'italic', margin: 0 }}>Avaliação sem comentário</p>}
                    </div>
                  </div>
                );
              })}
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
                <IconWhatsApp /> WhatsApp
              </a>
            )}
            {social.instagram && (
              <a href={`https://instagram.com/${social.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(45deg,#833ab4,#fd1d1d,#fcb045)', color: '#fff', fontWeight: 700, fontSize: 15, padding: '14px 28px', borderRadius: 40, textDecoration: 'none' }}>
                <IconInstagram /> Instagram
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
            <IconWhatsApp /> Falar no WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}
