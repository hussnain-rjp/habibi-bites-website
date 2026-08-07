import React, { useState, useEffect } from 'react';
import { useDb } from '../contexts/DbContext.jsx';
import { DealCard } from '../components/DealCard.jsx';

export const DealsPage = () => {
  const db = useDb();
  const [deals, setDeals] = useState([]);
  const [discountRule, setDiscountRule] = useState(null);

  useEffect(() => {
    loadDeals();
    const loadDisc = () => db.getDiscountSettings().then(setDiscountRule).catch(() => {});
    loadDisc();
    window.addEventListener('storage_changed', loadDisc);
    return () => window.removeEventListener('storage_changed', loadDisc);
  }, []);

  const loadDeals = async () => {
    const fetchedDeals = await db.getDeals();
    setDeals(fetchedDeals);
  };

  return (
    <main className="section-container page-top-margin">
      {discountRule && discountRule.enabled && (
        <div style={{ 
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)', 
          color: '#000', 
          padding: '16px 24px', 
          marginBottom: '30px', 
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

      <div className="section-header">
        <span className="section-subtitle">Super Saver Combos</span>
        <h1 className="section-title">Habibi Exclusive Deals</h1>
        <p style={{ color: 'var(--text-muted)' }}>Get the maximum value for your hunger. Handcrafted combo packs created for friends, family, and celebrations.</p>
      </div>

      <div className="deals-grid" id="deals-cards-container">
        {deals.map(deal => (
          <DealCard key={deal.id} deal={deal} />
        ))}
      </div>
    </main>
  );
};
