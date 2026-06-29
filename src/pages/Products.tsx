import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { adminApi } from '../api';
import type { Product } from '../data/products';
import styles from './Products.module.css';

export default function Products() {
  const [visible, setVisible] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const activeCategory = searchParams.get('category') || 'all';

  useEffect(() => {
    setVisible(true);
    (async () => {
      try {
        const data = await adminApi.getProducts();
        setProducts(data.products);
        setFiltered(data.products);
      } catch {}
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    let result = products;
    if (activeCategory !== 'all') {
      result = result.filter((p) => p.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.brand || '').toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [activeCategory, search, products]);

  const setCategory = (cat: string) => {
    if (cat === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category: cat });
    }
  };

  return (
    <div className={`${styles.page} ${visible ? styles.visible : ''}`}>
      <div className="container">
        <h1 className={styles.title}>全部商品</h1>

        <div className={styles.toolbar}>
          <div className={styles.categories}>
            {[
              { key: 'all', label: '全部' },
              { key: 'mouse', label: '鼠标' },
              { key: 'mousepad', label: '鼠标垫' },
            ].map((cat) => (
              <button
                key={cat.key}
                className={`${styles.catBtn} ${activeCategory === cat.key ? styles.catActive : ''}`}
                onClick={() => setCategory(cat.key)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className={styles.search}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="搜索商品..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading && <p style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)', fontSize: 13 }}>加载中...</p>}

        {!loading && (
          <div className={styles.grid}>
            {filtered.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className={styles.card}
              >
                <div className={styles.cardImage}>
                  <img src={product.image} alt={product.name} />
                </div>
                <div className={styles.cardInfo}>
                  <span className={styles.cardBrand}>{product.brand}</span>
                  <h3 className={styles.cardName}>{product.name}</h3>
                  <span className={styles.cardPrice}>¥{product.price}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <p className={styles.empty}>没有找到匹配的商品</p>
        )}
      </div>
    </div>
  );
}
