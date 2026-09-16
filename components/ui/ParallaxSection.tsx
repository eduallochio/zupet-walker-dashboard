'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface ParallaxSectionProps {
  children: React.ReactNode;
  className?: string;
  speed?: number; // 0.1 = lento, 0.3 = médio
  style?: React.CSSProperties;
}

export function ParallaxSection({ children, className, speed = 0.15, style }: ParallaxSectionProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.fromTo(innerRef.current,
        { y: speed * 80 },
        {
          y: -speed * 80,
          ease: 'none',
          scrollTrigger: {
            trigger: wrapRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );
    }, wrapRef);

    return () => ctx.revert();
  }, [speed]);

  return (
    <div ref={wrapRef} className={className} style={{ overflow: 'hidden', ...style }}>
      <div ref={innerRef}>
        {children}
      </div>
    </div>
  );
}
