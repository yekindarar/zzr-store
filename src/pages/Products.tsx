import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { products, type Product } from '../data/products';
import styles from './Products.module.css';

export default function Products() {
  const [visible, setVisible] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtered, setFiltered] = useState<Product[]>(products);
  const [search, setSearch] = useState('');

  const activeCategory = searchParams.get('category') || 'all';

  useEffect(() => { setVisible(true); }, []);

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
          p.brand.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [activeCategory, search]);

  const setCategory = (cat: string) => {
    const params = new URLSearchParams(searchParams);
    if (cat === 'all') {
      params.delete('category');
    } else {
      params.set('category', cat);
    }
    setSearchParams(params);
  };

  return (
    <div className={`${styles.page} ${visible ? styles.visible : ''}`}>
      <div className="container">
        <div className={styles.header}>
          <h1 className={styles.title}>全部商品</h1>
          <p className={styles.desc}>
            {filtered.length} 件产品
          </p>
        </div>

        {/* Filters */}
        <div className={styles.filters}>
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
          <div className={styles.searchWrap}>
            <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="搜索产品..."
              className={styles.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Grid */}
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
                <p className={styles.cardDesc}>{product.description}</p>
                <span className={styles.cardPrice}>¥{product.price}</span>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className={styles.empty}>
            <p>没有找到匹配的产品</p>
          </div>
        )}
      </div>
    </div>
  );
}
