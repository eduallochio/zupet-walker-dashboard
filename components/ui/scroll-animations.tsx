'use client';
import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function ScrollAnimations() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const sections = document.querySelectorAll<HTMLElement>(
      '.lp-features, .lp-how, .wk-section, .lp-plans, .lp-download, .lp-faq'
    );

    sections.forEach((section) => {
      // fade-in the section label + title
      const label = section.querySelector('.lp-section-label, .lp-plans-title, .lp-download-title');
      const title = section.querySelector('.lp-section-title');
      const targets = [label, title].filter(Boolean);

      if (targets.length) {
        gsap.fromTo(targets, { opacity: 0, y: 24 }, {
          opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.1,
          scrollTrigger: { trigger: section, start: 'top 82%', once: true },
        });
      }

      // stagger children: cards, steps, FAQ items, plan rows
      const children = section.querySelectorAll<HTMLElement>(
        '.lp-feat-card, .lp-how-step, .lp-faq-item, .lp-plan-row, .wk-card, .lp-badge, .lp-pro-check'
      );
      if (children.length) {
        gsap.fromTo(children, { opacity: 0, y: 32 }, {
          opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.07,
          scrollTrigger: { trigger: section, start: 'top 78%', once: true },
        });
      }
    });

    // ChromaGrid section — fade the whole wrap
    const chromaWrap = document.querySelector('.wk-chroma-wrap');
    if (chromaWrap) {
      gsap.fromTo(chromaWrap, { opacity: 0, y: 28 }, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
        scrollTrigger: { trigger: chromaWrap, start: 'top 80%', once: true },
      });
    }

    return () => ScrollTrigger.getAll().forEach((st) => st.kill());
  }, []);

  return null;
}
