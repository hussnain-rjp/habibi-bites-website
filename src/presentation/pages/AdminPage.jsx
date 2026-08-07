import React, { useState, useEffect } from 'react';
import { useDb } from '../contexts/DbContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { InvoiceFactory } from '../../core/factories/InvoiceFactory.js';

export const AdminPage = () => {
  const db = useDb();
  const { isAdmin, login, logout } = useAuth();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [orders, setOrders] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [deliverySettings, setDeliverySettings] = useState({ enabled: false, fee: 150, maxOrders: 50 });
  const [settingsFeeInput, setSettingsFeeInput] = useState(150);
  const [settingsMaxInput, setSettingsMaxInput] = useState(50);
  const [settingsEnabledInput, setSettingsEnabledInput] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin]);

  const loadDashboardData = async () => {
    const fetchedOrders = await db.getOrders();
    setOrders(fetchedOrders);

    const fetchedReviews = await db.getPendingReviews();
    setPendingReviews(fetchedReviews);

    const s = await db.getDeliverySettings();
    setDeliverySettings(s);
    setSettingsFeeInput(s.fee);
    setSettingsMaxInput(s.maxOrders);
    setSettingsEnabledInput(s.enabled);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const success = await login(username, password);
      if (!success) setAuthError('Invalid credentials. Default: admin / habibibites123');
    } catch (err) {
      setAuthError(err.message || 'Login failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    await db.updateOrderStatus(orderId, newStatus);
    loadDashboardData();
  };

  const handleApproveReview = async (reviewId) => {
    await db.approveReview(reviewId);
    loadDashboardData();
  };

  const handleDeleteReview = async (reviewId) => {
    await db.deleteReview(reviewId);
    loadDashboardData();
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    await db.saveDeliverySettings(settingsEnabledInput, settingsFeeInput, settingsMaxInput);
    alert('Delivery settings saved successfully!');
    loadDashboardData();
  };

  const handlePrintInvoice = (order) => {
    const html = InvoiceFactory.createPrintableHTML(order);
    const win = window.open('', '_blank', 'width=350,height=600');
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
    }, 250);
  };

  const totalOrders = orders.length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  const totalRevenue = deliveredOrders.reduce((acc, o) => acc + (parseFloat(o.total) || 0), 0);
  const activeCount = orders.filter(o => ['received', 'queue', 'cooking', 'packing', 'delivery'].includes(o.status)).length;

  if (!isAdmin) {
    return (
      <main className="section-container page-top-margin">
        <div style={{ maxWidth: '420px', margin: '40px auto', background: 'var(--bg-panel)', padding: '30px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <span style={{ fontSize: '3rem' }}>🔐</span>
            <h2 style={{ margin: '10px 0 0 0', color: 'var(--accent)' }}>Admin Portal</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Login to access kitchen orders & management.</p>
          </div>

          {authError && (
            <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', background: 'rgba(217, 83, 79, 0.2)', border: '1px solid var(--primary)', color: '#ff6b6b', marginBottom: '15px', fontSize: '0.85rem' }}>
              ⚠️ {authError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '4px' }}>Username / Email</label>
              <input 
                type="text" 
                required 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-main)' }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '4px' }}>Password</label>
              <input 
                type="password" 
                required 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-main)' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={authLoading} style={{ width: '100%', padding: '12px', justifyContent: 'center' }}>
              {authLoading ? 'Authenticating...' : 'Login to Portal ➔'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="section-container page-top-margin">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '30px' }}>
        <div>
          <span className="section-subtitle">Habibi Kitchen Controller</span>
          <h1 className="section-title" style={{ margin: 0 }}>Admin Control Panel</h1>
        </div>
        <button onClick={logout} className="btn btn-outline" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
          Logout 🚪
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        <div style={{ background: 'var(--bg-panel)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Revenue</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--accent)' }}>Rs. {totalRevenue.toLocaleString()}</div>
        </div>
        <div style={{ background: 'var(--bg-panel)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Orders</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 'bold' }}>{totalOrders}</div>
        </div>
        <div style={{ background: 'var(--bg-panel)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Active Kitchen Queue</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--primary)' }}>{activeCount}</div>
        </div>
        <div style={{ background: 'var(--bg-panel)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Delivered</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#4caf50' }}>{deliveredOrders.length}</div>
        </div>
      </div>

      <div style={{ background: 'var(--bg-panel)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '30px' }}>
        <h3 style={{ margin: '0 0 20px 0', color: 'var(--accent)' }}>Live Orders Feed</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px' }}>Order ID</th>
                <th style={{ padding: '10px' }}>Customer</th>
                <th style={{ padding: '10px' }}>Items</th>
                <th style={{ padding: '10px' }}>Total</th>
                <th style={{ padding: '10px' }}>Status Stage</th>
                <th style={{ padding: '10px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '12px 10px', fontWeight: 'bold', color: 'var(--accent)' }}>{order.id}</td>
                  <td style={{ padding: '12px 10px' }}>
                    <strong>{order.customer?.name}</strong><br/>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.customer?.phone}</span>
                  </td>
                  <td style={{ padding: '12px 10px', fontSize: '0.85rem' }}>
                    {(order.items || []).map(i => `${i.quantity}x ${i.name}`).join(", ")}
                  </td>
                  <td style={{ padding: '12px 10px', fontWeight: 'bold' }}>Rs. {order.total}</td>
                  <td style={{ padding: '12px 10px' }}>
                    <select 
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      style={{ padding: '6px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-main)' }}
                    >
                      <option value="received">Order Received</option>
                      <option value="queue">In Queue</option>
                      <option value="cooking">Cooking</option>
                      <option value="packing">Packing</option>
                      <option value="delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <button 
                      onClick={() => handlePrintInvoice(order)}
                      style={{ padding: '6px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', cursor: 'pointer' }}
                    >
                      🖨️ Print
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <div style={{ background: 'var(--bg-panel)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <h3 style={{ margin: '0 0 15px 0', color: 'var(--accent)' }}>Delivery & Capacity Settings</h3>
          <form onSubmit={handleSaveSettings}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', cursor: 'pointer' }}>
              <input 
                type="checkbox"
                checked={settingsEnabledInput}
                onChange={(e) => setSettingsEnabledInput(e.target.checked)}
              />
              <span style={{ fontWeight: 'bold' }}>Enable Delivery Charge</span>
            </label>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Delivery Fee Amount (Rs.)</label>
              <input 
                type="number" 
                value={settingsFeeInput}
                onChange={(e) => setSettingsFeeInput(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-main)' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Max Active Kitchen Orders Cap</label>
              <input 
                type="number" 
                value={settingsMaxInput}
                onChange={(e) => setSettingsMaxInput(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-main)' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Save Settings 💾
            </button>
          </form>
        </div>

        <div style={{ background: 'var(--bg-panel)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <h3 style={{ margin: '0 0 15px 0', color: 'var(--accent)' }}>Pending Reviews Moderation ({pendingReviews.length})</h3>

          {pendingReviews.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No pending reviews to moderate.</p>
          ) : (
            pendingReviews.map(rev => (
              <div key={rev.id} style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', marginBottom: '10px', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 'bold' }}>
                  <span>{rev.name} ({'⭐'.repeat(rev.rating)})</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{rev.date}</span>
                </div>
                <p style={{ margin: '6px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>"{rev.comment}"</p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button onClick={() => handleApproveReview(rev.id)} style={{ padding: '4px 10px', background: '#4caf50', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer', fontSize: '0.8rem' }}>Approve ✅</button>
                  <button onClick={() => handleDeleteReview(rev.id)} style={{ padding: '4px 10px', background: 'var(--primary)', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer', fontSize: '0.8rem' }}>Delete 🗑️</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
};
