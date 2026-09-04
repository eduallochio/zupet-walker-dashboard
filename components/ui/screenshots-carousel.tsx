'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const SLIDES = [
  { src: '/screenshots/android-01-Home.png',            label: 'Home',               desc: 'Visão geral dos seus atendimentos do dia' },
  { src: '/screenshots/android-02-Meus-Pets.png',       label: 'Meus Pets',          desc: 'Todos os pets dos seus clientes em um só lugar' },
  { src: '/screenshots/android-03-Detalhe-Pet.png',     label: 'Detalhe do Pet',     desc: 'Histórico completo, vacinas e observações do pet' },
  { src: '/screenshots/android-04-Perfil-Walker.png',   label: 'Seu Perfil',         desc: 'Página pública com serviços, preços e avaliações' },
  { src: '/screenshots/android-05-Passeio-Ativo.png',   label: 'Passeio Ativo',      desc: 'GPS em tempo real registrando a rota do passeio' },
  { src: '/screenshots/android-06-Resumo-Passeio.png',  label: 'Resumo do Passeio',  desc: 'Relatório automático com distância, fotos e eventos' },
  { src: '/screenshots/android-07-Historico.png',       label: 'Histórico',          desc: 'Todos os atendimentos e recebimentos registrados' },
];

export function ScreenshotsCarousel() {
  const [active, setActive] = useState(0);
  const [fading, setFading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dragStart = useRef(0);

  const goTo = useCallback((idx: number) => {
    setFading(true);
    setTimeout(() => {
      setActive(idx);
      setFading(false);
    }, 200);
  }, []);

  const next = useCallback(() => goTo((active + 1) % SLIDES.length), [active, goTo]);
  const prev = useCallback(() => goTo((active - 1 + SLIDES.length) % SLIDES.length), [active, goTo]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(next, 4000);
  }, [next]);

  useEffect(() => {
    timerRef.current = setInterval(next, 4000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next]);

  return (
    <section style={{ background: '#071a12', borderTop: '1px solid #0f2d1e', borderBottom: '1px solid #0f2d1e', padding: '4rem 1.5rem' }}>
      <p style={{ textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, color: '#00C6A7', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
        Veja o app por dentro
      </p>
      <h2 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 800, color: '#E8F5F0', letterSpacing: '-0.025em', marginBottom: '0.5rem' }}>
        Tudo na palma da sua mão
      </h2>
      <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#5a9080', marginBottom: '3rem' }}>
        {SLIDES[active].desc}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>

        {/* Phone mockup */}
        <div style={{ position: 'relative', width: 220 }}>
          {/* outer shell */}
          <div style={{
            borderRadius: 40,
            background: 'linear-gradient(160deg, #1c2e28 0%, #0a1a12 100%)',
            padding: 10,
            boxShadow: '0 40px 100px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.07)',
          }}>
            {/* notch bar */}
            <div style={{ background: '#000', borderRadius: '32px 32px 0 0', height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 0 }}>
              <div style={{ width: 60, height: 8, borderRadius: 4, background: '#111' }} />
            </div>
            {/* screen */}
            <div style={{
              borderRadius: '0 0 26px 26px',
              overflow: 'hidden',
              background: '#000',
              aspectRatio: '9/19',
              position: 'relative',
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={active}
                src={SLIDES[active].src}
                alt={SLIDES[active].label}
                draggable={false}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  opacity: fading ? 0 : 1,
                  transition: 'opacity 0.2s ease',
                }}
              />
              {/* screen glare */}
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%)',
              }} />
            </div>
          </div>
          {/* side buttons */}
          <div style={{ position: 'absolute', right: -4, top: 80, width: 4, height: 40, background: '#1c2e28', borderRadius: '0 3px 3px 0', boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.05)' }} />
          <div style={{ position: 'absolute', left: -4, top: 72, width: 4, height: 28, background: '#1c2e28', borderRadius: '3px 0 0 3px', boxShadow: 'inset 1px 0 0 rgba(255,255,255,0.05)' }} />
          <div style={{ position: 'absolute', left: -4, top: 110, width: 4, height: 28, background: '#1c2e28', borderRadius: '3px 0 0 3px', boxShadow: 'inset 1px 0 0 rgba(255,255,255,0.05)' }} />
        </div>

        {/* Label + nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <button
            aria-label="Anterior"
            onClick={() => { prev(); resetTimer(); }}
            style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(0,198,167,0.25)', background: 'rgba(0,198,167,0.08)', color: '#00C6A7', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
          >‹</button>

          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#E8F5F0', letterSpacing: '-0.01em', minWidth: 140, textAlign: 'center' }}>
            {SLIDES[active].label}
          </span>

          <button
            aria-label="Próximo"
            onClick={() => { next(); resetTimer(); }}
            style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(0,198,167,0.25)', background: 'rgba(0,198,167,0.08)', color: '#00C6A7', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
          >›</button>
        </div>

        {/* Dots */}
        <div style={{ display: 'flex', gap: 8 }}>
          {SLIDES.map((_, i) => (
            <button
              key={i}
              aria-label={`Ir para ${SLIDES[i].label}`}
              onClick={() => { goTo(i); resetTimer(); }}
              style={{
                width: i === active ? 24 : 8,
                height: 8,
                borderRadius: 4,
                border: 'none',
                cursor: 'pointer',
                background: i === active ? '#00C6A7' : 'rgba(0,198,167,0.2)',
                transition: 'width 0.3s ease, background 0.3s ease',
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
