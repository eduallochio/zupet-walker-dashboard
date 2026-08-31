import type { Metadata } from 'next';
import { PrintButton } from './print-button';

export const metadata: Metadata = {
  title: 'Apresentação — Zupet Walker',
  description: 'Conheça o Zupet Walker: 6 tipos de serviço, agenda, GPS, relatórios automáticos e conexão direta com tutores.',
  robots: { index: false },
};

export default function ApresentacaoPage() {
  return (
    <>
      <style>{`
        :root {
          --bg:        #0D1A17;
          --surface:   #1A2E2A;
          --surface2:  #213830;
          --border:    #2E4A44;
          --accent:    #40E0D0;
          --accent-dim:#2CB5A8;
          --amber:     #F5A623;
          --text:      #E8F5F0;
          --text-2:    #6BBFB5;
          --text-3:    #3E6B65;
        }

        .ap-root *, .ap-root *::before, .ap-root *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ap-root {
          background: var(--bg);
          color: var(--text);
          font-family: var(--font-jakarta), system-ui, sans-serif;
          font-size: 16px;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          min-height: 100vh;
        }

        .ap-root .t-display {
          font-size: clamp(2.4rem, 5vw, 4rem);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -0.02em;
          text-wrap: balance;
        }
        .ap-root .t-heading {
          font-size: clamp(1.5rem, 3vw, 2.2rem);
          font-weight: 700;
          line-height: 1.15;
          text-wrap: balance;
        }
        .ap-root .t-label {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--accent);
        }

        .ap-root .container { max-width: 900px; margin: 0 auto; padding: 0 24px; }
        .ap-root section { padding: 80px 0; }
        .ap-root section + section { border-top: 1px solid var(--border); }
        .ap-root .section-header { margin-bottom: 40px; }
        .ap-root .section-intro { font-size: 1rem; color: var(--text-2); max-width: 540px; margin-top: 8px; line-height: 1.7; }

        /* Hero */
        .ap-root .hero { padding: 100px 0 80px; position: relative; overflow: hidden; }
        .ap-root .hero::before {
          content: '';
          position: absolute; top: -120px; right: -200px;
          width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, rgba(64,224,208,0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .ap-root .hero-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(64,224,208,0.08); border: 1px solid rgba(64,224,208,0.2);
          border-radius: 100px; padding: 6px 14px; margin-bottom: 32px;
        }
        .ap-root .hero-eyebrow span { font-size: 0.75rem; font-weight: 600; color: var(--accent); letter-spacing: 0.06em; }
        .ap-root .hero-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); animation: ap-pulse 2s ease-in-out infinite; }
        @keyframes ap-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
        .ap-root .hero-title { margin-bottom: 20px; }
        .ap-root .hero-title em { font-style: italic; color: var(--accent); }
        .ap-root .hero-subtitle { font-size: 1.1rem; color: var(--text-2); max-width: 520px; line-height: 1.7; margin-bottom: 48px; }
        .ap-root .hero-stats { display: flex; border: 1px solid var(--border); border-radius: 16px; overflow: hidden; max-width: 560px; }
        .ap-root .stat-item { flex: 1; padding: 20px 24px; background: var(--surface); }
        .ap-root .stat-item + .stat-item { border-left: 1px solid var(--border); }
        .ap-root .stat-value { font-size: 1.8rem; font-weight: 800; color: var(--accent); display: block; }
        .ap-root .stat-label { font-size: 0.78rem; color: var(--text-3); letter-spacing: 0.04em; }

        /* Steps */
        .ap-root .steps-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 2px; background: var(--border); border-radius: 20px; overflow: hidden;
        }
        .ap-root .step-card { background: var(--surface); padding: 28px; }
        .ap-root .step-num { font-size: 2.5rem; font-weight: 800; color: var(--border); line-height: 1; margin-bottom: 16px; }
        .ap-root .step-title { font-weight: 700; font-size: 1rem; margin-bottom: 8px; color: var(--text); }
        .ap-root .step-body { font-size: 0.875rem; color: var(--text-2); line-height: 1.6; }

        /* Services */
        .ap-root .services-list { display: flex; flex-direction: column; gap: 2px; background: var(--border); border-radius: 20px; overflow: hidden; }
        .ap-root .service-row { display: grid; grid-template-columns: 56px 1fr auto; align-items: center; background: var(--surface); transition: background 0.15s; }
        .ap-root .service-row:hover { background: var(--surface2); }
        .ap-root .srv-icon-col { display: flex; align-items: center; justify-content: center; padding: 24px 0 24px 20px; }
        .ap-root .srv-emoji { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; flex-shrink: 0; }
        .ap-root .srv-body { padding: 22px 20px; }
        .ap-root .srv-name { font-weight: 700; font-size: 1rem; color: var(--text); margin-bottom: 4px; }
        .ap-root .srv-desc { font-size: 0.83rem; color: var(--text-2); line-height: 1.5; }
        .ap-root .srv-meta { padding: 22px 20px 22px 0; min-width: 110px; display: flex; justify-content: flex-end; }
        .ap-root .srv-badge { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 3px 8px; border-radius: 100px; white-space: nowrap; }
        .ap-root .srv-badge.free { background: rgba(64,224,208,0.1); color: var(--accent); }
        .ap-root .srv-walk    { background: rgba(64,224,208,0.12); }
        .ap-root .srv-daycare { background: rgba(99,179,237,0.12); }
        .ap-root .srv-board   { background: rgba(154,117,232,0.12); }
        .ap-root .srv-train   { background: rgba(245,166,35,0.12); }
        .ap-root .srv-bath    { background: rgba(236,100,175,0.12); }
        .ap-root .srv-vet     { background: rgba(104,211,145,0.12); }

        /* Features */
        .ap-root .features-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
        .ap-root .feature-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 24px; transition: border-color 0.2s, transform 0.2s; }
        .ap-root .feature-card:hover { border-color: var(--accent-dim); transform: translateY(-2px); }
        .ap-root .feature-icon { width: 44px; height: 44px; border-radius: 12px; background: rgba(64,224,208,0.1); display: flex; align-items: center; justify-content: center; margin-bottom: 16px; font-size: 1.3rem; }
        .ap-root .feature-title { font-weight: 700; font-size: 0.95rem; margin-bottom: 6px; color: var(--text); }
        .ap-root .feature-body { font-size: 0.83rem; color: var(--text-2); line-height: 1.6; }

        /* Flow */
        .ap-root .flow-container { margin-top: 48px; display: grid; grid-template-columns: 1fr 60px 1fr; align-items: start; }
        .ap-root .flow-side { display: flex; flex-direction: column; gap: 12px; }
        .ap-root .flow-center { display: flex; flex-direction: column; align-items: center; padding-top: 24px; }
        .ap-root .flow-line { width: 2px; flex: 1; min-height: 380px; background: linear-gradient(to bottom, var(--accent), transparent); margin: 0 auto; }
        .ap-root .flow-arrow { width: 32px; height: 32px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; color: var(--bg); font-size: 0.9rem; font-weight: 700; flex-shrink: 0; }
        .ap-root .flow-app-label { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-3); margin-bottom: 12px; padding-left: 4px; }
        .ap-root .flow-step { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px; font-size: 0.875rem; color: var(--text); line-height: 1.5; }
        .ap-root .flow-step strong { color: var(--accent); font-weight: 600; }
        .ap-root .flow-step.highlight { border-color: var(--accent-dim); background: rgba(64,224,208,0.06); }

        /* Plans */
        .ap-root .plan-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .ap-root .plan-card { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 32px; }
        .ap-root .plan-card.pro { border-color: var(--amber); background: linear-gradient(135deg, var(--surface) 0%, rgba(245,166,35,0.05) 100%); position: relative; overflow: hidden; }
        .ap-root .plan-card.pro::after { content: 'RECOMENDADO'; position: absolute; top: 20px; right: -28px; background: var(--amber); color: #1A1000; font-size: 0.6rem; font-weight: 700; letter-spacing: 0.12em; padding: 4px 36px; transform: rotate(45deg); }
        .ap-root .plan-name { font-size: 1.6rem; font-weight: 800; margin-bottom: 4px; }
        .ap-root .plan-card.pro .plan-name { color: var(--amber); }
        .ap-root .plan-card:not(.pro) .plan-name { color: var(--text-2); }
        .ap-root .plan-tag { display: inline-block; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 3px 10px; border-radius: 100px; margin-bottom: 24px; }
        .ap-root .plan-card:not(.pro) .plan-tag { background: var(--surface2); color: var(--text-3); }
        .ap-root .plan-card.pro .plan-tag { background: rgba(245,166,35,0.15); color: var(--amber); }
        .ap-root .plan-list { list-style: none; display: flex; flex-direction: column; gap: 10px; }
        .ap-root .plan-list li { display: flex; align-items: flex-start; gap: 10px; font-size: 0.875rem; color: var(--text-2); line-height: 1.5; }
        .ap-root .plan-list li::before { content: '✓'; flex-shrink: 0; width: 18px; height: 18px; border-radius: 50%; background: rgba(64,224,208,0.12); color: var(--accent); font-size: 0.65rem; font-weight: 700; display: flex; align-items: center; justify-content: center; margin-top: 2px; }
        .ap-root .plan-card.pro .plan-list li::before { background: rgba(245,166,35,0.12); color: var(--amber); }
        .ap-root .plan-list li.limit { color: var(--text-3); }
        .ap-root .plan-list li.limit::before { background: rgba(62,107,101,0.2); color: var(--text-3); content: '–'; }

        /* VS table */
        .ap-root .vs-table-wrap { overflow-x: auto; }
        .ap-root table { width: 100%; border-collapse: collapse; }
        .ap-root th, .ap-root td { padding: 14px 16px; text-align: left; font-size: 0.875rem; border-bottom: 1px solid var(--border); }
        .ap-root th { background: var(--surface2); color: var(--text-2); font-weight: 600; font-size: 0.78rem; letter-spacing: 0.04em; }
        .ap-root th:first-child { border-radius: 8px 0 0 0; }
        .ap-root th:last-child { border-radius: 0 8px 0 0; }
        .ap-root td:first-child { color: var(--text); }
        .ap-root .check { color: var(--accent); }
        .ap-root .cross { color: var(--text-3); }
        .ap-root tr:hover td { background: rgba(64,224,208,0.03); }

        /* CTA */
        .ap-root .cta-section { text-align: center; padding: 80px 0 100px; }
        .ap-root .store-btns { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin-top: 32px; }
        .ap-root .store-btn { display: inline-flex; align-items: center; gap: 12px; background: var(--surface); border: 1px solid var(--border); color: var(--text); font-weight: 600; font-size: 0.9rem; padding: 14px 24px; border-radius: 14px; text-decoration: none; transition: border-color 0.2s, transform 0.2s; }
        .ap-root .store-btn:hover { border-color: var(--accent-dim); transform: translateY(-2px); }
        .ap-root .store-btn small { display: block; font-size: 0.7rem; color: var(--text-3); font-weight: 400; }

        /* Botão de imprimir */
        .ap-root .print-bar { position: fixed; bottom: 24px; right: 24px; z-index: 100; }
        .ap-root .print-btn { display: flex; align-items: center; gap: 8px; background: var(--accent); color: var(--bg); font-weight: 700; font-size: 0.85rem; padding: 12px 20px; border-radius: 100px; border: none; cursor: pointer; box-shadow: 0 4px 20px rgba(64,224,208,0.3); transition: opacity 0.2s; }
        .ap-root .print-btn:hover { opacity: 0.85; }

        /* Responsive */
        @media (max-width: 640px) {
          .ap-root .flow-container { grid-template-columns: 1fr; }
          .ap-root .flow-center { display: none; }
          .ap-root .plan-grid { grid-template-columns: 1fr; }
          .ap-root .hero-stats { flex-direction: column; }
          .ap-root .stat-item + .stat-item { border-left: none; border-top: 1px solid var(--border); }
          .ap-root .service-row { grid-template-columns: 48px 1fr; }
          .ap-root .srv-meta { display: none; }
        }

        /* ── IMPRESSÃO / PDF ── */
        @media print {
          .ap-root .print-bar { display: none !important; }
          .ap-root .hero::before { display: none; }
          .ap-root .hero-dot { animation: none; }

          :root {
            --bg:      #ffffff;
            --surface: #f5f5f5;
            --surface2:#ebebeb;
            --border:  #d0d0d0;
            --accent:  #1a9e95;
            --accent-dim:#1a9e95;
            --amber:   #c07a00;
            --text:    #111111;
            --text-2:  #444444;
            --text-3:  #888888;
          }

          .ap-root { background: #fff; color: #111; font-size: 13px; }

          /* Quebra de página entre seções principais */
          .ap-root header.hero           { page-break-after: avoid; }
          .ap-root section:nth-of-type(1) { page-break-before: always; } /* cadastro */
          .ap-root section:nth-of-type(2) { page-break-before: always; } /* serviços */
          .ap-root section:nth-of-type(3) { page-break-before: always; } /* recursos */
          .ap-root section:nth-of-type(4) { page-break-before: always; } /* fluxo */
          .ap-root section:nth-of-type(5) { page-break-before: always; } /* planos */
          .ap-root section:nth-of-type(6) { page-break-before: always; } /* vs */
          .ap-root .cta-section           { page-break-before: always; }

          /* Evitar corte dentro de cards */
          .ap-root .step-card,
          .ap-root .feature-card,
          .ap-root .service-row,
          .ap-root .flow-step,
          .ap-root .plan-card { page-break-inside: avoid; }

          /* Grids ajustados para impressão */
          .ap-root .steps-grid     { grid-template-columns: repeat(3, 1fr); gap: 4px; }
          .ap-root .features-grid  { grid-template-columns: repeat(3, 1fr); gap: 8px; }
          .ap-root .plan-grid      { grid-template-columns: 1fr 1fr; }
          .ap-root .flow-container { grid-template-columns: 1fr 48px 1fr; }
          .ap-root .flow-line      { min-height: 280px; }

          /* Cores de fundo impressas */
          .ap-root .steps-grid,
          .ap-root .services-list { background: var(--border) !important; }
          .ap-root .step-card,
          .ap-root .service-row,
          .ap-root .feature-card,
          .ap-root .plan-card,
          .ap-root .flow-step { background: var(--surface) !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

          .ap-root .hero-stats { border-color: var(--border); }
          .ap-root .stat-item { background: var(--surface) !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

          /* Não quebrar tabela */
          .ap-root table { page-break-inside: avoid; }
          .ap-root tr { page-break-inside: avoid; }

          /* Seções mais compactas */
          .ap-root section { padding: 40px 0; }
          .ap-root .hero { padding: 60px 0 40px; }
          .ap-root .cta-section { padding: 40px 0 60px; }

          /* Esconder botões de loja no print — só texto */
          .ap-root .store-btns { display: none; }
          .ap-root .cta-section::after {
            content: 'Disponível na App Store e Google Play — busque por "Zupet Walker"';
            display: block;
            margin-top: 16px;
            font-size: 0.9rem;
            color: var(--text-2);
          }
        }
      `}</style>

      <div className="ap-root">

        {/* Botão flutuante de imprimir */}
        <PrintButton />

        {/* HERO */}
        <header className="hero">
          <div className="container">
            <div className="hero-eyebrow">
              <div className="hero-dot" />
              <span>Para Walkers Profissionais</span>
            </div>
            <h1 className="t-display hero-title">Seu negócio de<br /><em>cuidado animal, organizado.</em></h1>
            <p className="hero-subtitle">O Zupet Walker transforma você num profissional completo — 6 tipos de serviço, agenda, relatórios e conexão direta com tutores, tudo num só lugar.</p>
            <div className="hero-stats">
              <div className="stat-item"><span className="stat-value">6</span><span className="stat-label">tipos de serviço</span></div>
              <div className="stat-item"><span className="stat-value">GPS</span><span className="stat-label">rota completa gravada</span></div>
              <div className="stat-item"><span className="stat-value">Auto</span><span className="stat-label">relatório pós-serviço</span></div>
            </div>
          </div>
        </header>

        {/* CADASTRO */}
        <section>
          <div className="container">
            <div className="section-header">
              <div className="t-label">Primeiros Passos</div>
              <h2 className="t-heading" style={{marginTop:'10px'}}>Seu perfil em 5 minutos</h2>
              <p className="section-intro">O cadastro guia você passo a passo. Ao final, seu perfil já aparece para tutores na região.</p>
            </div>
            <div className="steps-grid">
              {[
                { n:'01', t:'Identidade', b:'Nome, foto, endereço via CEP (autopreenchimento) e WhatsApp de contato.' },
                { n:'02', t:'Experiência', b:'Apresentação profissional, anos de experiência e certificações (primeiros socorros, adestramento, etc.).' },
                { n:'03', t:'Capacidade', b:'Máximo de pets por atendimento e raio de atendimento em km.' },
                { n:'04', t:'Disponibilidade', b:'Dias da semana e horário de início/fim de atendimento.' },
                { n:'05', t:'Confirmação', b:'CPF opcional, aceite dos Termos e pronto — perfil ativo e visível para tutores.' },
              ].map(s => (
                <div key={s.n} className="step-card">
                  <div className="step-num">{s.n}</div>
                  <div className="step-title">{s.t}</div>
                  <div className="step-body">{s.b}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SERVIÇOS */}
        <section>
          <div className="container">
            <div className="section-header">
              <div className="t-label">Serviços disponíveis</div>
              <h2 className="t-heading" style={{marginTop:'10px'}}>6 serviços, cada um do seu jeito</h2>
              <p className="section-intro">Configure preço e disponibilidade separada para cada serviço que você oferece. Você define tudo.</p>
            </div>
            <div className="services-list">
              {[
                { cls:'srv-walk',    emoji:'🦮', name:'Passeio',       desc:'Individual ou em grupo com rastreamento GPS completo, registro de eventos por pet (xixi, cocô, humor) e fotos enviadas ao tutor ao final.' },
                { cls:'srv-daycare', emoji:'🏠', name:'Creche',        desc:'Atendimento diurno enquanto o tutor trabalha. Acompanhamento, alimentação conforme instrução e relatório ao final do dia.' },
                { cls:'srv-board',   emoji:'🌙', name:'Hospedagem',    desc:'O pet fica na sua casa por quantos dias o tutor precisar. Ideal para viagens. Preço configurável por dia, semana ou período.' },
                { cls:'srv-train',   emoji:'🎯', name:'Adestramento',  desc:'Sessões de treinamento comportamental com relatório detalhado das habilidades trabalhadas em cada encontro.' },
                { cls:'srv-bath',    emoji:'🛁', name:'Banho e Tosa',  desc:'Higiene e estética do pet. Você define os tipos disponíveis e o tutor agenda conforme sua disponibilidade no app.' },
                { cls:'srv-vet',     emoji:'🏥', name:'Visita ao Vet', desc:'Acompanhe o pet em consultas veterinárias — você busca, leva e traz o animal, com relatório completo da visita para o tutor.' },
              ].map(s => (
                <div key={s.name} className="service-row">
                  <div className="srv-icon-col"><div className={`srv-emoji ${s.cls}`}>{s.emoji}</div></div>
                  <div className="srv-body">
                    <div className="srv-name">{s.name}</div>
                    <div className="srv-desc">{s.desc}</div>
                  </div>
                  <div className="srv-meta"><span className="srv-badge free">Free ou Pro</span></div>
                </div>
              ))}
            </div>
            <p style={{marginTop:'16px', fontSize:'0.8rem', color:'var(--text-3)', textAlign:'center'}}>
              No plano Free você pode cadastrar 1 serviço à sua escolha. Upgrade para Pro para ativar mais de um simultaneamente.
            </p>
          </div>
        </section>

        {/* RECURSOS */}
        <section>
          <div className="container">
            <div className="section-header">
              <div className="t-label">O app trabalha por você</div>
              <h2 className="t-heading" style={{marginTop:'10px'}}>Tudo que você precisava ter</h2>
            </div>
            <div className="features-grid">
              {[
                { i:'📅', t:'Agenda inteligente',       b:'Visualize todos os agendamentos por dia. Aceite ou recuse solicitações com 1 toque — sem precisar responder mensagem.' },
                { i:'📍', t:'Rastreamento GPS',          b:'Rota e distância percorrida registradas durante o passeio. Tutor recebe tudo no relatório automático ao final.' },
                { i:'💰', t:'Gestão financeira',         b:'Registre pagamentos e controle o que está pendente vs. recebido. Tudo organizado por serviço e por tutor.' },
                { i:'⭐', t:'Avaliações e reputação',    b:'Tutores avaliam com estrelas e comentário após cada serviço. Sua nota aparece no perfil público para novos clientes.' },
                { i:'🔔', t:'Notificações imediatas',    b:'Receba push no instante em que uma nova solicitação chegar — sem precisar ficar verificando o app.' },
                { i:'🗓️', t:'Bloqueio de datas',         b:'Bloqueie dias de férias ou indisponibilidade por serviço. Tutores não conseguem agendar nessas datas.' },
              ].map(f => (
                <div key={f.t} className="feature-card">
                  <div className="feature-icon">{f.i}</div>
                  <div className="feature-title">{f.t}</div>
                  <div className="feature-body">{f.b}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FLUXO */}
        <section>
          <div className="container">
            <div className="section-header">
              <div className="t-label">Conexão Walker ↔ Tutor</div>
              <h2 className="t-heading" style={{marginTop:'10px'}}>Como funciona para qualquer serviço</h2>
              <p className="section-intro">Do primeiro contato ao relatório final, tudo dentro dos apps — sem WhatsApp, sem planilha, sem combinado verbal.</p>
            </div>
            <div className="flow-container">
              <div className="flow-side">
                <div className="flow-app-label">App do Tutor (Zupet)</div>
                <div className="flow-step">Busca walkers por cidade e filtra pelo tipo de serviço que precisa</div>
                <div className="flow-step">Vê perfil completo: avaliações, serviços, preços e disponibilidade</div>
                <div className="flow-step">Escolhe data, horário e seleciona os pets — envia solicitação</div>
                <div className="flow-step highlight">Recebe notificação: <strong>serviço confirmado ou recusado</strong></div>
                <div className="flow-step">Recebe relatório automático ao fim do serviço</div>
                <div className="flow-step">Avalia o walker com estrelas e comentário</div>
              </div>
              <div className="flow-center">
                <div className="flow-arrow">↔</div>
                <div className="flow-line" />
              </div>
              <div className="flow-side">
                <div className="flow-app-label">App do Walker (Zupet Walker)</div>
                <div className="flow-step">Perfil visível para tutores da região com serviços e preços configurados</div>
                <div className="flow-step">Recebe push de nova solicitação com data, hora e pets</div>
                <div className="flow-step highlight"><strong>Aceita ou recusa</strong> com 1 toque na Agenda</div>
                <div className="flow-step">Ao aceitar: agendamento confirmado e registrado na sua Agenda</div>
                <div className="flow-step">Executa o serviço — registra eventos, fotos e percurso</div>
                <div className="flow-step">Finaliza → relatório enviado ao tutor + avaliação desbloqueada</div>
              </div>
            </div>
          </div>
        </section>

        {/* PLANOS */}
        <section>
          <div className="container">
            <div className="section-header">
              <div className="t-label">Planos</div>
              <h2 className="t-heading" style={{marginTop:'10px'}}>Free ou Pro — você escolhe</h2>
              <p className="section-intro">Comece gratuitamente e faça upgrade quando seu negócio crescer.</p>
            </div>
            <div className="plan-grid">
              <div className="plan-card">
                <div className="plan-name">Free</div>
                <div className="plan-tag">Grátis para sempre</div>
                <ul className="plan-list">
                  <li>1 tipo de serviço cadastrado</li>
                  <li>Até 7 tutores/pets vinculados</li>
                  <li>Até 2 pets simultâneos por atendimento</li>
                  <li>Histórico dos últimos 7 dias</li>
                  <li>Agenda, relatórios e GPS incluídos</li>
                  <li>Avaliações e perfil público</li>
                  <li className="limit">Last Minute indisponível</li>
                  <li className="limit">Mais de 1 serviço indisponível</li>
                </ul>
              </div>
              <div className="plan-card pro">
                <div className="plan-name">Pro</div>
                <div className="plan-tag">Para quem vive disso</div>
                <ul className="plan-list">
                  <li>Serviços ilimitados cadastrados simultaneamente</li>
                  <li>Tutores e pets ilimitados</li>
                  <li>Pets simultâneos ilimitados por atendimento</li>
                  <li>Histórico completo de todos os serviços</li>
                  <li>Last Minute — aceite agendamentos de última hora</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* VS */}
        <section>
          <div className="container">
            <div className="section-header">
              <div className="t-label">Por que usar o app</div>
              <h2 className="t-heading" style={{marginTop:'10px'}}>Zupet Walker vs. jeito informal</h2>
              <p className="section-intro">Tudo que você fazia manualmente, agora organizado.</p>
            </div>
            <div className="vs-table-wrap">
              <table>
                <thead>
                  <tr><th>Funcionalidade</th><th>Zupet Walker</th><th>WhatsApp / Informal</th></tr>
                </thead>
                <tbody>
                  {[
                    ['Agenda com status (pendente/confirmado/concluído)', true, false],
                    ['Relatório automático enviado ao tutor', true, false],
                    ['Rastreamento GPS com rota e distância', true, false],
                    ['Registro de eventos por pet durante o passeio', true, false],
                    ['Fotos organizadas por sessão', true, false],
                    ['Controle financeiro (pendente vs. recebido)', true, false],
                    ['Sistema de avaliações com nota pública', true, false],
                    ['Bloqueio de datas de indisponibilidade', true, false],
                    ['Notificação push imediata para nova solicitação', true, 'Parcial'],
                  ].map(([label, z, w]) => (
                    <tr key={String(label)}>
                      <td>{label}</td>
                      <td className="check">✓</td>
                      <td className={w === false ? 'cross' : ''}>{w === false ? '–' : String(w)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <div className="container">
            <div className="t-label" style={{marginBottom:'16px'}}>Pronto para começar?</div>
            <h2 className="t-heading">Baixe o Zupet Walker<br />e comece hoje mesmo</h2>
            <p style={{marginTop:'12px', maxWidth:'420px', margin:'12px auto 0', fontSize:'1rem', lineHeight:'1.7', color:'var(--text-2)'}}>
              Gratuito para começar. Cadastro em 5 minutos. Seu perfil aparece para tutores da sua região imediatamente.
            </p>
            <div className="store-btns">
              <a href="#" className="store-btn">
                <svg viewBox="0 0 24 24" fill="currentColor" style={{width:28,height:28,flexShrink:0}}>
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.14-2.18 1.27-2.16 3.79.03 3.02 2.65 4.03 2.68 4.04l-.07.24zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <div><small>Disponível na</small>App Store</div>
              </a>
              <a href="#" className="store-btn">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" style={{flexShrink:0}}>
                  <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48A5.84 5.84 0 0 0 12 1.5c-.96 0-1.86.23-2.66.63L7.85.65c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31A5.983 5.983 0 0 0 6 7h12a5.98 5.98 0 0 0-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z"/>
                </svg>
                <div><small>Disponível no</small>Google Play</div>
              </a>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
