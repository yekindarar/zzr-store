import { useEffect } from 'react';
import { useOrders } from '../../context/OrderContext';
import styles from '../Account.module.css';
import layoutStyles from './AdminLayout.module.css';

const statusLabels: Record<string, string> = {
  pending: '待付款', paid: '已付款', shipped: '已发货',
  delivered: '已送达', cancelled: '已取消',
};

const statusStyles: Record<string, string> = {
  pending: styles.statusPending, paid: styles.statusPaid,
  shipped: styles.statusShipped, delivered: styles.statusDelivered,
  cancelled: styles.statusCancelled,
};

const statusFlow = ['pending', 'paid', 'shipped', 'delivered'];

export default function AdminOrders() {
  const { adminOrders, adminLoading, refreshAdminOrders, updateOrderStatus } = useOrders();

  useEffect(() => { refreshAdminOrders(); }, []);

  const nextStatus = (current: string): string | null => {
    const idx = statusFlow.indexOf(current);
    return idx >= 0 && idx < statusFlow.length - 1 ? statusFlow[idx + 1] : null;
  };

  return (
    <div>
      <div className={layoutStyles.header}>
        <h1 className={layoutStyles.headerTitle}>订单管理</h1>
        <p className={layoutStyles.headerSub}>共 {adminOrders.length} 笔订单</p>
      </div>

      {adminLoading && <p style={{ color: 'var(--text-secondary)', fontSize: 13, padding: 20 }}>加载中...</p>}

      {!adminLoading && adminOrders.length === 0 && (
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center', padding: 60 }}>暂无订单</p>
      )}

      {adminOrders.map((order: any) => (
        <div key={order.id} className={styles.orderCard}>
          <div className={styles.orderHeader}>
            <div>
              <span className={styles.orderId}>{order.id}</span>
              <span style={{ marginLeft: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
                {new Date(order.created_at).toLocaleDateString('zh-CN')}
              </span>
            </div>
            <span className={`${styles.orderStatus} ${statusStyles[order.status]}`}>{statusLabels[order.status]}</span>
          </div>

          <div className={styles.orderItems}>
            {order.items?.map((item: any, i: number) => (
              <div key={i} className={styles.orderItem}>
                <span className={styles.orderItemName}>{item.productName}</span>
                <span className={styles.orderItemMeta}>x{item.quantity} · ¥{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
            {order.shipping?.name} · {order.shipping?.phone} · {order.shipping?.address}
          </div>

          <div className={styles.orderTotal}>合计 ¥{order.total}</div>

          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            {nextStatus(order.status) && (
              <button
                style={{ padding: '6px 16px', fontSize: 12, border: '1px solid var(--border)', borderRadius: 4, background: 'none', cursor: 'pointer', color: 'var(--text)' }}
                onClick={() => updateOrderStatus(order.id, nextStatus(order.status)!)}
              >
                标记为 {statusLabels[nextStatus(order.status)!]}
              </button>
            )}
            {order.status !== 'cancelled' && order.status !== 'delivered' && (
              <button
                style={{ padding: '6px 16px', fontSize: 12, border: '1px solid rgba(211,47,47,0.2)', borderRadius: 4, background: 'none', cursor: 'pointer', color: '#d32f2f' }}
                onClick={() => updateOrderStatus(order.id, 'cancelled')}
              >
                取消订单
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
