import React, { useState, useEffect } from 'react';
import { useDb } from '../contexts/DbContext.jsx';
import { DealCard } from '../components/DealCard.jsx';

export const Home = ({ setActivePage }) => {
  const db = useDb();
  const [featuredDeals, setFeaturedDeals] = useState([]);
  const [discountRule, setDiscountRule] = useState(null);

  useEffect(() => {
    loadDeals();
    db.getDiscountSettings().then(setDiscountRule).catch(() => {});
  }, []);

  const loadDeals = async () => {
    const deals = await db.getDeals();
    const selected = deals.filter(d => [1, 7, 10, 13].includes(Number(d.id)));
    setFeaturedDeals(selected.length > 0 ? selected : deals.slice(0, 4));
  };

  return (
    <main>
      {/* Promotional Discount Banner */}
      {discountRule && discountRule.enabled && (
        <div style={{ 
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)', 
          color: '#000', 
          padding: '16px 24px', 
          margin: '20px auto 0 auto', 
          maxWidth: '1200px', 
          borderRadius: 'var(--radius-sm)', 
          textAlign: 'center', 
          boxShadow: '0 8px 25px rgba(217, 83, 79, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '1.5rem' }}>🎁</span>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', textTransform: 'uppercase' }}>
              {discountRule.label || 'Special Promotion Active!'}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
              Enjoy {discountRule.value}{discountRule.type === 'percentage' ? '%' : ' Rs.'} OFF on {discountRule.targetType === 'all' ? 'all items' : discountRule.targetType === 'category' ? `all ${discountRule.targetCategory}` : 'selected items'}!
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <span className="hero-tag">🔥 Now Delivering in Qila Didar Singh</span>
            <h1 className="hero-title">Delicious Food <br/>Served with <span>Passion</span></h1>
            <p className="hero-desc">Experience the ultimate flavor fusion. From brick-oven pizzas and double-patty beef burgers to clay-pot handis and crispy golden broast, we satisfy every craving.</p>
            <div className="hero-actions">
              <button onClick={() => setActivePage('menu')} className="btn btn-primary">Order Online Now ➔</button>
              <button onClick={() => setActivePage('deals')} className="btn btn-outline">Explore Hot Deals ⚡</button>
            </div>
          </div>

          <div className="hero-image-wrapper">
            <div className="hero-image-glow"></div>
            <div className="hero-image-container" style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', transform: 'rotate(1deg)' }}>
              <img 
                src="assets/logo.png" 
                alt="Habibi Bites Restaurant Logo" 
                style={{ width: '100%', maxWidth: '420px', aspectRatio: '1/1', objectFit: 'contain', borderRadius: '50%', boxShadow: '0 10px 30px rgba(217, 164, 65, 0.3), 0 0 25px rgba(217, 83, 79, 0.25)', border: '4px solid var(--accent)', background: '#ffffff', padding: '10px' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Kitchen Features */}
      <section className="features-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-subtitle">Why Habibi Bites?</span>
            <h2 className="section-title">The Standard of Freshness</h2>
            <p className="features-desc" style={{ color: 'var(--text-muted)' }}>We don't compromise. Every dough is hand-kneaded, every karahi is slow-cooked to order, and delivery is managed hot to your doorstep.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Lightning Fast Delivery</h3>
              <p>Equipped with hot bag carriers, our riders ensure your pizza and burgers arrive fresh, steaming, and ready to devour.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">👨‍🍳</div>
              <h3>Traditional Wok Masters</h3>
              <p>Our Pakistani handis and karahis are crafted by experienced local chefs using open charcoal flames for authentic smoky flavor.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🍕</div>
              <h3>Hand-Stretched Crusts</h3>
              <p>Our special pizza dough is fermented for 24 hours, hand-stretched, and baked on authentic stone slabs for the perfect bite.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Bestsellers */}
      <section className="featured-menu">
        <div className="section-container">
          <div className="section-header">
            <span className="section-subtitle">Customer Favorites</span>
            <h2 className="section-title">Bestselling Combos</h2>
            <p style={{ color: 'var(--text-muted)' }}>Skip the thinking — order our highest-rated bundle deals packed with massive value.</p>
          </div>

          <div className="deals-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
            {featuredDeals.map(deal => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};
