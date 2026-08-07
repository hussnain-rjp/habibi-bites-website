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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const fetchedItems = await db.getMenuItems();
    setItems(fetchedItems);

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
            const catItems = items.filter(i => i.category === cat.id);
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
