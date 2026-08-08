import React, { useState, useEffect } from 'react';
import { useDb } from '../contexts/DbContext.jsx';
import { FoodCard } from '../components/FoodCard.jsx';
import { CustomizationModal } from '../components/CustomizationModal.jsx';

export const MenuPage = () => {
  const db = useDb();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [selectedCustomizeItem, setSelectedCustomizeItem] = useState(null);
  const [discountRule, setDiscountRule] = useState(null);

  useEffect(() => {
    loadData();
    const handleStorage = () => {
      db.getDiscountSettings().then(setDiscountRule).catch(() => {});
    };
    window.addEventListener('storage_changed', handleStorage);
    return () => window.removeEventListener('storage_changed', handleStorage);
  }, []);

  const loadData = async () => {
    const fetchedItems = await db.getMenuItems();
    setItems(fetchedItems);

    const fetchedDiscount = await db.getDiscountSettings();
    setDiscountRule(fetchedDiscount);

    const defaultCategories = window.HABIBI_MENU?.categories || [
      { id: "pizza", name: "Pizzas" },
      { id: "special_pizza", name: "Special Pizza" },
      { id: "burgers", name: "Burgers" },
      { id: "wraps", name: "Wraps & Rolls" },
      { id: "desi", name: "Desi & Broast" },
      { id: "starters", name: "Starters & Sides" },
      { id: "pasta", name: "Pastas" },
      { id: "drinks", name: "Chil Side & Desserts" }
    ];
    setCategories(defaultCategories);
    if (defaultCategories.length > 0) setActiveCategory(defaultCategories[0].id);
  };

  const scrollToSection = (catId) => {
    setActiveCategory(catId);
    const el = document.getElementById(`section-${catId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="section-container page-top-margin">
      <div className="section-header" style={{ marginBottom: '20px' }}>
        <span className="section-subtitle">Habibi Bites Kitchen</span>
        <h1 className="section-title">Explore Our Online Menu</h1>
        <p style={{ color: 'var(--text-muted)' }}>Satisfy your cravings with our wide variety of fast food and hot desi delicacies.</p>

        {discountRule && discountRule.enabled && (
          <div style={{ marginTop: '16px', background: 'linear-gradient(135deg, rgba(245, 166, 35, 0.15), rgba(255, 192, 77, 0.25))', border: '1px solid var(--accent)', padding: '14px 20px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.8rem' }}>🎁</span>
            <div>
              <strong style={{ color: 'var(--accent)', fontSize: '1.05rem', display: 'block' }}>
                {discountRule.label || 'Special Promotion Active!'}
              </strong>
              <span style={{ fontSize: '0.88rem', color: '#fff' }}>
                Enjoy {discountRule.value}{discountRule.type === 'percentage' ? '%' : ' Rs.'} OFF on {discountRule.targetType === 'all' ? 'all items' : discountRule.targetType === 'category' ? `all ${discountRule.targetCategory}` : 'selected items'}! Discount auto-applied at checkout.
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="menu-layout">
        {/* Sticky Sidebar */}
        <aside className="menu-sidebar-nav" id="menu-categories-sidebar">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`menu-nav-btn ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => scrollToSection(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </aside>

        {/* Scrollable Sections */}
        <section className="menu-sections-wrapper" id="menu-sections-container">
          {categories.map(cat => {
            const specialPizzaIds = [
              'pizza_beef_bonanza', 'pizza_arabic', 'pizza_4in1', 'pizza_donner',
              'pizza_lasagna', 'pizza_cheese_steak', 'pizza_crown_crust',
              'pizza_behri_kabab', 'pizza_cheese_stuff', 'pizza_kabab_stuff', 'pizza_habibi_grill'
            ];
            const catItems = items.filter(i => {
              if (cat.id === 'special_pizza') {
                return i.category === 'special_pizza' || i.type === 'pizza_special' || specialPizzaIds.includes(String(i.id));
              }
              if (cat.id === 'pizza') {
                return (i.category === 'pizza' && i.type !== 'pizza_special' && !specialPizzaIds.includes(String(i.id)));
              }
              return i.category === cat.id;
            });
            return (
              <div className="menu-section" id={`section-${cat.id}`} key={cat.id}>
                <div className="menu-section-header-row">
                  <h2 className="menu-section-title">{cat.name}</h2>
                  <span className="badge badge-accent">{catItems.length} Items</span>
                </div>

                <div className="menu-items-list">
                  {catItems.map(item => (
                    <FoodCard
                      key={item.id}
                      item={item}
                      discountRule={discountRule}
                      onCustomize={(itemToCustomize) => setSelectedCustomizeItem(itemToCustomize)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      </div>

      {/* Customization Modal */}
      {selectedCustomizeItem && (
        <CustomizationModal
          item={selectedCustomizeItem}
          onClose={() => setSelectedCustomizeItem(null)}
        />
      )}
    </main>
  );
};
