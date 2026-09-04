'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

const SLIDES = [
  { src: '/screenshots/android-01-Home.png',            label: 'Home' },
  { src: '/screenshots/android-02-Meus-Pets.png',       label: 'Meus Pets' },
  { src: '/screenshots/android-03-Detalhe-Pet.png',     label: 'Detalhe do Pet' },
  { src: '/screenshots/android-04-Perfil-Walker.png',   label: 'Perfil Walker' },
  { src: '/screenshots/android-05-Passeio-Ativo.png',   label: 'Passeio Ativo' },
  { src: '/screenshots/android-06-Resumo-Passeio.png',  label: 'Resumo do Passeio' },
  { src: '/screenshots/android-07-Historico.png',       label: 'Histórico' },
];

export function ScreenshotsCarousel() {
  const [active, setActive] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = useCallback(() => setActive((i) => (i + 1) % SLIDES.length), []);
  const prev = useCallback(() => setActive((i) => (i - 1 + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    timerRef.current = setInterval(next, 3500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next]);

  function resetTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(next, 3500);
  }

  function onPointerDown(e: React.PointerEvent) {
    dragStart.current = e.clientX;
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerUp(e: React.PointerEvent) {
    if (!dragging) return;
    setDragging(false);
    const dx = e.clientX - dragStart.current;
    if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); resetTimer(); }
  }

  return (
    <section style={{ background: '#f0faf7', borderTop: '1px solid #d4efe8', borderBottom: '1px solid #d4efe8', padding: '3.5rem 1.5rem', overflow: 'hidden' }}>
      <p style={{ textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, color: '#00C6A7', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
        Veja o app por dentro
      </p>
      <h2 style={{ textAlign: 'center', fontSize: '1.45rem', fontWeight: 800, color: '#0D2922', letterSpacing: '-0.02em', marginBottom: '2.5rem' }}>
        Tudo na palma da sua mão
      </h2>

      <div style={{ position: 'relative', maxWidth: 440, margin: '0 auto', userSelect: 'none' }}>
        {/* track */}
        <div
          ref={trackRef}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, cursor: dragging ? 'grabbing' : 'grab', touchAction: 'pan-y' }}
        >
          {/* prev ghost */}
          {[-1, 0, 1].map((offset) => {
            const idx = (active + offset + SLIDES.length) % SLIDES.length;
            const isCurrent = offset === 0;
            return (
              <div
                key={offset}
                onClick={() => { if (offset !== 0) { offset > 0 ? next() : prev(); resetTimer(); } }}
                style={{
                  flexShrink: 0,
                  width: isCurrent ? 200 : 140,
                  transition: 'width 0.3s ease, opacity 0.3s ease, transform 0.3s ease',
                  opacity: isCurrent ? 1 : 0.45,
                  transform: isCurrent ? 'scale(1)' : 'scale(0.92)',
                  cursor: offset !== 0 ? 'pointer' : 'grab',
                }}
              >
                {/* phone shell */}
                <div style={{
                  borderRadius: isCurrent ? 36 : 28,
                  overflow: 'hidden',
                  boxShadow: isCurrent
                    ? '0 24px 64px rgba(0,0,0,0.22), 0 0 0 6px #fff, 0 0 0 8px rgba(0,198,167,0.25)'
                    : '0 8px 24px rgba(0,0,0,0.12), 0 0 0 4px #fff',
                  aspectRatio: '9/19.5',
                  background: '#000',
                  transition: 'border-radius 0.3s ease, box-shadow 0.3s ease',
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={SLIDES[idx].src}
                    alt={SLIDES[idx].label}
                    draggable={false}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* label */}
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.82rem', fontWeight: 600, color: '#2E7060', letterSpacing: '0.01em', height: 20 }}>
          {SLIDES[active].label}
        </p>

        {/* nav arrows */}
        <button
          aria-label="Anterior"
          onClick={() => { prev(); resetTimer(); }}
          style={{ position: 'absolute', left: -8, top: '45%', transform: 'translateY(-50%)', background: '#fff', border: '1px solid #c8e8df', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', color: '#00C6A7', fontSize: 16 }}
        >‹</button>
        <button
          aria-label="Próximo"
          onClick={() => { next(); resetTimer(); }}
          style={{ position: 'absolute', right: -8, top: '45%', transform: 'translateY(-50%)', background: '#fff', border: '1px solid #c8e8df', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', color: '#00C6A7', fontSize: 16 }}
        >›</button>
      </div>

      {/* dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 7, marginTop: 20 }}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            aria-label={`Ir para ${SLIDES[i].label}`}
            onClick={() => { setActive(i); resetTimer(); }}
            style={{ width: i === active ? 20 : 7, height: 7, borderRadius: 4, border: 'none', cursor: 'pointer', background: i === active ? '#00C6A7' : '#b0d8ce', transition: 'width 0.25s ease, background 0.25s ease', padding: 0 }}
          />
        ))}
      </div>
    </section>
  );
}
