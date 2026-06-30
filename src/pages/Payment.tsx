import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { useCart } from '../context/CartContext';
import styles from './Payment.module.css';

export default function Payment() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { mockPay } = useOrders();
  const { clearCart } = useCart();

  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  // 从 location state 获取订单信息
  const orderInfo = (location.state as any) || {};
  const total = orderInfo.total || 0;
  const items = orderInfo.items || [];

  // 用户确认已付款
  const handleConfirmPay = async () => {
    if (!orderId) return;
    setPaying(true);
    setError('');
    try {
      await mockPay(orderId);
      clearCart();
      setPaid(true);
    } catch (e: any) {
      setError(e.message || '操作失败，请重试');
    } finally {
      setPaying(false);
    }
  };

  // 支付成功倒计时跳转
  useEffect(() => {
    if (!paid) return;
    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          navigate('/account', { replace: true });
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [paid, navigate]);

  if (paid) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.successIcon}>✓</div>
          <h2 className={styles.successTitle}>支付成功</h2>
          <p className={styles.successDesc}>
            我们已收到您的付款，正在处理订单。
          </p>
          <p className={styles.successDesc}>
            {countdown > 0
              ? `${countdown} 秒后自动跳转到订单页面`
              : '正在跳转...'}
          </p>
          <button
            className={styles.btn}
            onClick={() => navigate('/account', { replace: true })}
          >
            查看订单
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>扫码付款</h2>

        {/* 订单摘要 */}
        <div className={styles.orderSummary}>
          <div className={styles.orderId}>订单号：{orderId}</div>
          <div className={styles.itemCount}>
            共 {items.reduce((s: number, i: any) => s + (i.quantity || 1), 0)} 件商品
          </div>
          <div className={styles.total}>
            应付金额：<span className={styles.totalAmount}>¥{total.toFixed(2)}</span>
          </div>
        </div>

        {/* 收款码 */}
        <div className={styles.qrcodeArea}>
          <p className={styles.qrcodeLabel}>
            请使用微信或支付宝扫描下方二维码付款
          </p>
          <div className={styles.qrcodeWrapper}>
            <img
              src="/zzr-store/images/payment-qr.jpg"
              alt="收款二维码"
              className={styles.qrcode}
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.src = '/zzr-store/images/payment-qr.svg';
              }}
            />
          </div>
          <p className={styles.qrcodeHint}>
            付款时请备注订单号 <strong>{orderId}</strong>，方便核对
          </p>
        </div>

        {/* 确认已付款 */}
        <div className={styles.confirmArea}>
          <p className={styles.confirmHint}>
            扫码付款后，请点击下方按钮确认
          </p>
          <button
            className={styles.payBtn}
            onClick={handleConfirmPay}
            disabled={paying}
          >
            {paying ? '处理中...' : `我已付款 ¥${total.toFixed(2)}`}
          </button>
          <p className={styles.confirmNote}>
            点击后订单将标记为「已付款」，我们会尽快为您发货
          </p>
        </div>

        {/* 错误提示 */}
        {error && <div className={styles.error}>{error}</div>}

        {/* 返回按钮 */}
        <button
          className={styles.backBtn}
          onClick={() => navigate(-1)}
        >
          返回
        </button>
      </div>
    </div>
  );
}
