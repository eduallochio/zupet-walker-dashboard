'use client';

import { useState, useEffect, useCallback } from 'react';

const slides = [
  {
    id: 'capa',
    label: 'Capa',
    content: (
      <div className="slide-center">
        <div className="eyebrow">Para Walkers Profissionais</div>
        <h1 className="display">
          Seu negócio de<br /><em>cuidado animal,</em><br /><em>organizado.</em>
        </h1>
        <p className="subtitle">
          GPS · Agenda · Relatórios automáticos · 6 serviços · Conexão com tutores
        </p>
        <div className="stat-row">
          <div className="stat"><span className="stat-val">6</span><span className="stat-lbl">tipos de serviço</span></div>
          <div className="stat"><span className="stat-val">GPS</span><span className="stat-lbl">rota gravada</span></div>
          <div className="stat"><span className="stat-val">Auto</span><span className="stat-lbl">relatório pós-serviço</span></div>
          <div className="stat"><span className="stat-val">Free</span><span className="stat-lbl">para começar</span></div>
        </div>
      </div>
    ),
  },
  {
    id: 'cadastro',
    label: 'Cadastro',
    content: (
      <div className="slide-top">
        <div className="slide-eyebrow">Primeiros Passos</div>
        <h2 className="heading">Seu perfil em 5 minutos</h2>
        <div className="steps-grid-5">
          {[
            { n: '01', t: 'Identidade', b: 'Nome, foto, CEP e WhatsApp' },
            { n: '02', t: 'Experiência', b: 'Bio, anos de prática e certificações' },
            { n: '03', t: 'Capacidade', b: 'Máx. de pets e raio de atendimento' },
            { n: '04', t: 'Disponibilidade', b: 'Dias da semana e horários' },
            { n: '05', t: 'Confirmação', b: 'CPF opcional · Aceite dos Termos · Perfil ativo' },
          ].map(s => (
            <div key={s.n} className="step-card">
              <div className="step-n">{s.n}</div>
              <div className="step-t">{s.t}</div>
              <div className="step-b">{s.b}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'servicos',
    label: 'Serviços',
    content: (
      <div className="slide-top">
        <div className="slide-eyebrow">Serviços disponíveis</div>
        <h2 className="heading">6 serviços, cada um do seu jeito</h2>
        <div className="srv-grid">
          {[
            { e: '🦮', n: 'Passeio',      d: 'GPS + eventos por pet + fotos ao tutor' },
            { e: '🏠', n: 'Creche',       d: 'Atendimento diurno com relatório no fim do dia' },
            { e: '🌙', n: 'Hospedagem',   d: 'Pet na sua casa por dias ou semanas' },
            { e: '🎯', n: 'Adestramento', d: 'Sessões com relatório de habilidades trabalhadas' },
            { e: '🛁', n: 'Banho e Tosa', d: 'Higiene e estética com agenda integrada' },
            { e: '🏥', n: 'Visita ao Vet', d: 'Acompanhe o pet em consultas veterinárias' },
          ].map(s => (
            <div key={s.n} className="srv-card">
              <div className="srv-emoji">{s.e}</div>
              <div className="srv-name">{s.n}</div>
              <div className="srv-desc">{s.d}</div>
              <div className="srv-badge">Free ou Pro</div>
            </div>
          ))}
        </div>
        <p className="footnote">Free: 1 serviço à escolha · Pro: todos simultâneos</p>
      </div>
    ),
  },
  {
    id: 'recursos',
    label: 'Recursos',
    content: (
      <div className="slide-top">
        <div className="slide-eyebrow">O app trabalha por você</div>
        <h2 className="heading">Tudo que você precisava ter</h2>
        <div className="feat-grid">
          {[
            { i: '📅', t: 'Agenda inteligente',     b: 'Aceite ou recuse solicitações com 1 toque' },
            { i: '📍', t: 'Rastreamento GPS',        b: 'Rota e distância no relatório automático' },
            { i: '💰', t: 'Gestão financeira',       b: 'Pendente vs. recebido por serviço e tutor' },
            { i: '⭐', t: 'Avaliações',              b: 'Estrelas e comentários no seu perfil público' },
            { i: '🔔', t: 'Notificações imediatas',  b: 'Push no instante em que a solicitação chegar' },
            { i: '🗓️', t: 'Bloqueio de datas',       b: 'Tutores não agendam nas datas bloqueadas' },
          ].map(f => (
            <div key={f.t} className="feat-card">
              <div className="feat-icon">{f.i}</div>
              <div className="feat-title">{f.t}</div>
              <div className="feat-body">{f.b}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'fluxo',
    label: 'Fluxo',
    content: (
      <div className="slide-top">
        <div className="slide-eyebrow">Conexão Walker ↔ Tutor</div>
        <h2 className="heading">Do pedido ao relatório — tudo no app</h2>
        <div className="flow-cols">
          <div className="flow-col">
            <div className="flow-col-label">App do Tutor (Zupet)</div>
            {['Busca walkers e filtra por serviço', 'Vê perfil, avaliações e preços', 'Escolhe data, pets · envia solicitação', 'Recebe confirmação ou recusa', 'Recebe relatório automático ao fim', 'Avalia o walker com estrelas'].map(t => (
              <div key={t} className="flow-item">{t}</div>
            ))}
          </div>
          <div className="flow-divider">
            <div className="flow-arrow">↔</div>
          </div>
          <div className="flow-col">
            <div className="flow-col-label">App do Walker (Zupet Walker)</div>
            {['Perfil visível para tutores da região', 'Recebe push da nova solicitação', 'Aceita ou recusa com 1 toque', 'Agendamento confirmado na Agenda', 'Executa · registra eventos e fotos', 'Finaliza → relatório enviado automaticamente'].map(t => (
              <div key={t} className="flow-item">{t}</div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'planos',
    label: 'Planos',
    content: (
      <div className="slide-top">
        <div className="slide-eyebrow">Planos</div>
        <h2 className="heading">Free ou Pro — você escolhe</h2>
        <div className="plans-row">
          <div className="plan-card">
            <div className="plan-name free-name">Free</div>
            <div className="plan-tag-label">Grátis para sempre</div>
            <ul className="plan-list">
              <li>1 tipo de serviço cadastrado</li>
              <li>Até 7 tutores/pets vinculados</li>
              <li>Até 2 pets simultâneos</li>
              <li>Histórico dos últimos 7 dias</li>
              <li>Agenda, relatórios e GPS incluídos</li>
            </ul>
          </div>
          <div className="plan-card plan-pro">
            <div className="plan-badge-rec">RECOMENDADO</div>
            <div className="plan-name pro-name">Pro</div>
            <div className="plan-tag-label">Para quem vive disso</div>
            <ul className="plan-list">
              <li>Serviços ilimitados simultâneos</li>
              <li>Tutores e pets ilimitados</li>
              <li>Pets simultâneos ilimitados</li>
              <li>Histórico completo</li>
              <li>Last Minute — agendamentos de última hora</li>
            </ul>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'vs',
    label: 'VS Informal',
    content: (
      <div className="slide-top">
        <div className="slide-eyebrow">Por que usar o app</div>
        <h2 className="heading">Zupet Walker vs. jeito informal</h2>
        <table className="vs-table">
          <thead>
            <tr><th>Funcionalidade</th><th>Zupet Walker</th><th>WhatsApp / Informal</th></tr>
          </thead>
          <tbody>
            {[
              ['Agenda com status automático', true, false],
              ['Relatório enviado ao tutor', true, false],
              ['Rastreamento GPS com rota', true, false],
              ['Registro de eventos por pet', true, false],
              ['Controle financeiro integrado', true, false],
              ['Sistema de avaliações públicas', true, false],
              ['Bloqueio de datas', true, false],
            ].map(([l, z, w]) => (
              <tr key={String(l)}>
                <td>{l}</td>
                <td className="chk">✓</td>
                <td className="crs">{w ? '✓' : '–'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },
  {
    id: 'cta',
    label: 'Download',
    content: (
      <div className="slide-center">
        <div className="eyebrow">Pronto para começar?</div>
        <h2 className="heading-lg">Baixe o Zupet Walker<br />e comece hoje mesmo</h2>
        <p className="subtitle">Gratuito · Cadastro em 5 min · Perfil ativo imediatamente</p>
        <div className="store-row">
          <div className="store-pill">
            <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.14-2.18 1.27-2.16 3.79.03 3.02 2.65 4.03 2.68 4.04l-.07.24zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            <div><small>Disponível na</small><strong>App Store</strong></div>
          </div>
          <div className="store-pill">
            <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
              <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48A5.84 5.84 0 0 0 12 1.5c-.96 0-1.86.23-2.66.63L7.85.65c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31A5.983 5.983 0 0 0 6 7h12a5.98 5.98 0 0 0-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z"/>
            </svg>
            <div><small>Disponível no</small><strong>Google Play</strong></div>
          </div>
        </div>
        <p className="url-hint">walker.zupet.io</p>
      </div>
    ),
  },
];

const css = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:      #0D1A17;
    --surface: #1A2E2A;
    --border:  #2E4A44;
    --accent:  #40E0D0;
    --amber:   #F5A623;
    --text:    #E8F5F0;
    --text-2:  #6BBFB5;
    --text-3:  #3E6B65;
  }

  html, body { height: 100%; overflow: hidden; }
  body { background: var(--bg); font-family: var(--font-jakarta), system-ui, sans-serif; color: var(--text); }

  .deck { position: fixed; inset: 0; display: flex; flex-direction: column; }

  /* NAV BAR */
  .nav { display: flex; align-items: center; justify-content: space-between; padding: 12px 24px; background: rgba(13,26,23,0.95); border-bottom: 1px solid var(--border); flex-shrink: 0; }
  .nav-logo { font-weight: 800; font-size: 0.9rem; color: var(--accent); }
  .nav-pills { display: flex; gap: 4px; }
  .nav-pill { padding: 4px 10px; border-radius: 100px; font-size: 0.7rem; font-weight: 600; cursor: pointer; border: 1px solid transparent; background: transparent; color: var(--text-3); transition: all 0.15s; }
  .nav-pill:hover { color: var(--text); }
  .nav-pill.active { background: var(--surface); border-color: var(--border); color: var(--accent); }
  .nav-counter { font-size: 0.75rem; color: var(--text-3); font-weight: 600; min-width: 48px; text-align: right; }

  /* SLIDE AREA */
  .slides-wrap { flex: 1; position: relative; overflow: hidden; }
  .slide { position: absolute; inset: 0; display: flex; align-items: flex-start; justify-content: flex-start; padding: 40px 60px; overflow-y: auto; transition: opacity 0.25s, transform 0.25s; }
  .slide.active { opacity: 1; transform: translateX(0); pointer-events: auto; }
  .slide.left  { opacity: 0; transform: translateX(-48px); pointer-events: none; }
  .slide.right { opacity: 0; transform: translateX(48px);  pointer-events: none; }

  .slide-center { width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100%; text-align: center; gap: 28px; }
  .slide-top    { width: 100%; display: flex; flex-direction: column; gap: 24px; }

  .display { font-size: clamp(2.4rem, 4.5vw, 3.6rem); font-weight: 800; line-height: 1.08; letter-spacing: -0.02em; text-wrap: balance; }
  .display em { font-style: italic; color: var(--accent); }
  .heading { font-size: clamp(1.6rem, 3vw, 2.2rem); font-weight: 700; line-height: 1.15; }
  .heading-lg { font-size: clamp(2rem, 3.5vw, 2.8rem); font-weight: 800; line-height: 1.1; text-wrap: balance; }
  .subtitle { font-size: 1rem; color: var(--text-2); line-height: 1.7; max-width: 500px; }
  .eyebrow, .slide-eyebrow { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent); }
  .footnote { font-size: 0.78rem; color: var(--text-3); text-align: center; }

  /* Stats hero */
  .stat-row { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; }
  .stat { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 16px 28px; display: flex; flex-direction: column; align-items: center; gap: 2px; }
  .stat-val { font-size: 1.6rem; font-weight: 800; color: var(--accent); }
  .stat-lbl { font-size: 0.72rem; color: var(--text-3); }

  /* Steps */
  .steps-grid-5 { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
  .step-card { background: var(--surface); border-radius: 12px; padding: 18px; }
  .step-n { font-size: 1.6rem; font-weight: 800; color: var(--border); margin-bottom: 8px; }
  .step-t { font-weight: 700; font-size: 0.9rem; margin-bottom: 4px; }
  .step-b { font-size: 0.78rem; color: var(--text-2); line-height: 1.5; }

  /* Services */
  .srv-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .srv-card { background: var(--surface); border-radius: 14px; padding: 18px; display: flex; flex-direction: column; gap: 6px; }
  .srv-emoji { font-size: 1.5rem; }
  .srv-name { font-weight: 700; font-size: 0.95rem; }
  .srv-desc { font-size: 0.78rem; color: var(--text-2); line-height: 1.5; flex: 1; }
  .srv-badge { font-size: 0.62rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; background: rgba(64,224,208,0.1); color: var(--accent); padding: 2px 8px; border-radius: 100px; align-self: flex-start; }

  /* Features */
  .feat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .feat-card { background: var(--surface); border-radius: 14px; padding: 18px; display: flex; flex-direction: column; gap: 6px; }
  .feat-icon { font-size: 1.4rem; }
  .feat-title { font-weight: 700; font-size: 0.9rem; }
  .feat-body { font-size: 0.78rem; color: var(--text-2); line-height: 1.5; }

  /* Flow */
  .flow-cols { display: grid; grid-template-columns: 1fr 40px 1fr; gap: 8px; }
  .flow-col { display: flex; flex-direction: column; gap: 6px; }
  .flow-col-label { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-3); margin-bottom: 4px; }
  .flow-item { background: var(--surface); border-radius: 10px; padding: 10px 14px; font-size: 0.82rem; color: var(--text); line-height: 1.4; }
  .flow-divider { display: flex; flex-direction: column; align-items: center; padding-top: 36px; }
  .flow-arrow { width: 32px; height: 32px; border-radius: 50%; background: var(--accent); color: var(--bg); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; flex-shrink: 0; }

  /* Plans */
  .plans-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .plan-card { background: var(--surface); border: 1px solid var(--border); border-radius: 18px; padding: 28px; position: relative; overflow: hidden; }
  .plan-pro { border-color: var(--amber); background: linear-gradient(135deg, var(--surface) 0%, rgba(245,166,35,0.06) 100%); }
  .plan-badge-rec { position: absolute; top: 16px; right: -28px; background: var(--amber); color: #1A1000; font-size: 0.55rem; font-weight: 700; letter-spacing: 0.12em; padding: 3px 36px; transform: rotate(45deg); }
  .plan-name { font-size: 1.6rem; font-weight: 800; margin-bottom: 2px; }
  .free-name { color: var(--text-2); }
  .pro-name  { color: var(--amber); }
  .plan-tag-label { font-size: 0.72rem; color: var(--text-3); margin-bottom: 16px; }
  .plan-list { list-style: none; display: flex; flex-direction: column; gap: 8px; }
  .plan-list li { display: flex; align-items: flex-start; gap: 8px; font-size: 0.85rem; color: var(--text-2); }
  .plan-list li::before { content: '✓'; flex-shrink: 0; width: 16px; height: 16px; border-radius: 50%; background: rgba(64,224,208,0.12); color: var(--accent); font-size: 0.6rem; font-weight: 700; display: flex; align-items: center; justify-content: center; margin-top: 2px; }
  .plan-pro .plan-list li::before { background: rgba(245,166,35,0.12); color: var(--amber); }

  /* VS Table */
  .vs-table { width: 100%; border-collapse: collapse; }
  .vs-table th, .vs-table td { padding: 10px 14px; text-align: left; font-size: 0.85rem; border-bottom: 1px solid var(--border); }
  .vs-table th { background: var(--surface); color: var(--text-2); font-weight: 600; font-size: 0.75rem; }
  .vs-table td:first-child { color: var(--text); }
  .chk { color: var(--accent); font-size: 1rem; }
  .crs { color: var(--text-3); font-size: 1rem; }

  /* CTA */
  .store-row { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; }
  .store-pill { display: flex; align-items: center; gap: 12px; background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 14px 22px; color: var(--text); }
  .store-pill small { display: block; font-size: 0.68rem; color: var(--text-3); }
  .store-pill strong { font-size: 1rem; }
  .url-hint { font-size: 0.85rem; color: var(--text-3); letter-spacing: 0.04em; }

  /* BOTTOM BAR */
  .bottom-bar { display: flex; align-items: center; justify-content: space-between; padding: 10px 24px; background: rgba(13,26,23,0.95); border-top: 1px solid var(--border); flex-shrink: 0; }
  .nav-btn { display: flex; align-items: center; gap: 6px; background: var(--surface); border: 1px solid var(--border); color: var(--text); font-size: 0.8rem; font-weight: 600; padding: 8px 18px; border-radius: 100px; cursor: pointer; transition: border-color 0.15s; }
  .nav-btn:hover:not(:disabled) { border-color: var(--accent); }
  .nav-btn:disabled { opacity: 0.3; cursor: default; }
  .progress-bar { flex: 1; height: 3px; background: var(--border); border-radius: 3px; margin: 0 20px; }
  .progress-fill { height: 100%; background: var(--accent); border-radius: 3px; transition: width 0.3s; }
  .hint { font-size: 0.68rem; color: var(--text-3); }

  /* PRINT */
  @media print {
    html, body { overflow: visible; height: auto; }
    .deck { position: static; display: block; }
    .nav, .bottom-bar { display: none !important; }
    .slides-wrap { position: static; overflow: visible; height: auto; }
    .slide { position: static !important; opacity: 1 !important; transform: none !important; pointer-events: auto !important;
      page-break-after: always; break-after: page;
      min-height: 100vh; padding: 48px 60px; display: flex; flex-direction: column; justify-content: flex-start;
      background: white; color: #111;
    }
    :root { --bg: #fff; --surface: #f5f5f5; --border: #d0d0d0; --accent: #1a9e95; --amber: #c07a00; --text: #111; --text-2: #444; --text-3: #888; }
    .display em { color: var(--accent); }
    .stat-val { color: var(--accent); }
    .chk { color: var(--accent); }
    .stat, .step-card, .srv-card, .feat-card, .flow-item, .plan-card, .store-pill { background: var(--surface) !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .steps-grid-5 { grid-template-columns: repeat(5, 1fr); }
    .srv-grid { grid-template-columns: repeat(3, 1fr); }
    .feat-grid { grid-template-columns: repeat(3, 1fr); }
  }
`;

export function SlidesClient() {
  const [current, setCurrent] = useState(0);

  const goTo = useCallback((i: number) => {
    if (i >= 0 && i < slides.length) setCurrent(i);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') goTo(current + 1);
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp') goTo(current - 1);
      if (e.key === 'Home') goTo(0);
      if (e.key === 'End')  goTo(slides.length - 1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [current, goTo]);

  const progress = ((current + 1) / slides.length) * 100;

  return (
    <>
      <style>{css}</style>
      <div className="deck">
        {/* Top nav */}
        <nav className="nav">
          <div className="nav-logo">Zupet Walker</div>
          <div className="nav-pills">
            {slides.map((s, i) => (
              <button key={s.id} className={`nav-pill${i === current ? ' active' : ''}`} onClick={() => goTo(i)}>
                {s.label}
              </button>
            ))}
          </div>
          <div className="nav-counter">{current + 1} / {slides.length}</div>
        </nav>

        {/* Slides */}
        <div className="slides-wrap">
          {slides.map((s, i) => {
            const state = i === current ? 'active' : i < current ? 'left' : 'right';
            return (
              <div key={s.id} className={`slide ${state}`}>
                {s.content}
              </div>
            );
          })}
        </div>

        {/* Bottom bar */}
        <div className="bottom-bar">
          <button className="nav-btn" onClick={() => goTo(current - 1)} disabled={current === 0}>
            ← Anterior
          </button>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="hint">← → ou clique nos títulos</span>
          <button className="nav-btn" onClick={() => goTo(current + 1)} disabled={current === slides.length - 1}>
            Próximo →
          </button>
        </div>
      </div>
    </>
  );
}
