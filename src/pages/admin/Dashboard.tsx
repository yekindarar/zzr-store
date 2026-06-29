import { useEffect, useState } from 'react';
import { useOrders } from '../../context/OrderContext';
import styles from './AdminLayout.module.css';

export default function AdminDashboard() {
  const { adminOrders, adminLoading, refreshAdminOrders } = useOrders();
  const [stats, setStats] = useState({ total: 0, pending: 0, paid: 0, revenue: 0 });

  useEffect(() => {
    refreshAdminOrders();
  }, []);

  useEffect(() => {
    setStats({
      total: adminOrders.length,
      pending: adminOrders.filter((o: any) => o.status === 'pending').length,
      paid: adminOrders.filter((o: any) => o.status === 'paid').length,
      revenue: adminOrders.reduce((s: number, o: any) => s + o.total, 0),
    });
  }, [adminOrders]);

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.headerTitle}>概览</h1>
        <p className={styles.headerSub}>ZZR 商店管理面板</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: '总订单', value: stats.total, color: '#c0a060' },
          { label: '待处理', value: stats.pending, color: '#e65100' },
          { label: '总收入', value: `¥${stats.revenue}`, color: '#2e7d32' },
        ].map((stat) => (
          <div key={stat.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '24px 20px' }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 500, letterSpacing: 0.5 }}>{stat.label}</div>
            <div style={{ fontSize: 28, fontWeight: 300, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 16 }}>最近订单</h3>
        {adminLoading && <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>加载中...</p>}
        {!adminLoading && adminOrders.slice(0, 5).map((order: any) => (
          <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
            <span style={{ color: 'var(--text-secondary)' }}>{order.id}</span>
            <span>{order.items?.length || 0} 件商品</span>
            <span style={{ fontWeight: 500 }}>¥{order.total}</span>
          </div>
        ))}
        {!adminLoading && adminOrders.length === 0 && (
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center', padding: 20 }}>暂无订单</p>
        )}
      </div>
    </div>
  );
}
