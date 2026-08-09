import React, { useState, useEffect, Suspense, lazy } from 'react';
import { DbProvider } from './presentation/contexts/DbContext.jsx';
import { AuthProvider } from './presentation/contexts/AuthContext.jsx';
import { CartProvider } from './presentation/contexts/CartContext.jsx';

import { Navbar } from './presentation/components/Navbar.jsx';
import { Footer } from './presentation/components/Footer.jsx';
import { CartDrawer } from './presentation/components/CartDrawer.jsx';

import { Home } from './presentation/pages/Home.jsx';
import { MenuPage } from './presentation/pages/MenuPage.jsx';
import { DealsPage } from './presentation/pages/DealsPage.jsx';
import { CheckoutPage } from './presentation/pages/CheckoutPage.jsx';
import { ReviewsPage } from './presentation/pages/ReviewsPage.jsx';
import { ContactPage } from './presentation/pages/ContactPage.jsx';

// Code-split heavy routes not needed on initial home page load
const TrackerPage = lazy(() => import('./presentation/pages/TrackerPage.jsx').then(m => ({ default: m.TrackerPage })));
const AdminPage = lazy(() => import('./presentation/pages/AdminPage.jsx').then(m => ({ default: m.AdminPage })));

import { IndependenceDecorations } from './presentation/components/IndependenceDecorations.jsx';

export function App() {
  const [activePage, setActivePage] = useState('home');
  const [selectedOrderId, setSelectedOrderId] = useState('');

  // Handle URL hash navigation
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'admin' || hash === 'hb-manager-8924') {
        setActivePage('admin');
      } else if (hash && ['home', 'menu', 'deals', 'tracker', 'checkout', 'reviews', 'contact'].includes(hash)) {
        setActivePage(hash);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const renderCurrentPage = () => {
    switch (activePage) {
      case 'home':
        return <Home setActivePage={setActivePage} />;
      case 'menu':
        return <MenuPage />;
      case 'deals':
        return <DealsPage />;
      case 'checkout':
        return <CheckoutPage setActivePage={setActivePage} setSelectedOrderId={setSelectedOrderId} />;
      case 'tracker':
        return <TrackerPage selectedOrderId={selectedOrderId} />;
      case 'admin':
      case 'hb-manager-8924':
        return <AdminPage />;
      case 'reviews':
        return <ReviewsPage />;
      case 'contact':
        return <ContactPage />;
      default:
        return <Home setActivePage={setActivePage} />;
    }
  };

  return (
    <DbProvider>
      <AuthProvider>
        <CartProvider>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <IndependenceDecorations />
            <Navbar activePage={activePage} setActivePage={setActivePage} />
            <div style={{ flex: 1 }}>
              <Suspense fallback={<div className="section-container" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading view...</div>}>
                {renderCurrentPage()}
              </Suspense>
            </div>
            <CartDrawer setActivePage={setActivePage} />
            <Footer setActivePage={setActivePage} />
          </div>
        </CartProvider>
      </AuthProvider>
    </DbProvider>
  );
}

export default App;
