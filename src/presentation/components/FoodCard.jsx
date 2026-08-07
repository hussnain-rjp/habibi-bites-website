import React from 'react';
import { useCart } from '../contexts/CartContext.jsx';

export const FoodCard = ({ item, onCustomize }) => {
  const { addToCart } = useCart();

  let priceDisplay = "";
  let hasMultiplePrices = false;

  if (item.prices) {
    const keys = Object.keys(item.prices);
    if (keys.length === 1) {
      priceDisplay = `Rs. ${item.prices[keys[0]]}`;
    } else {
      hasMultiplePrices = true;
      const pricesArray = Object.values(item.prices);
      const minPrice = Math.min(...pricesArray);
      priceDisplay = `From Rs. ${minPrice}`;
    }
  }

  const handleAction = () => {
    if (hasMultiplePrices || (item.category === 'pizza' || item.category === 'special_pizza')) {
      onCustomize(item);
    } else {
      const defaultPrice = item.prices ? Object.values(item.prices)[0] : 0;
      addToCart({
        id: item.id,
        name: item.name,
        price: defaultPrice,
        quantity: 1
      });
    }
  };

  return (
    <div className="menu-item-row" id={`item-${item.id}`}>
      <img 
        src={item.image || 'assets/hero_food_collage.png'} 
        className="menu-item-img" 
        alt={item.name}
        onError={(e) => { e.target.onerror = null; e.target.src = 'assets/hero_food_collage.png'; }}
      />
      <div className="menu-item-info">
        <h3>{item.name}</h3>
        <p className="menu-item-description">{item.description}</p>
      </div>
      <div className="menu-item-cta">
        <div className="menu-item-main-price" style={{ fontWeight: 'bold', color: 'var(--accent)' }}>{priceDisplay}</div>
        <button className="btn btn-primary" onClick={handleAction}>
          {hasMultiplePrices ? "Choose Options" : "Add to Basket"}
        </button>
      </div>
    </div>
  );
};
