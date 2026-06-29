import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminApi } from '../api';
import { useCart } from '../context/CartContext';
import styles from './ProductDetail.module.css';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const [visible, setVisible] = useState(false);
  const [selectedColor, setSelectedColor] = useState('');
  const [added, setAdded] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setVisible(true);
    (async () => {
      try {
        const data = await adminApi.getProducts();
        const found = data.products.find((p: any) => p.id === id);
        setProduct(found);
        if (found?.colors?.length) setSelectedColor(found.colors[0]);
      } catch {}
      setLoading(false);
    })();
  }, [id]);

  const handleAdd = () => {
    if (!product) return;
    addItem(product, selectedColor);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className={`${styles.page} ${visible ? styles.visible : ''}`}>
        <div className="container">
          <p style={{ textAlign: 'center', padding: 100, color: 'var(--text-secondary)', fontSize: 13 }}>加载中...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={`${styles.page} ${visible ? styles.visible : ''}`}>
        <div className="container">
          <div className={styles.notFound}>
            <h2>商品不存在</h2>
            <Link to="/products" className={styles.backLink}>返回全部商品</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.page} ${visible ? styles.visible : ''}`}>
      <div className="container">
        <Link to="/products" className={styles.backLink}>← 全部商品</Link>

        <div className={styles.layout}>
          <div className={styles.imageSection}>
            <div className={styles.imageWrap}>
              <img src={product.image} alt={product.name} />
            </div>
          </div>

          <div className={styles.infoSection}>
            <span className={styles.brand}>{product.brand}</span>
            <h1 className={styles.name}>{product.name}</h1>
            <p className={styles.price}>¥{product.price}</p>
            <p className={styles.desc}>{product.description}</p>

            {product.colors?.length > 0 && (
              <div className={styles.colors}>
                <span className={styles.colorLabel}>颜色</span>
                <div className={styles.colorOptions}>
                  {product.colors.map((color: string) => (
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
            )}

            {product.features?.length > 0 && (
              <div className={styles.features}>
                <span className={styles.featureLabel}>特点</span>
                <ul>
                  {product.features.map((f: string, i: number) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              className={`${styles.addBtn} ${added ? styles.added : ''}`}
              onClick={handleAdd}
            >
              {added ? '已加入 ✓' : '加入购物车'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
