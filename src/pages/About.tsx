import { useEffect, useState } from 'react';
import styles from './About.module.css';

export default function About() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setVisible(true); }, []);

  return (
    <div className={`${styles.page} ${visible ? styles.visible : ''}`}>
      <div className="container">
        <div className={styles.hero}>
          <span className={styles.mark}>◆</span>
          <h1 className={styles.title}>关于</h1>
          <div className={styles.line} />
          <p className={styles.subtitle}>
            为追求极致体验的用户而生
          </p>
        </div>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2>我们的理念</h2>
            <p>
              诞生于对「手感」的执念。我们相信，工具的最高境界是让人忘记它的存在。
              每一款鼠标的曲线、每一个鼠标垫的表面纹理，都经过无数次迭代，只为让操作回归本能。
            </p>
          </section>

          <section className={styles.section}>
            <h2>设计哲学</h2>
            <p>
              极简不是空无一物，而是每一笔都有意义。我们拒绝浮夸的装饰，
              专注于材质、比例和触感。从镁合金到碳纤维，从针织面料到钢化玻璃，
              每一种材料的选择都服务于一个目标：更好的体验。
            </p>
          </section>

          <section className={styles.section}>
            <h2>联系我们</h2>
            <p>
              如有任何问题或建议，欢迎与我们联系。
            </p>
            <div className={styles.contact}>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>邮箱</span>
                <span>hello@ether.com</span>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>地址</span>
                <span>中国 · 深圳</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
