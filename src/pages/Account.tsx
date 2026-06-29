import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import styles from './Account.module.css';

const statusLabels: Record<string, string> = {
  pending: '待付款', paid: '已付款', shipped: '已发货',
  delivered: '已送达', cancelled: '已取消',
};

const statusStyles: Record<string, string> = {
  pending: styles.statusPending, paid: styles.statusPaid,
  shipped: styles.statusShipped, delivered: styles.statusDelivered,
  cancelled: styles.statusCancelled,
};

export default function Account() {
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuth();
  const { orders, loading, refreshOrders } = useOrders();
  const [tab, setTab] = useState<'profile' | 'orders'>('profile');
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saved, setSaved] = useState(false);

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
                {orders.map((order: any) => (
                  <div key={order.id} className={styles.orderCard}>
                    <div className={styles.orderHeader}>
                      <span className={styles.orderId}>{order.id}</span>
                      <span className={`${styles.orderStatus} ${statusStyles[order.status]}`}>{statusLabels[order.status]}</span>
                    </div>
                    <div className={styles.orderItems}>
                      {order.items.map((item: any, i: number) => (
                        <div key={i} className={styles.orderItem}>
                          <span className={styles.orderItemName}>{item.productName}</span>
                          <span className={styles.orderItemMeta}>x{item.quantity} · ¥{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className={styles.orderTotal}>合计 ¥{order.total}</div>
                    <div className={styles.orderDate}>{new Date(order.created_at).toLocaleDateString('zh-CN')}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
