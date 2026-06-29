import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './AdminLayout.module.css';

const navItems = [
  { to: '/admin', label: '概览', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { to: '/admin/products', label: '商品管理', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { to: '/admin/orders', label: '订单管理', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { to: '/admin/users', label: '用户管理', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
];

export default function AdminLayout() {
  const { user, role } = useAuth();
  const location = useLocation();

  if (!user || (role !== 'admin' && role !== 'owner')) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className={styles.layout}>
      <div className={styles.sidebar}>
        <div className={styles.logo}>
          <svg className={styles.logoIcon} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 26 L46 26 L18 38 L46 38" stroke="#c0a060" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          <div className={styles.logoText}>ZZR</div>
          <div className={styles.logoSub}>管理后台</div>
        </div>

        <div className={styles.nav}>
          {navItems.map((item) => {
            const isActive = location.hash === `#${item.to}` || location.hash === `#${item.to}/`;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`${styles.navLink} ${isActive ? styles.navActive : ''}`}
              >
                <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon} />
                </svg>
                {item.label}
              </Link>
            );
          })}
        </div>

        <Link to="/" className={styles.backLink}>
          ← 返回前台
        </Link>
      </div>

      <div className={styles.main}>
        <Outlet />
      </div>
    </div>
  );
}
