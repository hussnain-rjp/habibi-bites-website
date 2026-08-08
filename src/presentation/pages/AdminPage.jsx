import React, { useState, useEffect, useRef } from 'react';
import { useDb } from '../contexts/DbContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { InvoiceFactory } from '../../core/factories/InvoiceFactory.js';
import { RateLimitError } from '../../infrastructure/rateLimiting/RateLimiter.js';
import { sanitizeError } from '../../core/errors/ErrorHandler.js';

export const AdminPage = () => {
  const db = useDb();
  const { isAdmin, loading: isAuthLoading, login, logout } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [backoffSec, setBackoffSec] = useState(0);   // seconds remaining in backoff
  const backoffTimer = useRef(null);

  const [orders, setOrders] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [deliverySettings, setDeliverySettings] = useState({ enabled: false, fee: 150, maxOrders: 50 });
  const [settingsFeeInput, setSettingsFeeInput] = useState(150);
  const [settingsMaxInput, setSettingsMaxInput] = useState(50);
  const [settingsEnabledInput, setSettingsEnabledInput] = useState(false);
  const [menuItemsList, setMenuItemsList] = useState([]);
  const [menuSearchFilter, setMenuSearchFilter] = useState('');
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [menuMsg, setMenuMsg] = useState({ type: '', text: '' });
  const [discountState, setDiscountState] = useState({
    enabled: false,
    type: 'percentage',
    value: 0,
    targetType: 'all',
    targetCategory: '',
    targetItemId: '',
    label: ''
  });
  const [restInfoState, setRestInfoState] = useState({
    name: 'Habibi Bites',
    tagline: 'Fast Food & Traditional Kitchen',
    address: 'Qila Didar Singh, Gujranwala',
    phone: '0302-4411700',
    email: 'habibibites@gmail.com',
    heroImage: '',
    heroText: ''
  });
  const [restMsg, setRestMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData(true);
    }
  }, [isAdmin]);

  // High-performance parallelized data loader
  const loadDashboardData = async (isInitial = false) => {
    try {
      const [fetchedOrders, fetchedReviews, items, s, disc, info] = await Promise.all([
        db.getOrders(),
        db.getPendingReviews(),
        db.getMenuItems(),
        isInitial ? db.getDeliverySettings() : Promise.resolve(null),
        isInitial ? db.getDiscountSettings() : Promise.resolve(null),
        isInitial ? db.getRestaurantInfo() : Promise.resolve(null)
      ]);

      setOrders(fetchedOrders || []);
      setPendingReviews(fetchedReviews || []);
      setMenuItemsList(items || []);

      if (isInitial) {
        if (s) {
          setDeliverySettings(s);
          setSettingsFeeInput(s.fee);
          setSettingsMaxInput(s.maxOrders);
          setSettingsEnabledInput(s.enabled);
        }
        if (disc) setDiscountState(disc);
        if (info) setRestInfoState(info);
      }
    } catch (e) {
      console.error("Dashboard loading error:", e);
    }
  };

  const handleSaveDiscount = async (e) => {
    e.preventDefault();
    await db.saveDiscountSettings(discountState);
    alert('Promotional discount settings saved successfully!');
    loadDashboardData();
  };

  // Start a visible countdown when rate limited
  const startBackoffCountdown = (waitMs) => {
    if (backoffTimer.current) clearInterval(backoffTimer.current);
    const endTime = Date.now() + waitMs;
    setBackoffSec(Math.ceil(waitMs / 1000));
    backoffTimer.current = setInterval(() => {
      const remaining = Math.ceil((endTime - Date.now()) / 1000);
      if (remaining <= 0) {
        clearInterval(backoffTimer.current);
        setBackoffSec(0);
      } else {
        setBackoffSec(remaining);
      }
    }, 1000);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (backoffSec > 0) return; // blocked — button is disabled but guard anyway
    setAuthError('');
    setAuthLoading(true);
    try {
      const success = await login(username, password);
      if (!success) setAuthError('Invalid credentials.');
    } catch (err) {
      if (err instanceof RateLimitError) {
        setAuthError(err.message);
        startBackoffCountdown(err.waitMs);
      } else {
        setAuthError(sanitizeError(err, 'Login failed. Please verify your credentials.'));
      }
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

  const handleSaveMenuItem = async (e) => {
    e.preventDefault();
    if (!editingMenuItem || !editingMenuItem.name) return;
    try {
      if (db.saveMenuItem) {
        await db.saveMenuItem(editingMenuItem);
      } else if (editingMenuItem.id) {
        await db.updateMenuItem(editingMenuItem);
      } else {
        await db.addMenuItem(editingMenuItem);
      }
      setMenuMsg({ type: 'success', text: `✅ Menu item "${editingMenuItem.name}" saved successfully!` });
      setTimeout(() => setMenuMsg({ type: '', text: '' }), 4000);
      setEditingMenuItem(null);
      loadDashboardData();
    } catch (err) {
      setMenuMsg({ type: 'error', text: `⚠️ ${err.message || 'Failed to save menu item.'}` });
    }
  };

  const handleDeleteMenuItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this menu item?")) return;
    try {
      await db.deleteMenuItem(itemId);
      setMenuMsg({ type: 'success', text: '✅ Menu item deleted successfully!' });
      setTimeout(() => setMenuMsg({ type: '', text: '' }), 4000);
      loadDashboardData();
    } catch (err) {
      setMenuMsg({ type: 'error', text: `⚠️ ${err.message || 'Failed to delete menu item.'}` });
    }
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

  if (isAuthLoading) {
    return (
      <main className="section-container page-top-margin" style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔒</div>
        <h2 style={{ color: 'var(--accent)' }}>Verifying Administrator Credentials...</h2>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="section-container page-top-margin">
        <div style={{ maxWidth: '440px', margin: '50px auto', background: 'var(--bg-panel)', padding: '36px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ width: '70px', height: '70px', margin: '0 auto 12px auto', borderRadius: '50%', background: 'rgba(217,164,65,0.15)', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem' }}>
              🔐
            </div>
            <h2 style={{ margin: '8px 0 4px 0', color: 'var(--accent)', fontSize: '1.6rem', fontWeight: 800 }}>Store Manager Login</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Enter your admin password to open kitchen control panel.</p>
          </div>

          {authError && (
            <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', marginBottom: '20px', fontSize: '0.9rem', fontWeight: 600 }}>
              ⚠️ {authError}
            </div>
          )}

          {backoffSec > 0 && (
            <div style={{ padding: '14px 16px', borderRadius: '8px', background: 'rgba(245, 166, 35, 0.12)', border: '1px solid rgba(245, 166, 35, 0.4)', color: 'var(--accent)', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>⏳</div>
              <strong>Please wait before trying again</strong>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, margin: '6px 0' }}>{backoffSec}s</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Login will unlock automatically</div>
            </div>
          )}

          <form onSubmit={handleLoginSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '6px', color: 'var(--text-main)' }}>Username / Email</label>
              <input 
                type="text" 
                required 
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', fontSize: '0.95rem' }}
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '6px', color: 'var(--text-main)' }}>Password</label>
              <input 
                type="password" 
                required 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', fontSize: '0.95rem' }}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={authLoading || backoffSec > 0}
              style={{ width: '100%', padding: '14px', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, borderRadius: '8px', opacity: (authLoading || backoffSec > 0) ? 0.5 : 1, cursor: (authLoading || backoffSec > 0) ? 'not-allowed' : 'pointer' }}
            >
              {authLoading ? 'Signing In...' : backoffSec > 0 ? `Locked — try in ${backoffSec}s` : 'Open Kitchen Panel ➔'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  // Color helper for order status badges
  const getStatusColor = (status) => {
    switch (status) {
      case 'received': return { bg: '#0284c7', color: '#fff', label: '📋 Order Received' };
      case 'queue': return { bg: '#6366f1', color: '#fff', label: '⏳ In Queue' };
      case 'cooking': return { bg: '#d97706', color: '#fff', label: '👨‍🍳 Cooking in Kitchen' };
      case 'packing': return { bg: '#8b5cf6', color: '#fff', label: '📦 Packing Order' };
      case 'delivery': return { bg: '#0284c7', color: '#fff', label: '🛵 Out for Delivery' };
      case 'delivered': return { bg: '#16a34a', color: '#fff', label: '✅ Delivered' };
      case 'cancelled': return { bg: '#dc2626', color: '#fff', label: '❌ Cancelled' };
      default: return { bg: '#4b5563', color: '#fff', label: status };
    }
  };

  return (
    <main className="section-container page-top-margin">
      {/* Top Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '25px', background: 'var(--bg-panel)', padding: '20px 24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <div>
          <span style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Habibi Kitchen Command</span>
          <h1 style={{ margin: '2px 0 0 0', fontSize: '1.8rem', color: '#fff', fontWeight: 800 }}>Store Manager Dashboard</h1>
        </div>
        <button onClick={logout} className="btn btn-outline" style={{ borderColor: '#ef4444', color: '#ef4444', fontWeight: 700, padding: '10px 18px' }}>
          Logout 🚪
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(217,164,65,0.12), var(--bg-panel))', padding: '22px', borderRadius: '12px', border: '1px solid var(--accent)', textAlign: 'left' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 700, marginBottom: '6px' }}>💰 Today's Revenue</div>
          <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#fff' }}>Rs. {totalRevenue.toLocaleString()}</div>
        </div>

        <div style={{ background: 'var(--bg-panel)', padding: '22px', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'left' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '6px' }}>📦 Total Orders Received</div>
          <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#fff' }}>{totalOrders}</div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, rgba(217,83,79,0.15), var(--bg-panel))', padding: '22px', borderRadius: '12px', border: '1px solid var(--primary)', textAlign: 'left' }}>
          <div style={{ fontSize: '0.85rem', color: '#ff6b6b', fontWeight: 700, marginBottom: '6px' }}>🔥 Active Kitchen Queue</div>
          <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#ff6b6b' }}>{activeCount} <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>orders</span></div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, rgba(22,163,74,0.15), var(--bg-panel))', padding: '22px', borderRadius: '12px', border: '1px solid #16a34a', textAlign: 'left' }}>
          <div style={{ fontSize: '0.85rem', color: '#4ade80', fontWeight: 700, marginBottom: '6px' }}>✅ Successfully Delivered</div>
          <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#4ade80' }}>{deliveredOrders.length}</div>
        </div>
      </div>

      {/* Main Live Orders Section */}
      <div style={{ background: 'var(--bg-panel)', padding: '24px', borderRadius: '14px', border: '1px solid var(--border)', marginBottom: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <h2 style={{ margin: 0, color: 'var(--accent)', fontSize: '1.3rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚡ Live Kitchen Orders Feed</span>
            <span style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '20px', background: 'var(--primary)', color: '#fff' }}>Auto-Syncing</span>
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Click the dropdown status to update kitchen progress</span>
        </div>

        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🍽️</div>
            <h3 style={{ margin: 0, color: '#fff' }}>No Active Orders in Kitchen</h3>
            <p style={{ margin: '6px 0 0 0', fontSize: '0.9rem' }}>New customer orders placed on the website will appear here automatically.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.92rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '14px 10px' }}>Order Number</th>
                  <th style={{ padding: '14px 10px' }}>Customer Info</th>
                  <th style={{ padding: '14px 10px' }}>Items Ordered</th>
                  <th style={{ padding: '14px 10px' }}>Total Amount</th>
                  <th style={{ padding: '14px 10px' }}>Order Status</th>
                  <th style={{ padding: '14px 10px' }}>Print Receipt</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => {
                  const statusInfo = getStatusColor(order.status);
                  return (
                    <tr key={order.id} style={{ borderBottom: '1px solid var(--border-light)', background: 'var(--bg-elevated)' }}>
                      <td style={{ padding: '16px 10px', verticalAlign: 'top' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--accent)', background: 'rgba(217,164,65,0.1)', padding: '6px 12px', borderRadius: '6px', display: 'inline-block' }}>
                          {order.id}
                        </span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                          {new Date(order.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td style={{ padding: '16px 10px', verticalAlign: 'top' }}>
                        <strong style={{ fontSize: '1rem', color: '#fff', display: 'block' }}>{order.customer?.name}</strong>
                        <div style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 700, margin: '2px 0' }}>
                          📞 {order.customer?.phone}
                        </div>
                        {order.customer?.address && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '200px' }}>
                            📍 {order.customer?.address}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '16px 10px', verticalAlign: 'top', fontSize: '0.9rem' }}>
                        {(order.items || []).map((item, idx) => (
                          <div key={idx} style={{ marginBottom: '4px', lineHeight: '1.4' }}>
                            <span style={{ fontWeight: 800, color: 'var(--accent)' }}>{item.quantity}x</span> {item.name}
                            {item.options?.size && <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}> ({item.options.size})</span>}
                          </div>
                        ))}
                      </td>

                      <td style={{ padding: '16px 10px', verticalAlign: 'top' }}>
                        <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#4ade80' }}>Rs. {order.total}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          💳 {order.payment || 'Cash on Delivery'}
                        </div>
                      </td>

                      <td style={{ padding: '16px 10px', verticalAlign: 'top' }}>
                        <select 
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          style={{ 
                            padding: '10px 14px', 
                            borderRadius: '8px', 
                            background: statusInfo.bg, 
                            color: statusInfo.color, 
                            border: 'none', 
                            fontWeight: 800, 
                            fontSize: '0.88rem', 
                            cursor: 'pointer',
                            width: '100%',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                          }}
                        >
                          <option value="received">📋 Order Received</option>
                          <option value="queue">⏳ In Queue</option>
                          <option value="cooking">👨‍🍳 Cooking in Kitchen</option>
                          <option value="packing">📦 Packing Order</option>
                          <option value="delivery">🛵 Out for Delivery</option>
                          <option value="delivered">✅ Delivered</option>
                          <option value="cancelled">❌ Cancelled</option>
                        </select>
                      </td>

                      <td style={{ padding: '16px 10px', verticalAlign: 'top' }}>
                        <button 
                          onClick={() => handlePrintInvoice(order)}
                          style={{ 
                            padding: '10px 16px', 
                            background: 'var(--bg-panel)', 
                            border: '1px solid var(--accent)', 
                            borderRadius: '8px', 
                            color: 'var(--accent)', 
                            fontWeight: 800, 
                            fontSize: '0.85rem', 
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          🖨️ Print Receipt
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Secondary Management Cards (Delivery Settings, Discount Manager, & Reviews Moderation) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* Delivery Settings Card */}
        <div style={{ background: 'var(--bg-panel)', padding: '24px', borderRadius: '14px', border: '1px solid var(--border)' }}>
          <h3 style={{ margin: '0 0 16px 0', color: 'var(--accent)', fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🚚 Delivery & Capacity Settings</span>
          </h3>

          <form onSubmit={handleSaveSettings}>
            {/* Visual Toggle Switch */}
            <div 
              onClick={() => setSettingsEnabledInput(!settingsEnabledInput)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '12px 16px', 
                background: settingsEnabledInput ? 'rgba(22, 163, 74, 0.15)' : 'var(--bg-elevated)', 
                borderRadius: '10px', 
                marginBottom: '16px', 
                cursor: 'pointer', 
                border: `2px solid ${settingsEnabledInput ? '#16a34a' : 'var(--border)'}`,
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.2rem' }}>{settingsEnabledInput ? '🟢' : '⚪'}</span>
                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: settingsEnabledInput ? '#4ade80' : '#fff' }}>
                  {settingsEnabledInput ? 'Delivery Fee ENABLED' : 'Delivery Fee DISABLED'}
                </span>
              </div>
              <div style={{ width: '48px', height: '26px', borderRadius: '20px', background: settingsEnabledInput ? '#16a34a' : '#4b5563', position: 'relative', transition: 'all 0.2s ease' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: settingsEnabledInput ? '25px' : '3px', transition: 'all 0.2s ease' }} />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>Delivery Charge Amount (Rs.)</label>
              <input 
                type="number" 
                value={settingsFeeInput}
                onChange={(e) => setSettingsFeeInput(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', fontSize: '0.95rem' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>Maximum Orders Kitchen Limit</label>
              <input 
                type="number" 
                value={settingsMaxInput}
                onChange={(e) => setSettingsMaxInput(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', fontSize: '0.95rem' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', justifyContent: 'center', fontWeight: 700 }}>
              Save Settings 💾
            </button>
          </form>
        </div>

        {/* Promotional Discount Manager Card */}
        <div style={{ background: 'var(--bg-panel)', padding: '24px', borderRadius: '14px', border: '1px solid var(--border)' }}>
          <h3 style={{ margin: '0 0 16px 0', color: 'var(--accent)', fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🎁 Promotional Discount Manager</span>
          </h3>

          <form onSubmit={handleSaveDiscount}>
            {/* Visual Toggle Switch */}
            <div 
              onClick={() => setDiscountState(prev => ({ ...prev, enabled: !prev.enabled }))}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justify: 'space-between',
                padding: '12px 16px', 
                background: discountState.enabled ? 'rgba(22, 163, 74, 0.15)' : 'var(--bg-elevated)', 
                borderRadius: '10px', 
                marginBottom: '16px', 
                cursor: 'pointer', 
                border: `2px solid ${discountState.enabled ? '#16a34a' : 'var(--border)'}`,
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.2rem' }}>{discountState.enabled ? '🟢' : '⚪'}</span>
                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: discountState.enabled ? '#4ade80' : '#fff' }}>
                  {discountState.enabled ? 'Store Discount is ACTIVE' : 'Store Discount is OFF'}
                </span>
              </div>
              <div style={{ width: '48px', height: '26px', borderRadius: '20px', background: discountState.enabled ? '#16a34a' : '#4b5563', position: 'relative', transition: 'all 0.2s ease' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: discountState.enabled ? '25px' : '3px', transition: 'all 0.2s ease' }} />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>Discount Type</label>
              <select
                value={discountState.type}
                onChange={(e) => setDiscountState(prev => ({ ...prev, type: e.target.value }))}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', fontSize: '0.95rem' }}
              >
                <option value="percentage">Percentage (%) OFF</option>
                <option value="fixed">Fixed Amount (Rs.) OFF</option>
              </select>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                Discount Value ({discountState.type === 'percentage' ? '%' : 'Rs.'})
              </label>
              <input 
                type="number" 
                min="0"
                value={discountState.value}
                onChange={(e) => setDiscountState(prev => ({ ...prev, value: e.target.value }))}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', fontSize: '0.95rem' }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>Apply Discount To</label>
              <select
                value={discountState.targetType}
                onChange={(e) => setDiscountState(prev => ({ ...prev, targetType: e.target.value }))}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', fontSize: '0.95rem' }}
              >
                <option value="all">🌐 All Items (Store-Wide Discount)</option>
                <option value="category">📁 Specific Food Category</option>
                <option value="item">🍔 Specific Menu Item</option>
              </select>
            </div>

            {discountState.targetType === 'category' && (
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>Select Target Category</label>
                <select
                  value={discountState.targetCategory}
                  onChange={(e) => setDiscountState(prev => ({ ...prev, targetCategory: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', fontSize: '0.95rem' }}
                >
                  <option value="">-- Choose Category --</option>
                  {[...new Set(menuItemsList.map(i => i.category).filter(Boolean))].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            )}

            {discountState.targetType === 'item' && (
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>Select Target Item</label>
                <select
                  value={discountState.targetItemId}
                  onChange={(e) => setDiscountState(prev => ({ ...prev, targetItemId: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', fontSize: '0.95rem' }}
                >
                  <option value="">-- Choose Item --</option>
                  {menuItemsList.map(i => (
                    <option key={i.id} value={i.id}>{i.name} (Rs. {i.price})</option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>Custom Sale Banner Label (Optional)</label>
              <input 
                type="text"
                placeholder="e.g. Weekend Flash Sale"
                value={discountState.label}
                onChange={(e) => setDiscountState(prev => ({ ...prev, label: e.target.value }))}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', fontSize: '0.95rem' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', justifyContent: 'center', fontWeight: 700 }}>
              Save Discount Settings 🏷️
            </button>
          </form>
        </div>

        {/* Customer Reviews Moderation Card */}
        <div style={{ background: 'var(--bg-panel)', padding: '24px', borderRadius: '14px', border: '1px solid var(--border)' }}>
          <h3 style={{ margin: '0 0 16px 0', color: 'var(--accent)', fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⭐ Customer Reviews Approval ({pendingReviews.length})</span>
          </h3>

          {pendingReviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 15px', color: 'var(--text-muted)', background: 'var(--bg-elevated)', borderRadius: '10px', border: '1px border-dashed var(--border)' }}>
              <div style={{ fontSize: '2.2rem', marginBottom: '6px' }}>✨</div>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>All customer reviews have been reviewed!</p>
            </div>
          ) : (
            pendingReviews.map(rev => (
              <div key={rev.id} style={{ padding: '14px', background: 'var(--bg-elevated)', borderRadius: '10px', marginBottom: '12px', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', fontWeight: 800, color: '#fff' }}>
                  <span>{rev.name} ({'⭐'.repeat(rev.rating)})</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{rev.date}</span>
                </div>
                <p style={{ margin: '8px 0', fontSize: '0.88rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>"{rev.comment}"</p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button onClick={() => handleApproveReview(rev.id)} style={{ padding: '8px 14px', background: '#16a34a', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}>Approve ✅</button>
                  <button onClick={() => handleDeleteReview(rev.id)} style={{ padding: '8px 14px', background: '#dc2626', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}>Delete 🗑️</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Menu & Prices Manager Card */}
        <div style={{ background: 'var(--bg-panel)', padding: '24px', borderRadius: '14px', border: '1px solid var(--border)', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, color: 'var(--accent)', fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🍕 Menu Items & Instant Price Control ({menuItemsList.length} items)</span>
            </h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text"
                placeholder="🔍 Search item or category..."
                value={menuSearchFilter}
                onChange={e => setMenuSearchFilter(e.target.value)}
                style={{ padding: '8px 14px', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', fontSize: '0.88rem', minWidth: '220px' }}
              />
              <button 
                onClick={() => setEditingMenuItem({ id: `item_${Date.now()}`, name: '', category: 'burgers', description: '', prices: { single: 500 }, image: '' })}
                className="btn btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: 800 }}
              >
                + Add New Item
              </button>
            </div>
          </div>

          {menuMsg.text && (
            <div style={{ padding: '10px 14px', borderRadius: '6px', marginBottom: '14px', background: menuMsg.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(76,175,80,0.15)', border: `1px solid ${menuMsg.type === 'error' ? '#ef4444' : '#4caf50'}`, color: menuMsg.type === 'error' ? '#fca5a5' : '#4caf50', fontWeight: 'bold' }}>
              {menuMsg.text}
            </div>
          )}

          {editingMenuItem && (
            <form onSubmit={handleSaveMenuItem} style={{ background: 'var(--bg-elevated)', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid var(--accent)' }}>
              <h4 style={{ margin: '0 0 14px 0', color: 'var(--accent)' }}>Editing: {editingMenuItem.name || 'New Item'}</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Item Name</label>
                  <input type="text" required value={editingMenuItem.name || ''} onChange={e => setEditingMenuItem({ ...editingMenuItem, name: e.target.value })} style={{ width: '100%', padding: '8px', background: 'var(--bg-panel)', border: '1px solid var(--border)', color: '#fff', borderRadius: '6px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Category</label>
                  <input type="text" required value={editingMenuItem.category || ''} onChange={e => setEditingMenuItem({ ...editingMenuItem, category: e.target.value })} style={{ width: '100%', padding: '8px', background: 'var(--bg-panel)', border: '1px solid var(--border)', color: '#fff', borderRadius: '6px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Default / Single Price (Rs.)</label>
                  <input 
                    type="number" 
                    value={typeof editingMenuItem.prices === 'object' ? (editingMenuItem.prices?.single || editingMenuItem.prices?.regular || Object.values(editingMenuItem.prices)[0] || 0) : editingMenuItem.prices || 0} 
                    onChange={e => setEditingMenuItem({ ...editingMenuItem, prices: { ...editingMenuItem.prices, single: Number(e.target.value) } })} 
                    style={{ width: '100%', padding: '8px', background: 'var(--bg-panel)', border: '1px solid var(--border)', color: '#fff', borderRadius: '6px' }} 
                  />
                </div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Description</label>
                <input type="text" value={editingMenuItem.description || ''} onChange={e => setEditingMenuItem({ ...editingMenuItem, description: e.target.value })} style={{ width: '100%', padding: '8px', background: 'var(--bg-panel)', border: '1px solid var(--border)', color: '#fff', borderRadius: '6px' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setEditingMenuItem(null)} className="btn btn-outline" style={{ padding: '8px 16px' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px', fontWeight: 800 }}>Save Item 💾</button>
              </div>
            </form>
          )}

          <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--border-light)', borderRadius: '10px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px 14px' }}>Item Name</th>
                  <th style={{ padding: '10px 14px' }}>Category</th>
                  <th style={{ padding: '10px 14px' }}>Price(s)</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {menuItemsList
                  .filter(i => !menuSearchFilter || i.name?.toLowerCase().includes(menuSearchFilter.toLowerCase()) || i.category?.toLowerCase().includes(menuSearchFilter.toLowerCase()))
                  .map(item => {
                    const priceDisplay = typeof item.prices === 'object' && item.prices !== null
                      ? Object.entries(item.prices).map(([k, v]) => `${k.toUpperCase()}: Rs. ${v}`).join(', ')
                      : `Rs. ${item.prices || item.price || 0}`;
                    return (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: '#fff' }}>{item.name}</td>
                        <td style={{ padding: '10px 14px', color: 'var(--accent)', textTransform: 'capitalize' }}>{item.category}</td>
                        <td style={{ padding: '10px 14px', color: '#4ade80', fontWeight: 700 }}>{priceDisplay}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                          <button onClick={() => setEditingMenuItem(item)} style={{ padding: '4px 10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--accent)', cursor: 'pointer', marginRight: '6px', fontSize: '0.8rem', fontWeight: 700 }}>✏️ Edit</button>
                          <button onClick={() => handleDeleteMenuItem(item.id)} style={{ padding: '4px 10px', background: 'rgba(220,38,38,0.2)', border: '1px solid #dc2626', borderRadius: '6px', color: '#fca5a5', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}>🗑️ Delete</button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Restaurant Info & Home Hero Settings Card */}
        <div style={{ background: 'var(--bg-panel)', padding: '24px', borderRadius: '14px', border: '1px solid var(--border)' }}>
          <h3 style={{ margin: '0 0 16px 0', color: 'var(--accent)', fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🏪 Restaurant Info & Home Hero Settings</span>
          </h3>

          {restMsg.text && (
            <div style={{ padding: '10px 14px', borderRadius: '6px', marginBottom: '14px', background: 'rgba(76,175,80,0.15)', border: '1px solid #4caf50', color: '#4caf50', fontWeight: 'bold' }}>
              {restMsg.text}
            </div>
          )}

          <form onSubmit={async (e) => {
            e.preventDefault();
            await db.saveRestaurantInfo(restInfoState);
            setRestMsg({ type: 'success', text: '✅ Restaurant info & Home Hero settings saved!' });
            setTimeout(() => setRestMsg({ type: '', text: '' }), 4000);
          }}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-main)' }}>Restaurant Name</label>
              <input type="text" value={restInfoState.name} onChange={e => setRestInfoState(prev => ({ ...prev, name: e.target.value }))} style={{ width: '100%', padding: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', borderRadius: '8px' }} />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-main)' }}>Tagline / Slogan</label>
              <input type="text" value={restInfoState.tagline} onChange={e => setRestInfoState(prev => ({ ...prev, tagline: e.target.value }))} style={{ width: '100%', padding: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', borderRadius: '8px' }} />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-main)' }}>Full Address</label>
              <input type="text" value={restInfoState.address} onChange={e => setRestInfoState(prev => ({ ...prev, address: e.target.value }))} style={{ width: '100%', padding: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', borderRadius: '8px' }} />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '4px', color: 'var(--accent)' }}>📞 Phone Number (Editable)</label>
              <input type="text" value={restInfoState.phone} onChange={e => setRestInfoState(prev => ({ ...prev, phone: e.target.value }))} placeholder="e.g. 0302-4411700" style={{ width: '100%', padding: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', borderRadius: '8px' }} />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-main)' }}>Email Address</label>
              <input type="text" value={restInfoState.email} onChange={e => setRestInfoState(prev => ({ ...prev, email: e.target.value }))} style={{ width: '100%', padding: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', borderRadius: '8px' }} />
            </div>

            <div style={{ marginBottom: '14px', borderTop: '1px dashed var(--border)', paddingTop: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '4px', color: 'var(--accent)' }}>🖼️ Home Page Hero Banner Image (Upload or URL)</label>
              <input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => setRestInfoState(prev => ({ ...prev, heroImage: reader.result }));
                  reader.readAsDataURL(file);
                }
              }} style={{ width: '100%', padding: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', borderRadius: '8px', marginBottom: '8px' }} />
              <input type="text" value={restInfoState.heroImage} onChange={e => setRestInfoState(prev => ({ ...prev, heroImage: e.target.value }))} placeholder="Or paste image URL" style={{ width: '100%', padding: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', borderRadius: '8px' }} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '4px', color: 'var(--accent)' }}>📝 Home Page Hero Paragraph Description</label>
              <textarea rows={3} value={restInfoState.heroText} onChange={e => setRestInfoState(prev => ({ ...prev, heroText: e.target.value }))} placeholder="e.g. Experience the ultimate flavor fusion..." style={{ width: '100%', padding: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#fff', borderRadius: '8px' }} />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', justifyContent: 'center', fontWeight: 700 }}>
              Save Restaurant & Home Settings 💾
            </button>
          </form>
        </div>

      </div>
    </main>
  );
};
