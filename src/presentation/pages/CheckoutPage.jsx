import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext.jsx';
import { useDb } from '../contexts/DbContext.jsx';

export const CheckoutPage = ({ setActivePage, setSelectedOrderId }) => {
  const { cartItems, cartSubtotal, clearCart } = useCart();
  const db = useDb();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [deliverySettings, setDeliverySettings] = useState({ enabled: false, fee: 150 });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const s = await db.getDeliverySettings();
    setDeliverySettings(s);
  };

  const deliveryFee = deliverySettings.enabled ? deliverySettings.fee : 0;
  const grandTotal = cartSubtotal + deliveryFee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (cartItems.length === 0) {
      setErrorMsg('Your basket is empty. Please add items to order.');
      return;
    }
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setErrorMsg('Please fill in all required customer details.');
      return;
    }

    setLoading(true);
    try {
      const customer = { name: name.trim(), phone: phone.trim(), address: address.trim() };
      const order = await db.createOrder(customer, cartItems, grandTotal, deliveryFee);
      clearCart();
      if (setSelectedOrderId) setSelectedOrderId(order.id);
      setActivePage('tracker');
    } catch (err) {
      setErrorMsg(err.message || 'Error processing your order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="section-container page-top-margin">
      <div className="section-header">
        <span className="section-subtitle">Final Step</span>
        <h1 className="section-title">Complete Your Order</h1>
        <p style={{ color: 'var(--text-muted)' }}>Enter your delivery address details below. Cash on Delivery supported.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', marginTop: '20px' }}>
        
        {/* Customer Details Form */}
        <div style={{ background: 'var(--bg-panel)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', color: 'var(--accent)' }}>Buyer Details</h3>

          {errorMsg && (
            <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'rgba(217, 83, 79, 0.2)', border: '1px solid var(--primary)', color: '#ff6b6b', marginBottom: '15px', fontSize: '0.9rem' }}>
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '6px' }}>Full Name *</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Zahid Mehmood"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-main)' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '6px' }}>Mobile Phone Number *</label>
              <input 
                type="tel" 
                required 
                placeholder="0300-1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-main)' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '6px' }}>Delivery Address *</label>
              <textarea 
                required 
                rows="3"
                placeholder="House #, Street #, Sector/Area, City"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-main)', resize: 'vertical' }}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading || cartItems.length === 0}
              style={{ width: '100%', padding: '14px', fontSize: '1rem', justifyContent: 'center' }}
            >
              {loading ? 'Processing Order...' : 'Confirm & Place Order ➔'}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div style={{ background: 'var(--bg-panel)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', color: 'var(--accent)' }}>Order Summary</h3>
          
          <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
            {cartItems.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px dashed var(--border-light)' }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{item.quantity}x {item.name}</div>
                  {item.options?.size && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Size: {item.options.size}</div>
                  )}
                </div>
                <div style={{ fontWeight: 'bold', color: 'var(--accent)' }}>Rs. {item.price * item.quantity}</div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Subtotal:</span>
              <span>Rs. {cartSubtotal.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span>Delivery Charges:</span>
              <span style={{ color: deliveryFee > 0 ? 'var(--accent)' : '#4caf50' }}>
                {deliveryFee > 0 ? `Rs. ${deliveryFee}` : 'FREE'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold', borderTop: '1px solid var(--border-light)', paddingTop: '12px', color: 'var(--primary)' }}>
              <span>Grand Total:</span>
              <span>Rs. {grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
};
