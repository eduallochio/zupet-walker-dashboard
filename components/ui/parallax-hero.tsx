'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface ParallaxHeroProps {
  photoUrl: string;
  photoPosition?: string;
}

export function ParallaxHero({ photoUrl, photoPosition = 'center 40%' }: ParallaxHeroProps) {
  const wrapRef  = useRef<HTMLDivElement>(null);
  const bgRef    = useRef<HTMLDivElement>(null);
  const textRef  = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Animação de entrada: palavras do h1 sobem com stagger
      gsap.to('.hero-word', {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.08,
        delay: 0.15,
      });
      // Eyebrow, subtítulo e botões aparecem após as palavras
      gsap.to('.hero-fade-in', {
        opacity: 1,
        duration: 0.7,
        ease: 'power2.out',
        stagger: 0.15,
        delay: 0.55,
      });


      // photo moves at 40% of scroll speed → parallax depth
      gsap.to(bgRef.current, {
        yPercent: 22,
        ease: 'none',
        scrollTrigger: {
          trigger: wrapRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0,
        },
      });

      // text drifts up slightly faster than scroll
      gsap.to(textRef.current, {
        yPercent: -18,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: wrapRef.current,
          start: 'top top',
          end: '60% top',
          scrub: 0,
        },
      });

      // stats fade out later
      if (statsRef.current) {
        gsap.to(statsRef.current, {
          yPercent: -10,
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: wrapRef.current,
            start: '30% top',
            end: '70% top',
            scrub: 0,
          },
        });
      }
    }, wrapRef);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  const lines = ['Transforme seu amor', 'por pets em'];
  const lastWord = 'profissão.';

  return (
    <div ref={wrapRef} className="parallax-hero-wrap">
      {/* photo layer — oversized to allow parallax travel */}
      <div ref={bgRef} className="parallax-hero-bg" style={{ backgroundImage: `url(${photoUrl})`, backgroundPosition: photoPosition }} />

      {/* overlays */}
      <div className="parallax-hero-overlay-top" />
      <div className="parallax-hero-overlay-bottom" />
      <div className="parallax-hero-overlay-tint" />

      {/* content */}
      <div className="parallax-hero-content">
        <div ref={textRef} className="parallax-hero-text">
          <div className="parallax-eyebrow hero-fade-in" style={{ opacity: 0 }}>
            <span className="parallax-eyebrow-line" />
            Para passeadores profissionais
          </div>
          <h1 className="parallax-h1" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            {lines.map((line, i) => (
              <span
                key={i}
                className="hero-word"
                style={{ display: 'block', opacity: 0, transform: 'translateY(40px)' }}
              >
                {line}
              </span>
            ))}
            <em
              className="hero-word"
              style={{ display: 'block', opacity: 0, transform: 'translateY(40px)' }}
            >
              {lastWord}
            </em>
          </h1>
          <p className="parallax-sub hero-fade-in" style={{ opacity: 0 }}>
            Registro de rota por GPS, relatórios com fotos e controle financeiro — tudo no app que os melhores walkers usam para crescer.
          </p>
          <div className="parallax-actions hero-fade-in" style={{ opacity: 0 }}>
            <a href="/login" className="parallax-btn-p">Acessar minha conta</a>
            <a href="#recursos" className="parallax-btn-o">Conhecer o app</a>
          </div>
        </div>

        <div ref={statsRef} className="parallax-stats">
          {[
            { n: 'GPS',      l: 'Rota em tempo real' },
            { n: 'Fotos',    l: 'Relatório automático' },
            { n: 'Agenda',   l: 'Gestão de agendamentos' },
          ].map((s) => (
            <div key={s.l} className="parallax-stat">
              <div className="parallax-stat-n">{s.n}</div>
              <div className="parallax-stat-l">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* scroll indicator */}
      <div className="parallax-scroll-hint">
        <span className="parallax-scroll-label">Explorar</span>
        <div className="parallax-scroll-line" />
      </div>

    </div>
  );
}
