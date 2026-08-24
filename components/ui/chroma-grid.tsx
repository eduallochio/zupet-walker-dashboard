'use client';
import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { SiInstagram, SiWhatsapp } from 'react-icons/si';

export interface ChromaItem {
  image: string;
  title: string;
  subtitle: string;
  handle?: string;
  location?: string;
  borderColor?: string;
  gradient?: string;
  url?: string;
  // extra data forwarded to modal
  meta?: Record<string, unknown>;
}

export interface ChromaGridProps {
  items?: ChromaItem[];
  className?: string;
  radius?: number;
  damping?: number;
  fadeOut?: number;
  ease?: string;
  onCardClick?: (item: ChromaItem) => void;
}

type SetterFn = (v: number | string) => void;

const ChromaGrid: React.FC<ChromaGridProps> = ({
  items,
  className = '',
  radius = 300,
  damping = 0.45,
  fadeOut = 0.6,
  ease = 'power3.out',
  onCardClick,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const setX = useRef<SetterFn | null>(null);
  const setY = useRef<SetterFn | null>(null);
  const pos = useRef({ x: 0, y: 0 });

  const data = items?.length ? items : [];

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    setX.current = gsap.quickSetter(el, '--x', 'px') as SetterFn;
    setY.current = gsap.quickSetter(el, '--y', 'px') as SetterFn;
    const { width, height } = el.getBoundingClientRect();
    pos.current = { x: width / 2, y: height / 2 };
    setX.current(pos.current.x);
    setY.current(pos.current.y);
  }, []);

  const moveTo = (x: number, y: number) => {
    gsap.to(pos.current, {
      x,
      y,
      duration: damping,
      ease,
      onUpdate: () => {
        setX.current?.(pos.current.x);
        setY.current?.(pos.current.y);
      },
      overwrite: true,
    });
  };

  const handleMove = (e: React.PointerEvent) => {
    const r = rootRef.current!.getBoundingClientRect();
    moveTo(e.clientX - r.left, e.clientY - r.top);
    gsap.to(fadeRef.current, { opacity: 0, duration: 0.25, overwrite: true });
  };

  const handleLeave = () => {
    gsap.to(fadeRef.current, { opacity: 1, duration: fadeOut, overwrite: true });
  };

  const handleCardClick = (item: ChromaItem) => {
    if (onCardClick) {
      onCardClick(item);
    } else if (item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCardMove: React.MouseEventHandler<HTMLElement> = (e) => {
    const c = e.currentTarget as HTMLElement;
    const rect = c.getBoundingClientRect();
    c.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    c.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <div
      ref={rootRef}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={`relative w-full h-full flex flex-wrap justify-center items-start gap-3 ${className}`}
      style={{ '--r': `${radius}px`, '--x': '50%', '--y': '50%' } as React.CSSProperties}
    >
      {data.map((c, i) => {
        const meta = c.meta ?? {};
        const bio = typeof meta.bio === 'string' ? meta.bio : null;
        const instagram = typeof meta.instagram === 'string' ? meta.instagram : null;
        const whatsapp = typeof meta.whatsapp === 'string' ? meta.whatsapp : null;
        const rating = meta.rating != null ? Number(meta.rating) : null;
        const isInitials = c.image.startsWith('data:image/svg');

        return (
          <article
            key={i}
            onMouseMove={handleCardMove}
            className="group relative flex flex-col w-[280px] rounded-[22px] overflow-hidden transition-transform duration-300 cursor-pointer hover:scale-[1.03]"
            style={{
              background: c.gradient,
              border: `1.5px solid ${c.borderColor || 'rgba(255,255,255,0.12)'}`,
              '--spotlight-color': 'rgba(255,255,255,0.25)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
            } as React.CSSProperties}
            onClick={() => handleCardClick(c)}
          >
            {/* spotlight hover */}
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-500 z-20 opacity-0 group-hover:opacity-100"
              style={{
                background: 'radial-gradient(circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 65%)',
              }}
            />

            {/* avatar */}
            <div className="relative z-10 flex flex-col items-center pt-7 pb-4 px-5 gap-3">
              <div
                className="relative rounded-full overflow-hidden flex-shrink-0"
                style={{
                  width: 88, height: 88,
                  border: `3px solid ${c.borderColor ?? 'rgba(255,255,255,0.3)'}`,
                  boxShadow: `0 0 0 3px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.5)`,
                  background: isInitials ? 'rgba(255,255,255,0.08)' : undefined,
                }}
              >
                <img
                  src={c.image}
                  alt={c.title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* name + location */}
              <div className="text-center">
                <h3 className="m-0 text-white text-[1.1rem] font-bold leading-tight tracking-tight">{c.title}</h3>
                {c.location && (
                  <p className="m-0 mt-0.5 text-white/60 text-[0.78rem] flex items-center justify-center gap-1">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg>
                    {c.location}
                  </p>
                )}
              </div>

              {/* bio */}
              {bio && (
                <p className="m-0 text-white/70 text-[0.8rem] text-center leading-relaxed line-clamp-2">{bio}</p>
              )}

              {/* social chips */}
              {(instagram || whatsapp) && (
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {instagram && (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.72rem] font-semibold"
                      style={{ background: 'rgba(225,48,108,0.18)', color: '#f687b3', border: '1px solid rgba(225,48,108,0.3)' }}>
                      <SiInstagram size={11} />
                      @{instagram.replace(/^@/, '')}
                    </span>
                  )}
                  {whatsapp && (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.72rem] font-semibold"
                      style={{ background: 'rgba(37,211,102,0.18)', color: '#4ade80', border: '1px solid rgba(37,211,102,0.3)' }}>
                      <SiWhatsapp size={11} />
                      {whatsapp.replace(/\D/g, '')}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* footer — rating + ver perfil */}
            <footer className="relative z-10 mt-auto px-5 py-3 flex items-center justify-between"
              style={{ borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.25)' }}>
              {rating != null ? (
                <span className="text-yellow-300 font-semibold text-[0.8rem]">⭐ {rating.toFixed(1)}</span>
              ) : (
                <span />
              )}
              <span className="text-white/60 text-[0.75rem] font-medium flex items-center gap-1">
                Ver perfil
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </span>
            </footer>
          </article>
        );
      })}

      {/* hover mask — highlights hovered card, grays out others */}
      <div
        className="absolute inset-0 pointer-events-none z-30"
        style={{
          backdropFilter: 'grayscale(1) brightness(0.78)',
          WebkitBackdropFilter: 'grayscale(1) brightness(0.78)',
          background: 'rgba(0,0,0,0.001)',
          maskImage:
            'radial-gradient(circle var(--r) at var(--x) var(--y),transparent 0%,transparent 15%,rgba(0,0,0,0.10) 30%,rgba(0,0,0,0.22) 45%,rgba(0,0,0,0.35) 60%,rgba(0,0,0,0.50) 75%,rgba(0,0,0,0.68) 88%,white 100%)',
          WebkitMaskImage:
            'radial-gradient(circle var(--r) at var(--x) var(--y),transparent 0%,transparent 15%,rgba(0,0,0,0.10) 30%,rgba(0,0,0,0.22) 45%,rgba(0,0,0,0.35) 60%,rgba(0,0,0,0.50) 75%,rgba(0,0,0,0.68) 88%,white 100%)',
        }}
      />

      {/* fade overlay — shown when mouse is outside */}
      <div
        ref={fadeRef}
        className="absolute inset-0 pointer-events-none z-40"
        style={{
          backdropFilter: 'grayscale(1) brightness(0.78)',
          WebkitBackdropFilter: 'grayscale(1) brightness(0.78)',
          background: 'rgba(0,0,0,0.001)',
          maskImage:
            'radial-gradient(circle var(--r) at var(--x) var(--y),white 0%,white 15%,rgba(255,255,255,0.90) 30%,rgba(255,255,255,0.78) 45%,rgba(255,255,255,0.65) 60%,rgba(255,255,255,0.50) 75%,rgba(255,255,255,0.32) 88%,transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(circle var(--r) at var(--x) var(--y),white 0%,white 15%,rgba(255,255,255,0.90) 30%,rgba(255,255,255,0.78) 45%,rgba(255,255,255,0.65) 60%,rgba(255,255,255,0.50) 75%,rgba(255,255,255,0.32) 88%,transparent 100%)',
          opacity: 1,
          transition: 'opacity 250ms',
        }}
      />
    </div>
  );
};

export default ChromaGrid;
