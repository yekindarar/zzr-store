import { HashRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Splash from './pages/Splash';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import About from './pages/About';

function AppLayout() {
  const location = useLocation();
  const [pageKey, setPageKey] = useState(0);
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem('splash_seen'));

  useEffect(() => {
    setPageKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const handleSplashDone = () => {
    sessionStorage.setItem('splash_seen', '1');
    setShowSplash(false);
  };

  if (showSplash) {
    return <Splash onDone={handleSplashDone} />;
  }

  return (
    <>
      <Navbar />
      <main key={pageKey}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <CartProvider>
      <HashRouter>
        <AppLayout />
      </HashRouter>
    </CartProvider>
  );
}
