import React, { useState, useEffect } from 'react';
import { useDb } from '../contexts/DbContext.jsx';

export const TrackerPage = ({ selectedOrderId }) => {
  const db = useDb();
  const [searchInput, setSearchInput] = useState(selectedOrderId || '');
  const [activeOrder, setActiveOrder] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (selectedOrderId) {
      handleSearch(selectedOrderId);
    }
  }, [selectedOrderId]);

  const handleSearch = async (queryToSearch) => {
    const query = queryToSearch || searchInput;
    if (!query.trim()) return;

    setErrorMsg('');
    setActiveOrder(null);

    if (query.toUpperCase().startsWith("HB-")) {
      const order = await db.getOrderById(query);
      if (order) setActiveOrder(order);
      else setErrorMsg(`No order found matching Order ID "${query}".`);
    } else {
      const orders = await db.getOrdersByPhone(query);
      if (orders && orders.length > 0) setActiveOrder(orders[0]);
      else setErrorMsg(`No orders found matching phone number "${query}".`);
    }
  };

  const stages = [
    { key: "received", label: "Order Received", icon: "📝" },
    { key: "queue", label: "In Kitchen Queue", icon: "⏳" },
    { key: "cooking", label: "Cooking Hot", icon: "🔥" },
    { key: "packing", label: "Packing Feast", icon: "📦" },
    { key: "delivery", label: "Out for Delivery", icon: "🛵" },
    { key: "delivered", label: "Delivered", icon: "✅" }
  ];

  const getStageIndex = (status) => {
    return stages.findIndex(s => s.key === status);
  };

  const currentStageIdx = activeOrder ? getStageIndex(activeOrder.status) : -1;

  return (
    <main className="section-container page-top-margin">
      <div className="section-header">
        <span className="section-subtitle">Real-Time Kitchen Pipeline</span>
        <h1 className="section-title">Track Your Live Order</h1>
        <p style={{ color: 'var(--text-muted)' }}>Enter your Order ID (HB-XXXX) or Mobile Phone Number to check live status.</p>
      </div>

      <div style={{ maxWidth: '540px', margin: '0 auto 30px auto' }}>
        <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="e.g. HB-5103 or 03001234567"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{ flex: 1, padding: '14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-panel)', border: '1px solid var(--border)', color: 'var(--text-main)', fontSize: '1rem' }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0 24px' }}>Search 🔍</button>
        </form>
      </div>

      {errorMsg && (
        <div style={{ maxWidth: '540px', margin: '0 auto', textAlign: 'center', padding: '16px', background: 'rgba(217, 83, 79, 0.15)', border: '1px solid var(--primary)', borderRadius: 'var(--radius-sm)', color: '#ff6b6b' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {activeOrder && (
        <div style={{ background: 'var(--bg-panel)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', padding: '30px', marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', paddingBottom: '20px', borderBottom: '1px solid var(--border-light)' }}>
            <div>
              <h2 style={{ margin: 0, color: 'var(--accent)', fontSize: '1.5rem' }}>Order #{activeOrder.id}</h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Placed on {new Date(activeOrder.createdAt || Date.now()).toLocaleString()}</span>
            </div>
            <div style={{ textTransform: 'uppercase', padding: '6px 16px', borderRadius: '20px', background: 'var(--primary)', color: '#fff', fontWeight: 'bold', fontSize: '0.85rem' }}>
              {activeOrder.status}
            </div>
          </div>

          <div style={{ margin: '40px 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '15px', textAlign: 'center' }}>
            {stages.map((stage, idx) => {
              const isPassed = currentStageIdx >= idx;
              const isCurrent = currentStageIdx === idx;
              return (
                <div key={stage.key} style={{ opacity: isPassed ? 1 : 0.4 }}>
                  <div style={{ 
                    width: '50px', 
                    height: '50px', 
                    borderRadius: '50%', 
                    margin: '0 auto 10px auto', 
                    background: isCurrent ? 'var(--accent)' : isPassed ? 'var(--primary)' : 'var(--bg-elevated)', 
                    color: isCurrent ? '#000' : '#fff',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '1.25rem',
                    boxShadow: isCurrent ? '0 0 15px var(--accent)' : 'none'
                  }}>
                    {stage.icon}
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: isCurrent ? 'bold' : 'normal', color: isCurrent ? 'var(--accent)' : 'var(--text-main)' }}>
                    {stage.label}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
            <div>
              <h4 style={{ color: 'var(--accent)', marginBottom: '8px' }}>Delivery Address</h4>
              <p style={{ margin: 0, fontSize: '0.9rem' }}><strong>{activeOrder.customer?.name}</strong></p>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{activeOrder.customer?.phone}</p>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{activeOrder.customer?.address}</p>
            </div>
            <div>
              <h4 style={{ color: 'var(--accent)', marginBottom: '8px' }}>Items Summary</h4>
              {(activeOrder.items || []).map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '4px' }}>
                  <span>{item.quantity}x {item.name}</span>
                  <span style={{ fontWeight: 'bold' }}>Rs. {item.price * item.quantity}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px dashed var(--border-light)', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: 'var(--primary)' }}>
                <span>Total Amount:</span>
                <span>Rs. {activeOrder.total}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
