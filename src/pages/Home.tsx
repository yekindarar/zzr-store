import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { products } from '../data/products';
import styles from './Home.module.css';

export default function Home() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setVisible(true); }, []);

  const featured = products;

  return (
    <div className={`${styles.page} ${visible ? styles.visible : ''}`}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroContent}>
            <span className={styles.heroTag}>全新系列</span>
            <h1 className={styles.heroTitle}>
              精准操控<br />
              <span className={styles.heroAccent}>重新定义</span>
            </h1>
            <p className={styles.heroDesc}>
              从鼠标到鼠标垫，每一处细节都为性能而生。
            </p>
            <Link to="/products" className={styles.heroBtn}>
              探索全部产品
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.heroLogo}>
              <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 26 L46 26 L18 38 L46 38" stroke="#c0a060" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className={styles.categories}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>产品系列</h2>
            <p className={styles.sectionDesc}>精选材质，精密工艺</p>
          </div>
          <div className={styles.categoryGrid}>
            <Link to="/products?category=mouse" className={styles.categoryCard}>
              <div className={styles.categoryIcon}>
                <svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="20" y="10" width="80" height="120" rx="40" stroke="currentColor" strokeWidth="1.5"/>
                  <line x1="60" y1="10" x2="60" y2="45" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </div>
              <h3>鼠标</h3>
              <p>轻量化设计，精准追踪</p>
            </Link>
            <Link to="/products?category=mousepad" className={styles.categoryCard}>
              <div className={styles.categoryIcon}>
                <svg viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="10" y="15" width="140" height="70" rx="6" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </div>
              <h3>鼠标垫</h3>
              <p>多种表面，适配不同风格</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className={styles.featured}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>精选产品</h2>
            <p className={styles.sectionDesc}>畅销之选</p>
          </div>
          <div className={styles.productGrid}>
            {featured.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className={styles.productCard}
              >
                <div className={styles.productImage}>
                  <img src={product.image} alt={product.name} />
                </div>
                <div className={styles.productInfo}>
                  <span className={styles.productBrand}>{product.brand}</span>
                  <h3 className={styles.productName}>{product.name}</h3>
                  <span className={styles.productPrice}>
                    ¥{product.price}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className={styles.philosophy}>
        <div className="container">
          <div className={styles.philInner}>
            <div className={styles.philLine} />
            <h2 className={styles.philTitle}>
              为每一次操作而生
            </h2>
            <p className={styles.philText}>
              我们相信，工具应当消失在手感中。从鼠标的曲线到鼠标垫的表面纹理，
              每一个决定都源于同一个信念：让操作成为本能。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
