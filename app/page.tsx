import Link from 'next/link';
import { Suspense } from 'react';
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

const HOW_STEPS = [
  { emoji: '📲', title: 'Baixe o app', desc: 'Disponível para Android e iOS, gratuito para começar.' },
  { emoji: '🐾', title: 'Monte seu perfil', desc: 'Defina serviços, preços, área de atendimento e agenda.' },
  { emoji: '🗺️', title: 'Realize passeios', desc: 'GPS registra distância e rota. Fotos e eventos salvos automaticamente.' },
  { emoji: '💰', title: 'Controle financeiro', desc: 'Acompanhe seus ganhos e histórico de recebimentos direto no app.' },
];

const HERO_PHOTO = '/hero.jpg';

const FEATURES = [
  {
    title: 'GPS durante o passeio',
    desc: 'O app registra a rota percorrida automaticamente. Distância, duração e eventos ficam salvos no relatório.',
    icon: <svg viewBox="0 0 24 24" width="20" height="20" stroke="#22c55e" fill="none" strokeWidth="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  },
  {
    title: 'Relatórios com fotos',
    desc: 'Ao final de cada passeio, envie um relatório automático com fotos e eventos ao tutor.',
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
    desc: 'Construa sua reputação com avaliações após cada passeio. Apareça em destaque no Pro.',
    icon: <svg viewBox="0 0 24 24" width="20" height="20" stroke="#22c55e" fill="none" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  },
];

const PRO_FEATURES = [
  'Pets ilimitados',
  'Relatórios com fotos',
  'Destaque no app para tutores',
  'Suporte prioritário',
  'Histórico financeiro completo',
  'Agenda avançada',
];


export default function LandingPage() {
  return (
    <main>
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
          <Link href="/cadastro"  className="lp-nav-text">Ser walker</Link>
          <Link href="/cadastro"  className="lp-nav-cta-cadastro">Ser walker</Link>
          <Link href="/login" className="lp-nav-cta">Entrar</Link>
        </div>
      </nav>

      {/* HERO */}
      <ParallaxHero photoUrl={HERO_PHOTO} photoPosition="center 55%" />

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

      {/* PLANS */}
      <div id="planos" className="lp-plans">
        <div>
          <p className="lp-section-label">Planos</p>
          <h2 className="lp-plans-title">Comece grátis.<br />Cresça no Pro.</h2>
          <p className="lp-plans-sub">
            Sem cartão de crédito. Assine o Pro pelo dashboard quando estiver pronto para escalar.
          </p>
          <div className="lp-pro-checklist">
            {PRO_FEATURES.map((f) => (
              <div key={f} className="lp-pro-check">
                <span className="lp-pro-check-icon">✓</span>
                {f}
              </div>
            ))}
          </div>
        </div>
        <div className="lp-plan-rows">
          <div className="lp-plan-row">
            <div>
              <div className="lp-plan-name">Gratuito</div>
              <div className="lp-plan-desc">Até 10 pets · 1 serviço</div>
            </div>
            <div className="lp-plan-price">R$ 0</div>
            <Link href="/login" className="lp-plan-cta free">Começar</Link>
          </div>
          <div className="lp-plan-row highlight">
            <div>
              <div className="lp-plan-name pro">⭐ Pro</div>
              <div className="lp-plan-desc">Pets ilimitados · Fotos · Destaque</div>
            </div>
            <div className="lp-plan-price">R$ 29/mês</div>
            <a href="https://walker.zupet.io" target="_blank" rel="noopener noreferrer" className="lp-plan-cta pro-btn">Assinar</a>
          </div>
        </div>
      </div>

      {/* TESTIMONIALS */}
      <TestimonialsSection />

      {/* DOWNLOAD */}
      <section className="lp-download">
        <div>
          <p className="lp-section-label">Baixe agora</p>
          <h2 className="lp-download-title">Seu negócio de passeios<br />começa <em>hoje.</em></h2>
          <p className="lp-download-sub">
            Gratuito para começar. Disponível para Android e iOS. Cadastre-se em minutos e já comece a receber tutores.
          </p>
        </div>
        <div className="lp-download-badges">
          <a href="https://zupet.io/download" target="_blank" rel="noopener noreferrer" className="lp-badge">
            <span className="lp-badge-icon">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.39-1.32 2.76-2.53 3.99zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
            </span>
            <span className="lp-badge-text">
              <span className="lp-badge-label">Disponível na</span>
              <span className="lp-badge-store">App Store</span>
            </span>
          </a>
          <a href="https://zupet.io/download" target="_blank" rel="noopener noreferrer" className="lp-badge">
            <span className="lp-badge-icon">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48A5.84 5.84 0 0 0 12 1.5c-.96 0-1.86.23-2.66.63L7.85.65c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31A5.983 5.983 0 0 0 6 7h12a5.98 5.98 0 0 0-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z"/></svg>
            </span>
            <span className="lp-badge-text">
              <span className="lp-badge-label">Disponível no</span>
              <span className="lp-badge-store">Google Play</span>
            </span>
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section className="lp-faq">
        <p className="lp-section-label">Dúvidas</p>
        <h2 className="lp-section-title">Perguntas frequentes</h2>
        <FaqTabs />
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
            O app para passeadores profissionais que querem crescer com organização, GPS e relatórios automáticos.
          </p>
          {/* app badges */}
          <div className="lp-footer-badges">
            <a href="https://zupet.io/download" target="_blank" rel="noopener noreferrer" className="lp-footer-badge">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.39-1.32 2.76-2.53 3.99zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
              App Store
            </a>
            <a href="https://zupet.io/download" target="_blank" rel="noopener noreferrer" className="lp-footer-badge">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48A5.84 5.84 0 0 0 12 1.5c-.96 0-1.86.23-2.66.63L7.85.65c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31A5.983 5.983 0 0 0 6 7h12a5.98 5.98 0 0 0-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z"/></svg>
              Google Play
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
            <a href="https://zupet.io" target="_blank" rel="noopener noreferrer">zupet.io</a>
            <a href="mailto:contato@zupet.io">contato@zupet.io</a>
            <Link href="/privacidade">Política de Privacidade</Link>
          </div>
        </div>

        {/* bottom bar */}
        <div className="lp-footer-bottom">
          <span>© {new Date().getFullYear()} Zupet. Todos os direitos reservados.</span>
          <span>Feito com 🐾 para passeadores profissionais</span>
        </div>
      </footer>
    </main>
  );
}
