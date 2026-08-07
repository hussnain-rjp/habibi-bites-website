import React from 'react';
import { useCart } from '../contexts/CartContext.jsx';
import { DiscountPricingStrategy } from '../../core/strategies/DiscountPricingStrategy.js';

export const FoodCard = ({ item, onCustomize, discountRule }) => {
  const { addToCart } = useCart();

  let priceDisplay = "";
  let hasMultiplePrices = false;
  let defaultPrice = 0;

  if (item.prices) {
    const keys = Object.keys(item.prices);
    if (keys.length === 1) {
      defaultPrice = parseFloat(item.prices[keys[0]]) || 0;
      priceDisplay = `Rs. ${defaultPrice}`;
    } else {
      hasMultiplePrices = true;
      const pricesArray = Object.values(item.prices).map(p => parseFloat(p) || 0);
      defaultPrice = Math.min(...pricesArray);
      priceDisplay = `From Rs. ${defaultPrice}`;
    }
  }

  // Evaluate discount for this item
  const discInfo = DiscountPricingStrategy.calculateDiscount({ ...item, price: defaultPrice }, discountRule);

  const handleAction = () => {
    if (hasMultiplePrices || (item.category === 'pizza' || item.category === 'special_pizza')) {
      onCustomize(item);
    } else {
      const finalItemPrice = discInfo.isDiscounted ? discInfo.finalPrice : defaultPrice;
      addToCart({
        id: item.id,
        name: item.name,
        price: finalItemPrice,
        originalPrice: defaultPrice,
        quantity: 1
      });
    }
  };

  return (
    <div className="menu-item-row" id={`item-${item.id}`} style={{ position: 'relative' }}>
      <img 
        src={item.image || 'assets/hero_food_collage.png'} 
        className="menu-item-img" 
        alt={item.name}
        onError={(e) => { e.target.onerror = null; e.target.src = 'assets/hero_food_collage.png'; }}
      />
      <div className="menu-item-info">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h3 style={{ margin: 0 }}>{item.name}</h3>
          {discInfo.isDiscounted && (
            <span style={{ background: '#f5a623', color: '#0d0d0d', fontSize: '0.72rem', fontWeight: 900, padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              🔥 {discInfo.badgeLabel}
            </span>
          )}
        </div>
        <p className="menu-item-description">{item.description}</p>
      </div>
      <div className="menu-item-cta">
        <div className="menu-item-main-price">
          {discInfo.isDiscounted && !hasMultiplePrices ? (
            <div>
              <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.85rem', marginRight: '6px' }}>Rs. {discInfo.originalPrice}</span>
              <span style={{ fontWeight: 900, color: '#4ade80', fontSize: '1.1rem' }}>Rs. {discInfo.finalPrice}</span>
            </div>
          ) : (
            <span style={{ fontWeight: 'bold', color: 'var(--accent)' }}>{priceDisplay}</span>
          )}
        </div>
        <button className="btn btn-primary" onClick={handleAction}>
          {hasMultiplePrices ? "Choose Options" : "Add to Basket"}
        </button>
      </div>
    </div>
  );
};
