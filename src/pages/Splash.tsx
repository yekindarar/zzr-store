import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import styles from './Splash.module.css';

export default function Splash({ onDone }: { onDone: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const mark = el.querySelector(`.${styles.mark}`);
    const logo = el.querySelector(`.${styles.logoWrap}`);
    const chars = el.querySelectorAll(`.${styles.char}`);
    const sub = el.querySelector(`.${styles.subGroup}`);
    const line = el.querySelector(`.${styles.line}`);
    const btn = el.querySelector(`.${styles.enterBtn}`);
    const glow = el.querySelector(`.${styles.bgGlow}`);

    // Reset to initial state first
    gsap.set([mark, logo, ...chars, sub, btn], { opacity: 0 });
    gsap.set(mark, { y: -8, scale: 0.6 });
    gsap.set(logo, { y: 16 });
    gsap.set(chars, { y: 40, scale: 0.8 });
    gsap.set(sub, { y: 12 });
    gsap.set(line, { width: 0, opacity: 0 });
    gsap.set(btn, { y: 16 });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Phase 1: ◆ mark — quick spring pop
    tl.to(mark, {
      opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.7)',
    });

    // Phase 2: logo + Z Z R letters — staggered elastic entrance
    tl.to(logo, { opacity: 1, y: 0, duration: 0.6 }, '-=0.1');

    tl.to(chars, {
      opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.1, ease: 'back.out(1.7)',
    }, '-=0.4');

    // Phase 3: subtitle + divider line
    tl.to(sub, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.1');
    tl.to(line, { width: 56, opacity: 1, duration: 0.6, ease: 'power3.out' }, '-=0.3');

    // Phase 4: button — fade + slide up
    tl.to(btn, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.2');

    // Glow fade — starts after button appears, 5s fade
    tl.to(glow, { opacity: 0, duration: 5, ease: 'power2.inOut' }, '+=4.5');

    return () => { tl.kill(); };
  }, []);

  return (
    <div className={styles.splash} ref={containerRef}>
      <div className={styles.bgGlow} />

      <div className={styles.content}>
        <div className={styles.mark}>◆</div>

        <div className={styles.logoWrap}>
          <div className={styles.logoMark}>
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 26 L46 26 L18 38 L46 38" stroke="#c0a060" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </div>
        </div>

        <h1 className={styles.title}>
          <span className={styles.char}>Z</span>
          <span className={styles.char}>Z</span>
          <span className={styles.char}>R</span>
        </h1>

        <div className={styles.subGroup}>
          <p className={styles.subtitle}>严肃 · 电竞 · 精确</p>
          <div className={styles.line} />
        </div>

        <button className={styles.enterBtn} onClick={onDone}>
          进入商店
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
