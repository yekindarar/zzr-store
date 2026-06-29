import { useEffect, useState } from 'react';
import styles from './Splash.module.css';

export default function Splash({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 60);
    const t2 = setTimeout(() => setPhase(2), 280);
    const t3 = setTimeout(() => setPhase(3), 700);
    const t4 = setTimeout(() => setPhase(4), 1200);
    const t5 = setTimeout(() => setPhase(5), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
  }, []);

  const handleEnter = () => onDone();

  return (
    <div className={styles.splash}>
      <div className={`${styles.bgGlow} ${phase >= 5 ? styles.bgFade : ''}`} />

      <div className={styles.content}>
        {/* ◆ — 快速弹入 */}
        <div className={`${styles.mark} ${phase >= 1 ? styles.markIn : ''}`}>◆</div>

        {/* Logo + 标题 — 带先后错落的弹性入场 */}
        <div className={`${styles.logoWrap} ${phase >= 2 ? styles.logoWrapIn : ''}`}>
          <div className={styles.logoMark}>
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 26 L46 26 L18 38 L46 38" stroke="#c0a060" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </div>
        </div>

        <h1 className={styles.title}>
          <span className={`${styles.char} ${phase >= 2 ? styles.charIn : ''}`}>Z</span>
          <span className={`${styles.char} ${phase >= 2 ? styles.charIn : ''}`} style={{ animationDelay: '0.12s' }}>Z</span>
          <span className={`${styles.char} ${phase >= 2 ? styles.charIn : ''}`} style={{ animationDelay: '0.24s' }}>R</span>
        </h1>

        {/* 副标题 + 分割线 — 同时出现 */}
        <div className={`${styles.subGroup} ${phase >= 3 ? styles.subGroupIn : ''}`}>
          <p className={styles.subtitle}>
            严肃 · 电竞 · 精确
          </p>
          <div className={styles.line} />
        </div>

        {/* 按钮 — 最后淡入 */}
        <button
          className={`${styles.enterBtn} ${phase >= 4 ? styles.enterVisible : ''}`}
          onClick={handleEnter}
        >
          进入商店
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
