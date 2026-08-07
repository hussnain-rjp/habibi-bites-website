import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext.jsx';

export const Navbar = ({ activePage, setActivePage }) => {
  const { totalItemCount, setIsOpen } = useCart();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const links = [
    { id: 'home', label: 'Home' },
    { id: 'menu', label: 'Menu' },
    { id: 'deals', label: 'Habibi Deals' },
    { id: 'tracker', label: 'Order Tracker' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'contact', label: 'Contact Us' }
  ];

  return (
    <header id="global-header">
      <div className="nav-container">
        <button 
          onClick={() => setActivePage('home')} 
          className="logo-wrapper"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <img 
            src="assets/logo.png" 
            alt="Habibi Bites Logo" 
            className="logo-img" 
            style={{ height: '68px', width: 'auto', borderRadius: 'var(--radius-sm)', border: '2px solid var(--primary)', background: '#000', boxShadow: 'var(--shadow-sm)' }}
          />
        </button>

        <nav className={`nav-links ${mobileNavOpen ? 'active' : ''}`} id="nav-links">
          {links.map(link => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={activePage === link.id ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                setActivePage(link.id);
                setMobileNavOpen(false);
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <button 
            className="cart-trigger" 
            id="cart-drawer-trigger" 
            aria-label="Open Cart"
            onClick={() => setIsOpen(true)}
          >
            <div className="cart-icon-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg className="cart-icon-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', color: 'var(--text-white)', marginRight: '2px' }}>
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {totalItemCount > 0 && (
                <span className="cart-count-badge">{totalItemCount}</span>
              )}
            </div>
            <span className="cart-trigger-label">Cart</span>
          </button>
          
          <button 
            onClick={() => setActivePage('admin')} 
            className="admin-profile-trigger" 
            title="Admin Portal" 
            aria-label="Admin Dashboard"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <svg className="profile-icon-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', color: 'var(--text-white)' }}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </button>

          <button 
            className="mobile-toggle" 
            id="mobile-menu-toggle" 
            aria-label="Toggle Menu"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
};
