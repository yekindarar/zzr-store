import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import styles from './Checkout.module.css';

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => { setVisible(true); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    clearCart();
    setTimeout(() => navigate('/'), 3000);
  };

  if (items.length === 0 && !submitted) {
    navigate('/cart');
    return null;
  }

  if (submitted) {
    return (
      <div className={`${styles.page} ${visible ? styles.visible : ''}`}>
        <div className="container">
          <div className={styles.success}>
            <div className={styles.successIcon}>✓</div>
            <h2>订单已提交</h2>
            <p>感谢您的购买！我们将尽快处理您的订单。</p>
            <p className={styles.redirect}>即将返回首页...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.page} ${visible ? styles.visible : ''}`}>
      <div className="container">
        <h1 className={styles.title}>结算</h1>

        <form className={styles.layout} onSubmit={handleSubmit}>
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>收货信息</h2>
            <div className={styles.fieldGroup}>
              <div className={styles.field}>
                <label>姓名</label>
                <input type="text" required placeholder="请输入姓名" />
              </div>
              <div className={styles.field}>
                <label>电话</label>
                <input type="tel" required placeholder="请输入电话号码" />
              </div>
            </div>
            <div className={styles.field}>
              <label>地址</label>
              <input type="text" required placeholder="请输入详细地址" />
            </div>

            <h2 className={styles.sectionTitle} style={{ marginTop: 40 }}>支付方式</h2>
            <div className={styles.paymentOptions}>
              <label className={styles.paymentOption}>
                <input type="radio" name="payment" defaultChecked />
                <span>微信支付</span>
              </label>
              <label className={styles.paymentOption}>
                <input type="radio" name="payment" />
                <span>支付宝</span>
              </label>
              <label className={styles.paymentOption}>
                <input type="radio" name="payment" />
                <span>银行卡</span>
              </label>
            </div>
          </div>

          <div className={styles.orderSummary}>
            <h3 className={styles.orderTitle}>订单摘要</h3>
            {items.map((item) => (
              <div key={`${item.product.id}-${item.color}`} className={styles.orderItem}>
                <span className={styles.orderItemName}>
                  {item.product.name} × {item.quantity}
                </span>
                <span>¥{item.product.price * item.quantity}</span>
              </div>
            ))}
            <div className={styles.orderTotal}>
              <span>合计</span>
              <span className={styles.totalPrice}>¥{totalPrice}</span>
            </div>
            <button type="submit" className={styles.submitBtn}>
              提交订单
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
