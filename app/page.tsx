export const revalidate = 0;

import Link from 'next/link';
import { Suspense } from 'react';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { ParallaxHero } from '@/components/ui/parallax-hero';
import { WalkersSection } from '@/components/ui/walkers-section';
import { WalkersSkeleton } from '@/components/ui/walkers-skeleton';
import { CitiesSection } from '@/components/ui/cities-section';
import { StatsSection } from '@/components/ui/stats-section';
import { FaqTabs } from '@/components/ui/faq-tabs';
import { ScrollNav } from '@/components/ui/scroll-nav';
import { ScrollAnimations } from '@/components/ui/scroll-animations';
import { TestimonialsSection } from '@/components/ui/testimonials-section';
import { ActivityStatsSection } from '@/components/ui/activity-stats-section';
import { LeadForm } from '@/components/ui/lead-form';
import { PageTracker } from '@/components/ui/page-tracker';

const HOW_STEPS = [
  { emoji: '📲', title: 'Baixe o app', desc: 'Disponível para Android e iOS, gratuito para começar.' },
  { emoji: '🐾', title: 'Monte seu perfil', desc: 'Defina seus serviços, preços, área de atendimento e agenda de disponibilidade.' },
  { emoji: '🗺️', title: 'Realize seus atendimentos', desc: 'GPS registra a rota durante passeios. Relatórios automáticos para o tutor ao final de cada serviço.' },
  { emoji: '💰', title: 'Controle financeiro', desc: 'Acompanhe seus ganhos e histórico de recebimentos direto no app.' },
];

const SERVICES = [
  { emoji: '🦮', label: 'Passeio', desc: 'Caminhadas seguras e monitoradas para cães de todos os portes', color: '#00C6A7', bg: 'rgba(0,198,167,0.08)', border: 'rgba(0,198,167,0.22)' },
  { emoji: '🛁', label: 'Banho e Tosa', desc: 'Higiene e bem-estar com produtos de qualidade para o seu pet', color: '#3B82F6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.22)' },
  { emoji: '🌙', label: 'Hospedagem', desc: 'Seu pet acolhido em ambiente seguro enquanto você viaja', color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.22)' },
  { emoji: '🏠', label: 'Day Care', desc: 'Companhia e atividades durante o dia para pets que ficam sozinhos', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.22)' },
  { emoji: '🎯', label: 'Adestramento', desc: 'Treinamento comportamental com métodos positivos e eficazes', color: '#EF4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.22)' },
  { emoji: '🩺', label: 'Visita Veterinária', desc: 'Acompanhamento domiciliar com profissionais veterinários', color: '#10B981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.22)' },
];

const HERO_PHOTO = '/hero.jpg';

