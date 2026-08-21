'use client';
import { useEffect, useRef } from 'react';

export function ScrollNav() {
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const nav = document.querySelector('.lp-nav') as HTMLElement | null;
    if (!nav) return;
    navRef.current = nav;

    const onScroll = () => {
      if (window.scrollY > 60) {
        nav.classList.add('lp-nav--scrolled');
      } else {
        nav.classList.remove('lp-nav--scrolled');
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return null;
}
