import React, { useState, useEffect } from 'react';
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
import { TrackerPage } from './presentation/pages/TrackerPage.jsx';
import { AdminPage } from './presentation/pages/AdminPage.jsx';
import { ReviewsPage } from './presentation/pages/ReviewsPage.jsx';
import { ContactPage } from './presentation/pages/ContactPage.jsx';

export function App() {
  const [activePage, setActivePage] = useState('home');
  const [selectedOrderId, setSelectedOrderId] = useState('');

  // Handle URL hash navigation
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'admin') {
        window.location.hash = 'home';
        setActivePage('home');
      } else if (hash && ['home', 'menu', 'deals', 'tracker', 'checkout', 'hb-manager-8924', 'reviews', 'contact'].includes(hash)) {
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
            <Navbar activePage={activePage} setActivePage={setActivePage} />
            <div style={{ flex: 1 }}>
              {renderCurrentPage()}
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
