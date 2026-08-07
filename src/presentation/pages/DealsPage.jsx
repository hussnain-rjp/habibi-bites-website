import React, { useState, useEffect } from 'react';
import { useDb } from '../contexts/DbContext.jsx';
import { DealCard } from '../components/DealCard.jsx';

export const DealsPage = () => {
  const db = useDb();
  const [deals, setDeals] = useState([]);

  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    const fetchedDeals = await db.getDeals();
    setDeals(fetchedDeals);
  };

  return (
    <main className="section-container page-top-margin">
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
