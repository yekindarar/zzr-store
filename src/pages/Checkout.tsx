import { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import styles from './Checkout.module.css';

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { createOrder } = useOrders();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [payment, setPayment] = useState('微信支付');
  const [payState, setPayState] = useState<{ total: number; items: any[] } | null>(null);

  useEffect(() => { setVisible(true); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      const id = await createOrder({
        items: items.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          color: item.color,
          image: item.product.image,
        })),
        total: totalPrice,
        shipping: { name, phone, address, city, zip },
        paymentMethod: payment,
      });

      // 先保存支付页需要的数据，再清空购物车
      setPayState({
        total: totalPrice,
        items: items.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          color: item.color,
          image: item.product.image,
        })),
      });
      setOrderId(id);
      setSubmitted(true);
      clearCart();
    } catch {
      alert('提交订单失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (items.length === 0 && !submitted) {
    return <Navigate to="/cart" replace />;
  }

  // 提交成功后跳转到支付页面（使用提前保存的数据，避免 clearCart 后丢失）
  useEffect(() => {
    if (submitted && orderId && payState) {
      navigate(`/payment/${orderId}`, {
        replace: true,
        state: payState,
      });
    }
  }, [submitted, orderId, payState]);

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
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="请输入姓名" />
              </div>
              <div className={styles.field}>
                <label>电话</label>
                <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="请输入电话号码" />
              </div>
            </div>
            <div className={styles.field}>
              <label>地址</label>
              <input type="text" required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="请输入详细地址" />
            </div>
            <div className={styles.fieldGroup}>
              <div className={styles.field}>
                <label>城市</label>
                <input type="text" required value={city} onChange={(e) => setCity(e.target.value)} placeholder="城市" />
              </div>
              <div className={styles.field}>
                <label>邮编</label>
                <input type="text" value={zip} onChange={(e) => setZip(e.target.value)} placeholder="选填" />
              </div>
            </div>

            <h2 className={styles.sectionTitle} style={{ marginTop: 40 }}>支付方式</h2>
            <div className={styles.paymentOptions}>
              {['微信支付', '支付宝', '银行卡'].map((p) => (
                <label key={p} className={styles.paymentOption}>
                  <input type="radio" name="payment" checked={payment === p} onChange={() => setPayment(p)} />
                  <span>{p}</span>
                </label>
              ))}
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
            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              {submitting ? '提交中...' : '提交订单'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
