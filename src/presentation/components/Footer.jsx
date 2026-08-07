import React from 'react';

export const Footer = ({ setActivePage }) => {
  return (
    <footer id="global-footer">
      <div className="footer-grid">
        <div className="footer-col brand-col">
          <h3 className="footer-logo"><span style={{ color: 'var(--primary)' }}>Fiery</span> Habibi Bites</h3>
          <p className="footer-desc">Serving premium fast food, authentic Pakistani handi and karahis, gourmet pizzas, crispy broasts, and cooling shakes in Gujranwala.</p>
          <div className="footer-socials">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" title="Facebook" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-panel)', border: '1px solid var(--border-light)', color: 'var(--text-main)', marginRight: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" title="Instagram" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-panel)', border: '1px solid var(--border-light)', color: 'var(--text-main)', marginRight: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
          </div>
        </div>
        
        <div className="footer-col">
          <h4>Working Hours</h4>
          <ul className="footer-hours">
            <li><span>Monday - Friday</span> <span>12:00 PM - 02:00 AM</span></li>
            <li><span>Saturday - Sunday</span> <span>12:00 PM - 03:00 AM</span></li>
            <li className="delivery-highlight" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent)', fontWeight: 700 }}>
              ⚡ Fast Delivery Available!
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Our Kitchen</h4>
          <ul className="footer-links">
            <li><button onClick={() => setActivePage('menu')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}>Gourmet Pizza</button></li>
            <li><button onClick={() => setActivePage('menu')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}>Zingers & Beef Burgers</button></li>
            <li><button onClick={() => setActivePage('menu')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}>Karahi & Spicy Broast</button></li>
            <li><button onClick={() => setActivePage('menu')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}>Cold Shakes & Sides</button></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Find Us</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Main Boulevard, Qila Didar Singh, Gujranwala, Punjab, Pakistan.</p>
        </div>
      </div>
      
      <div className="footer-bottom" style={{ textAlign: 'center', padding: '20px 0', borderTop: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        © {new Date().getFullYear()} Habibi Bites. All Rights Reserved. Crafted with passion.
      </div>
    </footer>
  );
};
