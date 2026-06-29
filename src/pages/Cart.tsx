import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import styles from './Cart.module.css';

export default function Cart() {
  const { items, updateQuantity, removeItem, totalPrice } = useCart();
  const [visible, setVisible] = useState(false);
  useEffect(() => { setVisible(true); }, []);

  if (items.length === 0) {
    return (
      <div className={`${styles.page} ${visible ? styles.visible : ''}`}>
        <div className="container">
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
            </div>
            <h2>购物车是空的</h2>
            <p>去看看有什么好东西吧</p>
            <Link to="/products" className={styles.shopBtn}>去逛逛</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.page} ${visible ? styles.visible : ''}`}>
      <div className="container">
        <h1 className={styles.title}>购物车</h1>

        <div className={styles.layout}>
          <div className={styles.items}>
            {items.map((item) => (
              <div key={`${item.product.id}-${item.color}`} className={styles.item}>
                <div className={styles.itemImage}>
                  <img src={item.product.image} alt={item.product.name} />
                </div>
                <div className={styles.itemInfo}>
                  <h3 className={styles.itemName}>{item.product.name}</h3>
                  <span className={styles.itemColor} style={{ background: item.color }} />
                  <span className={styles.itemPrice}>¥{item.product.price}</span>
                </div>
                <div className={styles.itemActions}>
                  <div className={styles.qty}>
                    <button onClick={() => updateQuantity(item.product.id, item.color, -1)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.color, 1)}>+</button>
                  </div>
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeItem(item.product.id, item.color)}
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.summary}>
            <h3 className={styles.summaryTitle}>订单摘要</h3>
            <div className={styles.summaryRow}>
              <span>商品数量</span>
              <span>{items.reduce((s, i) => s + i.quantity, 0)} 件</span>
            </div>
            <div className={styles.summaryRow}>
              <span>小计</span>
              <span className={styles.summaryTotal}>¥{totalPrice}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>运费</span>
              <span className={styles.free}>免运费</span>
            </div>
            <Link to="/checkout" className={styles.checkoutBtn}>
              去结算
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
