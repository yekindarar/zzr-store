import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import styles from './Payment.module.css';

export default function Payment() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { payOrder, mockPay, getOrderStatus } = useOrders();

  const [payType, setPayType] = useState<'mock' | 'yungouos'>('mock');
  const [qrcode, setQrcode] = useState('');
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  // 从 location state 获取订单信息
  const orderInfo = (location.state as any) || {};
  const total = orderInfo.total || 0;
  const items = orderInfo.items || [];

  // 发起支付
  const initPay = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    setError('');
    try {
      const result = await payOrder(orderId);
      setPayType(result.pay_type as 'mock' | 'yungouos');
      if (result.qrcode) {
        setQrcode(result.qrcode);
      }
    } catch (e: any) {
      setError(e.message || '支付发起失败');
    } finally {
      setLoading(false);
    }
  }, [orderId, payOrder]);

  useEffect(() => {
    initPay();
  }, [initPay]);

  // 模拟支付倒计时
  useEffect(() => {
    if (payType !== 'mock' || paid) return;
    // 自动弹出一个"确认支付"按钮，用户点击后调用 mockPay
  }, [payType, paid]);

  // 轮询订单状态（YunGouOS 模式用）
  useEffect(() => {
    if (payType !== 'yungouos' || paid || !orderId) return;

    const interval = setInterval(async () => {
      try {
        const result = await getOrderStatus(orderId!);
        if (result.status === 'paid') {
          setPaid(true);
          clearInterval(interval);
        }
      } catch {
        // ignore
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [payType, paid, orderId, getOrderStatus]);

  // 模拟支付：确认支付
  const handleMockPay = async () => {
    if (!orderId) return;
    setPaying(true);
    setError('');
    try {
      await mockPay(orderId);
      setPaid(true);
    } catch (e: any) {
      setError(e.message || '支付失败');
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

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.loading}>正在发起支付...</div>
        </div>
      </div>
    );
  }

  if (paid) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.successIcon}>✓</div>
          <h2 className={styles.successTitle}>支付成功</h2>
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
        <h2 className={styles.title}>确认支付</h2>

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

        {/* 支付方式标签 */}
        <div className={styles.payTypeTag}>
          {payType === 'yungouos' ? '微信支付 / 支付宝' : '模拟支付'}
        </div>

        {/* YunGouOS 二维码 */}
        {payType === 'yungouos' && qrcode && (
          <div className={styles.qrcodeArea}>
            <div className={styles.qrcodeLabel}>请使用微信或支付宝扫码支付</div>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrcode)}`}
              alt="支付二维码"
              className={styles.qrcode}
            />
            <div className={styles.qrcodeHint}>
              支付成功后自动跳转，请勿关闭页面
            </div>
          </div>
        )}

        {/* YunGouOS 无二维码 */}
        {payType === 'yungouos' && !qrcode && (
          <div className={styles.qrcodeArea}>
            <div className={styles.qrcodeLabel}>正在获取支付二维码...</div>
            <div className={styles.qrcodePlaceholder}>
              <div className={styles.spinner}></div>
            </div>
          </div>
        )}

        {/* 模拟支付按钮 */}
        {payType === 'mock' && (
          <div className={styles.mockArea}>
            <p className={styles.mockHint}>
              模拟支付模式，点击下方按钮完成支付
            </p>
            <button
              className={styles.payBtn}
              onClick={handleMockPay}
              disabled={paying}
            >
              {paying ? '处理中...' : `确认支付 ¥${total.toFixed(2)}`}
            </button>
          </div>
        )}

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
