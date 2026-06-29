import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const location = useLocation();
  const { totalItems } = useCart();

  const links = [
    { to: '/', label: '首页' },
    { to: '/products', label: '全部商品' },
    { to: '/about', label: '关于' },
  ];

  return (
    <nav className={styles.nav}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoMark}>◆</span>
          <span className={styles.logoText}>ZZR</span>
        </Link>

        <div className={styles.links}>
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`${styles.link} ${location.pathname === link.to ? styles.active : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <Link to="/cart" className={styles.cart}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          {totalItems > 0 && <span className={styles.badge}>{totalItems}</span>}
        </Link>
      </div>
    </nav>
  );
}
