import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext.jsx';
import { CustomizationPricingStrategy } from '../../core/strategies/PricingStrategy.js';

export const CustomizationModal = ({ item, onClose }) => {
  const { addToCart } = useCart();

  const [selectedSize, setSelectedSize] = useState('small');
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [quantity, setQuantity] = useState(1);

  const availableSizes = item?.prices ? Object.keys(item.prices) : ['default'];

  useEffect(() => {
    if (availableSizes.length > 0) {
      setSelectedSize(availableSizes[0]);
    }
  }, [item]);

  if (!item) return null;

  const basePrice = item.prices ? (item.prices[selectedSize] || Object.values(item.prices)[0] || 0) : 0;
  
  const unitPrice = CustomizationPricingStrategy.calculateItemTotal(
    basePrice,
    selectedSize,
    null,
    selectedAddons
  );

  const totalPrice = unitPrice * quantity;

  const handleAddonToggle = (addon) => {
    setSelectedAddons(prev => {
      const exists = prev.some(a => a.id === addon.id);
      if (exists) return prev.filter(a => a.id !== addon.id);
      return [...prev, addon];
    });
  };

  const handleAddToCart = () => {
    const configuredItem = {
      id: item.id,
      name: item.name,
      price: unitPrice,
      quantity,
      options: {
        size: selectedSize,
        addons: selectedAddons
      }
    };
    addToCart(configuredItem);
    onClose();
  };

  const addonsList = window.HABIBI_MENU?.addons || [
    { id: "garlic_mayo", name: "Garlic Mayo Sauce", price: 80 },
    { id: "habibi_special_sauce", name: "Habibi Special Sauce", price: 100 },
    { id: "extra_cheese", name: "Extra Cheese Slice", price: 60 },
    { id: "extra_patty", name: "Extra Chicken Patty", price: 150 }
  ];

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px' }}>
      <div className="custom-modal" style={{ width: '100%', maxWidth: '520px', background: 'var(--bg-dark)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
        
        <div className="modal-header" style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-panel)' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Customize {item.name}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-main)', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
        </div>

        <div className="modal-body" style={{ padding: '20px', maxHeight: '65vh', overflowY: 'auto' }}>
          
          {/* Size Selector */}
          {availableSizes.length > 1 && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: 'var(--accent)' }}>Select Size:</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px' }}>
                {availableSizes.map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    style={{
                      padding: '10px',
                      borderRadius: 'var(--radius-sm)',
                      border: selectedSize === size ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                      background: selectedSize === size ? 'var(--primary-glow)' : 'var(--bg-panel)',
                      color: 'var(--text-main)',
                      fontWeight: selectedSize === size ? 'bold' : 'normal',
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      fontSize: '0.85rem'
                    }}
                  >
                    {size}<br/>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Rs. {item.prices[size]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Addons Selector */}
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: 'var(--accent)' }}>Extra Dips & Addons:</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {addonsList.map(addon => {
                const isSelected = selectedAddons.some(a => a.id === addon.id);
                return (
                  <label 
                    key={addon.id} 
                    style={{ 
                      display: 'flex', 
                      justify: 'space-between', 
                      alignItems: 'center', 
                      padding: '10px 14px', 
                      borderRadius: 'var(--radius-sm)', 
                      background: isSelected ? 'var(--primary-glow)' : 'var(--bg-panel)', 
                      border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-light)', 
                      cursor: 'pointer' 
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input 
                        type="checkbox" 
                        checked={isSelected} 
                        onChange={() => handleAddonToggle(addon)} 
                      />
                      <span>{addon.name}</span>
                    </div>
                    <span style={{ fontWeight: 'bold', color: 'var(--accent)', fontSize: '0.85rem' }}>+ Rs. {addon.price}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Quantity Selector */}
          <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 'bold' }}>Quantity:</span>
            <div style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--bg-panel)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              <button 
                type="button" 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{ padding: '6px 14px', background: 'none', border: 'none', color: 'var(--text-main)', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                -
              </button>
              <span style={{ padding: '0 12px', fontWeight: 'bold' }}>{quantity}</span>
              <button 
                type="button" 
                onClick={() => setQuantity(quantity + 1)}
                style={{ padding: '6px 14px', background: 'none', border: 'none', color: 'var(--text-main)', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                +
              </button>
            </div>
          </div>

        </div>

        <div className="modal-footer" style={{ padding: '16px 20px', borderTop: '1px solid var(--border-light)', background: 'var(--bg-panel)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Price</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent)' }}>Rs. {totalPrice.toLocaleString()}</div>
          </div>
          <button className="btn btn-primary" onClick={handleAddToCart}>
            Add to Basket
          </button>
        </div>

      </div>
    </div>
  );
};
