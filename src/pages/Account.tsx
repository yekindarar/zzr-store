import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import styles from './Account.module.css';

const statusLabels: Record<string, string> = {
  pending: '待付款', paid: '已付款', shipped: '已发货',
  shipping: '运输中', delivered: '已送达', cancelled: '已取消',
};

const statusStyles: Record<string, string> = {
  pending: styles.statusPending, paid: styles.statusPaid,
  shipped: styles.statusShipped, shipping: styles.statusShipping,
  delivered: styles.statusDelivered, cancelled: styles.statusCancelled,
};

const statusDesc: Record<string, string> = {
  pending: '订单已创建，等待付款',
  paid: '已付款，等待商家发货',
  shipped: '已发货，等待揽收',
  shipping: '商品正在运输中',
  delivered: '已确认收货',
  cancelled: '订单已取消',
};

export default function Account() {
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuth();
  const { orders, loading, refreshOrders, confirmDelivery } = useOrders();
  const [tab, setTab] = useState<'profile' | 'orders'>('profile');
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saved, setSaved] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useEffect(() => { refreshOrders(); }, []);

  if (!user) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <div className={styles.empty}>
            <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 10-16 0"/>
            </svg>
            <p>请先登录</p>
            <button className={styles.saveBtn} onClick={() => navigate('/login')} style={{ margin: '16px auto 0' }}>
              前往登录
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    await updateProfile({ name, phone });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleConfirmDelivery = async (orderId: string) => {
    setConfirmingId(orderId);
    try {
      await confirmDelivery(orderId);
    } finally {
      setConfirmingId(null);
    }
  };

  // Progress steps for visual indicator
  const progressSteps = ['pending', 'paid', 'shipped', 'shipping', 'delivered'];

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h1 className={styles.title}>我的账号</h1>
          <p className={styles.subtitle}>{user.email}</p>
        </div>

        <div className={styles.grid}>
          <div className={styles.sidebar}>
            <button className={`${styles.sideBtn} ${tab === 'profile' ? styles.sideActive : ''}`} onClick={() => setTab('profile')}>个人信息</button>
            <button className={`${styles.sideBtn} ${tab === 'orders' ? styles.sideActive : ''}`} onClick={() => setTab('orders')}>我的订单 ({orders.length})</button>
            <button className={styles.logoutBtn} onClick={handleLogout}>退出登录</button>
          </div>

          <div className={styles.content}>
            {tab === 'profile' && (
              <div className={styles.form}>
                <div className={styles.field}><label>用户名</label><input value={name} onChange={(e) => setName(e.target.value)} /></div>
                <div className={styles.field}><label>邮箱</label><input value={user.email} disabled style={{ opacity: 0.5 }} /></div>
                <div className={styles.field}><label>手机号</label><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="选填" /></div>
                <button className={styles.saveBtn} onClick={handleSave}>{saved ? '已保存 ✓' : '保存'}</button>
              </div>
            )}

            {tab === 'orders' && (
              <div>
                {loading && <p style={{ color: 'var(--text-secondary)', fontSize: 13, padding: 20 }}>加载中...</p>}
                {!loading && orders.length === 0 && (
                  <div className={styles.empty}><p>暂无订单</p></div>
                )}
                {orders.map((order: any) => {
                  const stepIdx = progressSteps.indexOf(order.status);
                  return (
                    <div key={order.id} className={styles.orderCard}>
                      <div className={styles.orderHeader}>
                        <div>
                          <span className={styles.orderId}>{order.id}</span>
                          <span style={{ marginLeft: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
                            {new Date(order.created_at).toLocaleDateString('zh-CN')}
                          </span>
                        </div>
                        <span className={`${styles.orderStatus} ${statusStyles[order.status]}`}>
                          {statusLabels[order.status]}
                        </span>
                      </div>

                      {/* Progress bar */}
                      {order.status !== 'cancelled' && (
                        <div className={styles.orderProgress}>
                          {progressSteps.map((step, i) => {
                            const isActive = i <= stepIdx;
                            const isCurrent = i === stepIdx;
                            return (
                              <div key={step} className={styles.orderStep}>
                                <div className={`${styles.stepDot} ${isActive ? styles.stepDotActive : ''} ${isCurrent ? styles.stepDotCurrent : ''}`}>
                                  {isActive && !isCurrent && '✓'}
                                </div>
                                <span className={`${styles.stepLabel} ${isActive ? styles.stepLabelActive : ''}`}>
                                  {statusLabels[step]}
                                </span>
                                {i < progressSteps.length - 1 && (
                                  <div className={`${styles.stepLine} ${i < stepIdx ? styles.stepLineActive : ''}`} />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Status description */}
                      <p className={styles.orderStatusDesc}>{statusDesc[order.status]}</p>

                      {/* Tracking number (for shipped/delivered) */}
                      {order.tracking_number && (
                        <div className={styles.orderTracking}>
                          <span className={styles.trackingLabel}>快递单号</span>
                          <span className={styles.trackingValue}>{order.tracking_number}</span>
                        </div>
                      )}

                      <div className={styles.orderItems}>
                        {order.items.map((item: any, i: number) => (
                          <div key={i} className={styles.orderItem}>
                            <div className={styles.orderItemInfo}>
                              <span className={styles.orderItemName}>{item.productName}</span>
                              {item.color && (
                                <span className={styles.orderItemColor}>
                                  <span className={styles.miniColorDot} style={{ background: item.color }} />
                                </span>
                              )}
                            </div>
                            <span className={styles.orderItemMeta}>x{item.quantity} · ¥{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <div className={styles.orderShipping}>
                        {order.shipping?.name} · {order.shipping?.phone} · {order.shipping?.address}
                      </div>

                      <div className={styles.orderTotal}>合计 ¥{order.total}</div>

                      {/* Confirm delivery button — shown during shipping */}
                      {order.status === 'shipping' && (
                        <button
                          className={styles.confirmBtn}
                          onClick={() => handleConfirmDelivery(order.id)}
                          disabled={confirmingId === order.id}
                        >
                          {confirmingId === order.id ? '处理中...' : '确认收货'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
