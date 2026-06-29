import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <span className={styles.mark}>◆</span>
          <span>ZZR</span>
        </div>
        <div className={styles.links}>
          <a href="#">隐私政策</a>
          <a href="#">服务条款</a>
          <a href="#">联系我们</a>
        </div>
        <p className={styles.copy}>© 2026 ZZR. All rights reserved.</p>
      </div>
    </footer>
  );
}
