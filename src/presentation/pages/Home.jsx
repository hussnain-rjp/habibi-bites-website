import React, { useState, useEffect, useCallback } from 'react';
import { useDb } from '../contexts/DbContext.jsx';
import { DealCard } from '../components/DealCard.jsx';
import { useRealtimeSync } from '../hooks/useRealtimeSync.js';

export const Home = ({ setActivePage }) => {
  const db = useDb();
  const [featuredDeals, setFeaturedDeals] = useState([]);
  const [discountRule, setDiscountRule] = useState(null);
  const [restInfo, setRestInfo] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [deals, disc, info] = await Promise.all([
        db.getDeals(),
        db.getDiscountSettings(),
        db.getRestaurantInfo()
      ]);

      if (deals && Array.isArray(deals)) {
        const selected = deals.filter(d => [1, 7, 10, 13].includes(Number(d.id)));
        const finalDeals = selected.length > 0 ? selected : deals.slice(0, 4);
        setFeaturedDeals(prev => (JSON.stringify(prev) !== JSON.stringify(finalDeals) ? finalDeals : prev));
      }

      if (disc) {
        setDiscountRule(prev => (JSON.stringify(prev) !== JSON.stringify(disc) ? disc : prev));
      }

      if (info) {
        setRestInfo(prev => (JSON.stringify(prev) !== JSON.stringify(info) ? info : prev));
      }
    } catch (e) {}
  }, [db]);


  // Initial data load on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Supabase Realtime subscription — fires for any change on these tables
  // across ALL devices/browsers, not just the current one.
  useRealtimeSync(
    ['deals', 'settings'],
    (_table, _payload) => { loadData(); },
    'home-realtime'
  );

  const heroDescription = restInfo?.heroText || 'Experience the ultimate flavor fusion. From brick-oven pizzas and double-patty beef burgers to clay-pot handis and crispy golden broast, we satisfy every craving.';
  const heroImageSrc = restInfo?.heroImage || '/assets/logo.png';

  return (
    <main>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <span className="hero-tag">🔥 Now Delivering in Qila Didar Singh</span>
            <h1 className="hero-title">Delicious Food <br/>Served with <span>Passion</span></h1>
            <p className="hero-desc">{heroDescription}</p>
            <div className="hero-actions">
              <button onClick={() => setActivePage('menu')} className="btn btn-primary">Order Online Now ➔</button>
              <button onClick={() => setActivePage('deals')} className="btn btn-outline">Explore Hot Deals ⚡</button>
            </div>
          </div>

          <div className="hero-image-wrapper">
            <div className="hero-image-glow"></div>
            <div className="hero-image-container" style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', transform: 'rotate(1deg)' }}>
              <img 
                src={heroImageSrc} 
                alt="Habibi Bites Restaurant Logo" 
                loading="eager"
                decoding="async"
                style={{ width: '100%', maxWidth: '420px', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '24px', boxShadow: '0 10px 30px rgba(217, 164, 65, 0.3), 0 0 25px rgba(217, 83, 79, 0.25)', border: '4px solid var(--accent)', background: '#ffffff', padding: '6px' }}
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