const FEATURES = [
  {
    title: 'GPS durante o atendimento',
    desc: 'O app registra a rota percorrida automaticamente. Distância, duração e eventos ficam salvos no relatório.',
    icon: <svg viewBox="0 0 24 24" width="20" height="20" stroke="#22c55e" fill="none" strokeWidth="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  },
  {
    title: 'Relatórios com fotos',
    desc: 'Ao final de cada atendimento, envie um relatório automático com fotos e eventos ao tutor.',
    icon: <svg viewBox="0 0 24 24" width="20" height="20" stroke="#22c55e" fill="none" strokeWidth="1.8"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>,
  },
  {
    title: 'Controle financeiro',
    desc: 'Registre seus ganhos, marque serviços como pagos e acompanhe o histórico completo de recebimentos.',
    icon: <svg viewBox="0 0 24 24" width="20" height="20" stroke="#22c55e" fill="none" strokeWidth="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  },
  {
    title: 'Gestão de clientes',
    desc: 'Veja todos os pets vinculados, configure sua agenda e aceite novos tutores com facilidade.',
    icon: <svg viewBox="0 0 24 24" width="20" height="20" stroke="#22c55e" fill="none" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  },
  {
    title: 'Agenda integrada',
    desc: 'Configure sua disponibilidade por dia e horário. Tutores veem quando você está livre.',
    icon: <svg viewBox="0 0 24 24" width="20" height="20" stroke="#22c55e" fill="none" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  },
  {
    title: 'Avaliações e reputação',
    desc: 'Construa sua reputação com avaliações após cada atendimento. Apareça em destaque no Pro.',
    icon: <svg viewBox="0 0 24 24" width="20" height="20" stroke="#22c55e" fill="none" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  },
];

const PLAN_COMPARISON = [
  { feature: 'Pets vinculados por tutores',   free: 'Até 7',      pro: 'Ilimitado' },
  { feature: 'Pets cadastrados pelo walker',  free: 'Até 7',      pro: 'Ilimitado' },
  { feature: 'Serviços criados',              free: '1 serviço',  pro: 'Ilimitado' },
  { feature: 'Pets por atendimento',           free: 'Até 2',      pro: 'Ilimitado' },
  { feature: 'Histórico de relatórios',       free: '7 dias',     pro: 'Completo'  },
  { feature: 'Dashboard web',                 free: true,         pro: true        },
  { feature: 'Código de convite para tutores',free: true,         pro: true        },
  { feature: 'Agendamentos de última hora',   free: false,        pro: true        },
  { feature: 'Destaque no app para tutores',  free: false,        pro: true        },
  { feature: 'Página pública compartilhável', free: false,        pro: true        },
  { feature: 'Suporte prioritário',           free: false,        pro: true        },
];


const DEFAULT_PLAN = { price_full: 79.9, price_promo: 49.9, promo_active: true, promo_label: 'Tempo limitado' };

export default async function LandingPage() {
  const { data: configRow } = await supabaseAdmin
    .from('app_config')
    .select('value')
    .eq('key', 'walker_pro_plan')
    .maybeSingle();
  const planConfig = (configRow?.value as typeof DEFAULT_PLAN) ?? DEFAULT_PLAN;
  const displayPrice = planConfig.promo_active ? planConfig.price_promo : planConfig.price_full;

  return (
    <main>
      <PageTracker />
      <ScrollNav />
      <ScrollAnimations />

      {/* NAV */}
      <nav className="lp-nav">
        <a href="#" className="lp-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-simbolo.png" alt="" width={28} height={28} style={{ objectFit: 'contain' }} />
          Zupet Walker
        </a>
        <div className="lp-nav-links">
          <a href="#recursos"     className="lp-nav-text">Recursos</a>
          <a href="#como-funciona" className="lp-nav-text">Como funciona</a>
          <a href="#planos"       className="lp-nav-text">Planos</a>
          <Link href="/cadastro"  className="lp-nav-text">Cadastrar</Link>
          <Link href="/cadastro"  className="lp-nav-cta-cadastro">Cadastrar</Link>
          <Link href="/login" className="lp-nav-cta">Entrar</Link>
        </div>
      </nav>

      {/* HERO */}
      <ParallaxHero photoUrl={HERO_PHOTO} photoPosition="center 55%" />

      {/* SERVICES GRID */}
      <section aria-labelledby="services-title" style={{ background: '#f8fffe', borderBottom: '1px solid #e0f5f1', padding: '3rem 1.5rem' }}>
        <p style={{ textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, color: '#00C6A7', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
          Para todos os profissionais de pets
        </p>
        <h2 id="services-title" style={{ textAlign: 'center', fontSize: '1.45rem', fontWeight: 800, color: '#0D2922', letterSpacing: '-0.02em', marginBottom: '2rem' }}>
          Gerencie qualquer tipo de atendimento
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', maxWidth: 780, margin: '0 auto' }}>
          {SERVICES.map((s) => (
            <article key={s.label} aria-label={s.label} style={{
              background: s.bg,
              border: `1.5px solid ${s.border}`,
              borderRadius: 16,
              padding: '1.25rem 1.1rem',
              display: 'flex', flexDirection: 'column', gap: '0.5rem',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${s.border}`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
            >
              <span style={{ fontSize: '2rem', lineHeight: 1 }} role="img" aria-hidden="true">{s.emoji}</span>
              <strong style={{ fontSize: '0.95rem', fontWeight: 800, color: s.color }}>{s.label}</strong>
              <p style={{ fontSize: '0.78rem', color: '#4A6B60', lineHeight: 1.5, margin: 0 }}>{s.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="recursos" className="lp-features">
        <p className="lp-section-label">Recursos</p>
        <h2 className="lp-section-title">Tudo que você precisa para crescer</h2>
        <div className="lp-feat-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="lp-feat-card">
              <div className="lp-feat-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="como-funciona" className="lp-how">
        <p className="lp-section-label">Como funciona</p>
        <h2 className="lp-section-title">Organize seu negócio em 4 passos</h2>
        <div className="lp-how-steps">
          {HOW_STEPS.map((s) => (
            <div key={s.title} className="lp-how-step">
              <div className="lp-how-num">{s.emoji}</div>
              <div className="lp-how-step-title">{s.title}</div>
              <p className="lp-how-step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <Suspense fallback={null}>
        <StatsSection />
      </Suspense>

      {/* ACTIVITY STATS */}
      <Suspense fallback={null}>
        <ActivityStatsSection />
      </Suspense>

      {/* WALKERS */}
      <Suspense fallback={<WalkersSkeleton />}>
        <WalkersSection />
      </Suspense>

      {/* CITIES */}
      <Suspense fallback={null}>
        <CitiesSection />
      </Suspense>

      {/* PRO PROFILE HIGHLIGHT */}
      <section className="lp-pro-profile-section">
        <div className="lp-pro-profile-inner">
          <div className="lp-pro-profile-text">
            <span className="lp-pro-profile-badge">⭐ Exclusivo Pro</span>
            <h2 className="lp-pro-profile-title">Sua página profissional na internet</h2>
            <p className="lp-pro-profile-desc">
              Profissionais Pro ganham uma página personalizada para divulgar todos os seus serviços nas redes sociais.
              Compartilhe seu link, mostre avaliações reais e conquiste mais clientes.
            </p>
            <ul className="lp-pro-profile-list">
              <li>🔗 Link único: <strong>walker.zupet.io/w/seu-nome</strong></li>
              <li>📸 Foto, bio, serviços e preços em um só lugar</li>
              <li>⭐ Avaliações dos tutores visíveis publicamente</li>
              <li>💬 Botão direto para WhatsApp e Instagram</li>
            </ul>
            <Link href="/cadastro" className="lp-pro-profile-cta">Assinar Pro e criar minha página</Link>
          </div>
          <div className="lp-pro-profile-mockup">
            <div className="lp-ppm-card">
              <div className="lp-ppm-header">
                <div className="lp-ppm-avatar">AW</div>
                <div>
                  <div className="lp-ppm-name">Ana Walker</div>
                  <div className="lp-ppm-city">📍 São Paulo, SP</div>
                  <div className="lp-ppm-stars">★★★★★ <span>5.0</span></div>
                </div>
                <div className="lp-ppm-pro-badge">Pro</div>
              </div>
              <div className="lp-ppm-services">
                <div className="lp-ppm-svc">🦮 Passeio · R$ 35,00</div>
                <div className="lp-ppm-svc">🛁 Banho e Tosa · R$ 60,00</div>
                <div className="lp-ppm-svc">🌙 Hospedagem · R$ 80,00/dia</div>
              </div>
              <div className="lp-ppm-url">walker.zupet.io/w/ana-walker</div>
            </div>
          </div>
        </div>
      </section>

      {/* PLANS */}
      <section id="planos" className="lp-plans-section">
        <p className="lp-section-label">Planos</p>
        <h2 className="lp-section-title">Comece grátis. Cresça no Pro.</h2>
        <p className="lp-plans-sub">Sem cartão de crédito. Assine o Pro quando estiver pronto para escalar.</p>

        <div className="lp-plans-table-wrap">
          <table className="lp-plans-table">
            <thead>
              <tr>
                <th className="lp-pt-feature-col"></th>
                <th className="lp-pt-plan-col lp-pt-free">
                  <div className="lp-pt-plan-label">Free</div>
                  <div className="lp-pt-plan-price">R$ 0</div>
                  <div className="lp-pt-plan-sub">para sempre</div>
                </th>
                <th className="lp-pt-plan-col lp-pt-pro">
                  <div className="lp-pt-plan-badge">Recomendado</div>
                  <div className="lp-pt-plan-label">Pro</div>
                  <div className="lp-pt-plan-price">
                    {planConfig.promo_active && (
                      <span style={{ fontSize: '0.6em', fontWeight: 500, opacity: 0.5, textDecoration: 'line-through', marginRight: 6 }}>
                        R$ {planConfig.price_full.toFixed(2).replace('.', ',')}
                      </span>
                    )}
                    R$ {displayPrice.toFixed(2).replace('.', ',')}<span>/mês</span>
                  </div>
                  <div className="lp-pt-plan-sub">
                    {planConfig.promo_active ? planConfig.promo_label : 'cancele quando quiser'}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {PLAN_COMPARISON.map((row) => (
                <tr key={row.feature} className="lp-pt-row">
                  <td className="lp-pt-feature">{row.feature}</td>
                  <td className="lp-pt-cell">
                    {typeof row.free === 'boolean'
                      ? row.free
                        ? <span className="lp-pt-check">✓</span>
                        : <span className="lp-pt-x">—</span>
                      : <span className="lp-pt-val">{row.free}</span>
                    }
                  </td>
                  <td className="lp-pt-cell lp-pt-cell-pro">
                    {typeof row.pro === 'boolean'
                      ? row.pro
                        ? <span className="lp-pt-check">✓</span>
                        : <span className="lp-pt-x">—</span>
                      : <span className="lp-pt-val lp-pt-val-pro">{row.pro}</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td></td>
                <td className="lp-pt-cta-cell">
                  <Link href="/cadastro" className="lp-pt-cta-free">Começar grátis</Link>
                </td>
                <td className="lp-pt-cta-cell lp-pt-cell-pro">
                  <Link href="/dashboard/pro" className="lp-pt-cta-pro">Assinar Pro</Link>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <TestimonialsSection />

      {/* DOWNLOAD */}
      <section className="lp-download">
        <div>
          <p className="lp-section-label">Em breve</p>
          <h2 className="lp-download-title">O app está nos<br />estágios finais. <em>Quase lá!</em></h2>
          <p className="lp-download-sub">
            O Zupet Walker está em desenvolvimento e será lançado em breve. Enquanto isso, conheça o <a href="https://zupet.io/download" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline', fontWeight: 600 }}>Zupet para tutores</a>.
          </p>
          <div className="lp-download-badges">
            <a href="https://zupet.io/download" target="_blank" rel="noopener noreferrer" className="lp-badge lp-badge-soon">
              <span className="lp-badge-icon">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.39-1.32 2.76-2.53 3.99zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
              </span>
              <span className="lp-badge-text">
                <span className="lp-badge-label">Em breve na</span>
                <span className="lp-badge-store">App Store</span>
              </span>
            </a>
            <a href="https://zupet.io/download" target="_blank" rel="noopener noreferrer" className="lp-badge lp-badge-soon">
              <span className="lp-badge-icon">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48A5.84 5.84 0 0 0 12 1.5c-.96 0-1.86.23-2.66.63L7.85.65c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31A5.983 5.983 0 0 0 6 7h12a5.98 5.98 0 0 0-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z"/></svg>
              </span>
              <span className="lp-badge-text">
                <span className="lp-badge-label">Em breve no</span>
                <span className="lp-badge-store">Google Play</span>
              </span>
            </a>
          </div>
        </div>
        <div className="lp-lead-box">
          <p className="lp-lead-title">Quer ser avisado no lançamento?</p>
          <p className="lp-lead-sub">Deixe seu contato e avisaremos assim que o app estiver disponível.</p>
          <LeadForm />
        </div>
      </section>

      {/* FAQ */}
      <section className="lp-faq">
        <p className="lp-section-label">Dúvidas</p>
        <h2 className="lp-section-title">Perguntas frequentes</h2>
        <FaqTabs />
      </section>

      {/* BANNER TUTOR */}
      <section style={{ background: "#f8f5f0", borderTop: "1px solid #e8e0d5" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "2.5rem 1.5rem", display: "flex", flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, overflow: "hidden", flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/zupet-icon.png" alt="Zupet" width={48} height={48} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "#1a1a1a", margin: 0 }}>
                Você tem um pet e quer encontrar profissionais?
              </p>
              <p style={{ fontSize: "0.78rem", color: "#6b6b6b", margin: "0.2rem 0 0" }}>
                O Zupet é o app para tutores — gerencie a saúde, vacinas e passeios do seu pet.
              </p>
            </div>
          </div>
          <a
            href="https://zupet.io"
            target="_blank"
            rel="noopener noreferrer"
            style={{ flexShrink: 0, padding: "0.6rem 1.25rem", borderRadius: 12, background: "#e87c3a", color: "#fff", fontWeight: 600, fontSize: "0.85rem", textDecoration: "none", transition: "opacity .2s" }}
          >
            Conheça o Zupet →
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        {/* brand col */}
        <div className="lp-footer-brand">
          <div className="lp-footer-brand-name">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-simbolo.png" alt="" width={22} height={22} style={{ objectFit: 'contain' }} />
            Zupet Walker
          </div>
          <p className="lp-footer-brand-desc">
            O app para profissionais de pets — passeadores, banhistas, hospedeiros e adestradores — que querem crescer com organização e relatórios automáticos.
          </p>
          {/* app badges */}
          <div className="lp-footer-badges">
            <a href="https://zupet.io/download" target="_blank" rel="noopener noreferrer" className="lp-footer-badge lp-footer-badge-soon" title="Em breve — enquanto isso, conheça o Zupet para tutores">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.39-1.32 2.76-2.53 3.99zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
              App Store <span style={{ fontSize: '.65rem', opacity: .7 }}>(em breve)</span>
            </a>
            <a href="https://zupet.io/download" target="_blank" rel="noopener noreferrer" className="lp-footer-badge lp-footer-badge-soon" title="Em breve — enquanto isso, conheça o Zupet para tutores">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48A5.84 5.84 0 0 0 12 1.5c-.96 0-1.86.23-2.66.63L7.85.65c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31A5.983 5.983 0 0 0 6 7h12a5.98 5.98 0 0 0-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z"/></svg>
              Google Play <span style={{ fontSize: '.65rem', opacity: .7 }}>(em breve)</span>
            </a>
          </div>
        </div>

        {/* nav col */}
        <div>
          <p className="lp-footer-col-title">Plataforma</p>
          <div className="lp-footer-col-links">
            <a href="#recursos">Recursos</a>
            <a href="#como-funciona">Como funciona</a>
            <a href="#planos">Planos</a>
            <Link href="/cadastro">Quero ser walker</Link>
            <Link href="/login">Entrar no dashboard</Link>
          </div>
        </div>

        {/* contact col */}
        <div>
          <p className="lp-footer-col-title">Legal & Contato</p>
          <div className="lp-footer-col-links">
            <a href="https://zupet.io" target="_blank" rel="noopener noreferrer">zupet.io — app para tutores</a>
            <a href="mailto:eduallochio2@outlook.com">eduallochio2@outlook.com</a>
            <Link href="/privacidade">Política de Privacidade</Link>
            <Link href="/excluir-conta">Excluir conta</Link>
          </div>
        </div>

        {/* bottom bar */}
        <div className="lp-footer-bottom">
          <span>© {new Date().getFullYear()} Zupet. Todos os direitos reservados.</span>
          <span>Feito com 🐾 para profissionais de pets · desenvolvido por <a href="https://www.instagram.com/eduallochio/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>Eduardo Allochio</a></span>
        </div>
      </footer>
    </main>
  );
}
