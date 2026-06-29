import { useEffect, useState } from 'react';
import { useOrders } from '../../context/OrderContext';
import layoutStyles from './AdminLayout.module.css';
import styles from './AdminOrders.module.css';

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  pending: { label: '待付款', className: 'pending' },
  paid: { label: '已付款', className: 'paid' },
  shipped: { label: '已发货', className: 'shipped' },
  delivered: { label: '已送达', className: 'delivered' },
  cancelled: { label: '已取消', className: 'cancelled' },
};

// Valid transitions: only forward or cancel
const NEXT_STATUS: Record<string, string | null> = {
  pending: 'paid',
  paid: 'shipped',
  shipped: 'delivered',
  delivered: null,
  cancelled: null,
};

const PROGRESS_STEPS = ['pending', 'paid', 'shipped', 'delivered'];

export default function AdminOrders() {
  const { adminOrders, adminLoading, refreshAdminOrders, updateOrderStatus } = useOrders();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => { refreshAdminOrders(); }, []);

  const toggleExpand = (id: string) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  const handleUpdate = async (orderId: string, newStatus: string) => {
    const tracking = newStatus === 'shipped' ? (trackingInput[orderId] || '') : undefined;
    await updateOrderStatus(orderId, newStatus, tracking);
    setTrackingInput(prev => { const n = { ...prev }; delete n[orderId]; return n; });
  };

  const filtered = filter === 'all'
    ? adminOrders
    : adminOrders.filter(o => o.status === filter);

  const counts = { all: adminOrders.length } as Record<string, number>;
  adminOrders.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1; });

  const statusFilters = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待付款' },
    { key: 'paid', label: '待发货' },
    { key: 'shipped', label: '运输中' },
    { key: 'delivered', label: '已送达' },
    { key: 'cancelled', label: '已取消' },
  ];

  return (
    <div className={styles.page}>
      <div className={layoutStyles.header}>
        <h1 className={layoutStyles.headerTitle}>订单管理</h1>
        <p className={layoutStyles.headerSub}>共 {adminOrders.length} 笔订单</p>
      </div>

      {/* Filter tabs */}
      <div className={styles.filters}>
        {statusFilters.map(f => (
          <button
            key={f.key}
            className={`${styles.filterBtn} ${filter === f.key ? styles.filterActive : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            {counts[f.key] > 0 && <span className={styles.filterCount}>{counts[f.key]}</span>}
          </button>
        ))}
      </div>

      {adminLoading && <p className={styles.loading}>加载中...</p>}

      {!adminLoading && filtered.length === 0 && (
        <p className={styles.empty}>暂无订单</p>
      )}

      <div className={styles.orderList}>
        {filtered.map((order: any) => {
          const isExpanded = expandedOrder === order.id;
          const next = NEXT_STATUS[order.status];
          const canCancel = order.status !== 'cancelled' && order.status !== 'delivered';
          const stepIdx = PROGRESS_STEPS.indexOf(order.status);

          return (
            <div key={order.id} className={`${styles.card} ${isExpanded ? styles.cardExpanded : ''}`}>
              {/* Header — clickable to expand */}
              <div className={styles.cardHeader} onClick={() => toggleExpand(order.id)}>
                <div className={styles.cardLeft}>
                  <span className={styles.orderId}>{order.id}</span>
                  <span className={`${styles.badge} ${styles[STATUS_MAP[order.status].className]}`}>
                    {STATUS_MAP[order.status].label}
                  </span>
                </div>
                <div className={styles.cardRight}>
                  <span className={styles.date}>
                    {new Date(order.created_at).toLocaleDateString('zh-CN')} {new Date(order.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className={`${styles.arrow} ${isExpanded ? styles.arrowUp : ''}`}>▾</span>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className={styles.cardBody}>
                  {/* Progress bar */}
                  <div className={styles.progressSection}>
                    <p className={styles.sectionLabel}>订单进度</p>
                    <div className={styles.progressBar}>
                      {PROGRESS_STEPS.map((step, i) => {
                        const isActive = i <= stepIdx && order.status !== 'cancelled';
                        const isCurrent = i === stepIdx && order.status !== 'cancelled';
                        return (
                          <div key={step} className={styles.progressStep}>
                            <div className={`${styles.progressDot} ${isActive ? styles.dotActive : ''} ${isCurrent ? styles.dotCurrent : ''}`}>
                              {isActive && !isCurrent && '✓'}
                            </div>
                            <span className={`${styles.progressLabel} ${isActive ? styles.labelActive : ''}`}>
                              {STATUS_MAP[step].label}
                            </span>
                            {i < PROGRESS_STEPS.length - 1 && (
                              <div className={`${styles.progressLine} ${i < stepIdx && order.status !== 'cancelled' ? styles.lineActive : ''}`} />
                            )}
                          </div>
                        );
                      })}
                      {order.status === 'cancelled' && (
                        <div className={styles.progressStep}>
                          <div className={`${styles.progressDot} ${styles.dotCancelled}`}>✕</div>
                          <span className={`${styles.progressLabel} ${styles.labelCancelled}`}>已取消</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order items */}
                  <div className={styles.itemsSection}>
                    <p className={styles.sectionLabel}>商品明细</p>
                    {order.items?.map((item: any, i: number) => (
                      <div key={i} className={styles.item}>
                        <div className={styles.itemInfo}>
                          <span className={styles.itemName}>{item.productName}</span>
                          {item.color && (
                            <span className={styles.itemColor}>
                              <span className={styles.colorDot} style={{ background: item.color }} />
                              {item.color}
                            </span>
                          )}
                        </div>
                        <div className={styles.itemRight}>
                          <span className={styles.itemQty}>x{item.quantity}</span>
                          <span className={styles.itemPrice}>¥{item.price * item.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shipping info */}
                  <div className={styles.shippingSection}>
                    <p className={styles.sectionLabel}>收货信息</p>
                    <div className={styles.shippingInfo}>
                      <span>{order.shipping?.name}</span>
                      <span>{order.shipping?.phone}</span>
                      <span>{order.shipping?.address} {order.shipping?.city} {order.shipping?.zip}</span>
                    </div>
                    <div className={styles.paymentInfo}>
                      <span className={styles.metaLabel}>支付方式</span>
                      <span>{order.payment_method}</span>
                      <span className={styles.metaLabel}>合计</span>
                      <span className={styles.totalPrice}>¥{order.total}</span>
                    </div>
                  </div>

                  {/* Tracking number (shown when shipped/delivered) */}
                  {(order.status === 'shipped' || order.status === 'delivered') && order.tracking_number && (
                    <div className={styles.trackingSection}>
                      <span className={styles.metaLabel}>快递单号</span>
                      <span className={styles.trackingNumber}>{order.tracking_number}</span>
                    </div>
                  )}

                  {/* Action buttons */}
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <div className={styles.actions}>
                      {/* Show tracking input when transitioning to shipped */}
                      {next === 'shipped' && (
                        <div className={styles.trackingInput}>
                          <input
                            type="text"
                            placeholder="输入快递单号..."
                            value={trackingInput[order.id] || ''}
                            onChange={e => setTrackingInput(prev => ({ ...prev, [order.id]: e.target.value }))}
                            className={styles.trackingField}
                          />
                        </div>
                      )}
                      <div className={styles.actionBtns}>
                        {next && (
                          <button
                            className={styles.btnPrimary}
                            onClick={() => handleUpdate(order.id, next)}
                            disabled={next === 'shipped' && !trackingInput[order.id]}
                          >
                            {next === 'paid' && '标记为已付款'}
                            {next === 'shipped' && '发货'}
                            {next === 'delivered' && '标记为已送达'}
                          </button>
                        )}
                        {canCancel && (
                          <button
                            className={styles.btnDanger}
                            onClick={() => {
                              if (window.confirm('确定取消此订单？')) {
                                handleUpdate(order.id, 'cancelled');
                              }
                            }}
                          >
                            取消订单
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className={styles.timestamps}>
                    <span>创建于 {new Date(order.created_at).toLocaleString('zh-CN')}</span>
                    {order.updated_at && (
                      <span> · 更新于 {new Date(order.updated_at).toLocaleString('zh-CN')}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
