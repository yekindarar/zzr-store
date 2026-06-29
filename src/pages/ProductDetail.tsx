import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import styles from './ProductDetail.module.css';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const [visible, setVisible] = useState(false);
  const [selectedColor, setSelectedColor] = useState('');
  const [added, setAdded] = useState(false);

  const product = products.find((p) => p.id === id);

  useEffect(() => { setVisible(true); window.scrollTo(0, 0); }, []);
  useEffect(() => {
    if (product) setSelectedColor(product.colors[0]);
  }, [product]);

  if (!product) {
    return (
      <div className={styles.notFound}>
        <h2>产品未找到</h2>
        <Link to="/products" className={styles.backLink}>返回商品列表</Link>
      </div>
    );
  }

  const handleAdd = () => {
    addItem(product, selectedColor);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const related = products.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 3);

  return (
    <div className={`${styles.page} ${visible ? styles.visible : ''}`}>
      <div className="container">
        <Link to="/products" className={styles.breadcrumb}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          返回全部商品
        </Link>

        <div className={styles.main}>
          <div className={styles.imageSection}>
            <div className={styles.imageWrap}>
              <img src={product.image} alt={product.name} />
            </div>
          </div>

          <div className={styles.infoSection}>
            <span className={styles.brand}>{product.brand}</span>
            <h1 className={styles.name}>{product.name}</h1>
            <p className={styles.description}>{product.description}</p>

            <div className={styles.price}>¥{product.price}</div>

            <div className={styles.colors}>
              <span className={styles.label}>颜色</span>
              <div className={styles.colorOptions}>
                {product.colors.map((color) => (
                  <button
                    key={color}
                    className={`${styles.colorBtn} ${selectedColor === color ? styles.colorActive : ''}`}
                    style={{ background: color }}
                    onClick={() => setSelectedColor(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <button
              className={`${styles.addBtn} ${added ? styles.added : ''}`}
              onClick={handleAdd}
            >
              {added ? '✓ 已加入购物车' : '加入购物车'}
            </button>

            <div className={styles.features}>
              <span className={styles.label}>产品特点</span>
              <ul>
                {product.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className={styles.related}>
            <h2 className={styles.relatedTitle}>相关推荐</h2>
            <div className={styles.relatedGrid}>
              {related.map((p) => (
                <Link key={p.id} to={`/product/${p.id}`} className={styles.relatedCard}>
                  <div className={styles.relatedImage}>
                    <img src={p.image} alt={p.name} />
                  </div>
                  <div className={styles.relatedInfo}>
                    <h3>{p.name}</h3>
                    <span>¥{p.price}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
