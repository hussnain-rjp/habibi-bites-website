import React from 'react';
import { useCart } from '../contexts/CartContext.jsx';

export const CartDrawer = ({ setActivePage }) => {
  const { cartItems, isOpen, setIsOpen, updateQuantity, removeFromCart, cartSubtotal } = useCart();

  if (!isOpen) return null;

  return (
    <div className="cart-drawer-overlay" style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'flex-end' }}>
      <div className="cart-drawer" style={{ width: '100%', maxWidth: '420px', background: 'var(--bg-dark)', height: '100%', display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
        
        {/* Drawer Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Your Basket ({cartItems.length})</h3>
          <button 
            onClick={() => setIsOpen(false)}
            style={{ background: 'none', border: 'none', color: 'var(--text-main)', fontSize: '1.5rem', cursor: 'pointer' }}
          >
            &times;
          </button>
        </div>

        {/* Items List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🛒</div>
              <p>Your basket is currently empty.</p>
              <button 
                className="btn btn-primary" 
                style={{ marginTop: '15px' }}
                onClick={() => { setIsOpen(false); setActivePage('menu'); }}
              >
                Browse Our Menu
              </button>
            </div>
          ) : (
            cartItems.map((item, idx) => (
              <div key={idx} style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-panel)', marginBottom: '12px', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{item.name}</h4>
                    {item.options?.size && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent)', textTransform: 'uppercase' }}>Size: {item.options.size}</span>
                    )}
                    <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 'bold', marginTop: '4px' }}>
                      Rs. {item.price}
                    </div>
                  </div>
                  <button 
                    onClick={() => removeFromCart(idx)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem' }}
                  >
                    🗑️
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed var(--border-light)' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--bg-elevated)', borderRadius: '4px', border: '1px solid var(--border)' }}>
                    <button 
                      onClick={() => updateQuantity(idx, item.quantity - 1)}
                      style={{ padding: '2px 10px', background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      -
                    </button>
                    <span style={{ padding: '0 8px', fontSize: '0.85rem', fontWeight: 'bold' }}>{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(idx, item.quantity + 1)}
                      style={{ padding: '2px 10px', background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      +
                    </button>
                  </div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                    Rs. {item.price * item.quantity}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        {cartItems.length > 0 && (
          <div style={{ padding: '20px', borderTop: '1px solid var(--border-light)', background: 'var(--bg-panel)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '15px' }}>
              <span>Subtotal:</span>
              <span style={{ color: 'var(--accent)' }}>Rs. {cartSubtotal.toLocaleString()}</span>
            </div>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '14px', fontSize: '1rem', textAlign: 'center', justifyContent: 'center' }}
              onClick={() => { setIsOpen(false); setActivePage('checkout'); }}
            >
              Proceed to Checkout ➔
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
