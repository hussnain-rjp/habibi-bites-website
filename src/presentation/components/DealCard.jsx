import React from 'react';
import { useCart } from '../contexts/CartContext.jsx';

export const DealCard = ({ deal }) => {
  const { addToCart } = useCart();

  const handleAddDeal = () => {
    addToCart({
      id: `deal_${deal.id}`,
      name: deal.name,
      price: deal.price,
      quantity: 1,
      options: { contents: deal.contents }
    });
  };

  return (
    <div className="deal-card" id={`deal-${deal.id}`}>
      {deal.tag && <div className="deal-card-badge">{deal.tag}</div>}
      
      <div className="deal-card-image-box" style={{ height: '190px', position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }}>
        <img 
          src={deal.image || 'assets/hero_food_collage.png'} 
          alt={deal.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }} 
          onError={(e) => { e.target.onerror = null; e.target.src = 'assets/hero_food_collage.png'; }}
        />
        <div className="deal-flyer-glow-ribbon" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 70%)' }}></div>
      </div>
      
      <div className="deal-card-body">
        <h3 className="deal-card-title">
          {deal.name}
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', fontWeight: 'normal' }}>Combo Pack</span>
        </h3>
        <p className="deal-card-contents" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '15px' }}>{deal.contents}</p>
        
        <div className="deal-card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="deal-price" style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent)' }}>Rs. {deal.price}</div>
          <button className="btn btn-primary" onClick={handleAddDeal}>Add to Basket +</button>
        </div>
      </div>
    </div>
  );
};
