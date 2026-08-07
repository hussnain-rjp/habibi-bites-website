import React from 'react';

export const Footer = ({ setActivePage }) => {
  return (
    <footer id="global-footer">
      <div className="footer-grid">
        <div className="footer-col brand-col">
          <h3 className="footer-logo"><span style={{ color: 'var(--primary)' }}>Fiery</span> Habibi Bites</h3>
          <p className="footer-desc">Serving premium fast food, authentic Pakistani handi and karahis, gourmet pizzas, crispy broasts, and cooling shakes in Gujranwala.</p>
          <div className="footer-socials">
            <a href="https://www.facebook.com/share/195qQ7gAJp/" target="_blank" rel="noopener noreferrer" title="Facebook" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-panel)', border: '1px solid var(--border-light)', color: 'var(--text-main)', marginRight: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="https://www.instagram.com/habibi_bites_qds?igsh=ZDEyNDFqY2JhMmIx" target="_blank" rel="noopener noreferrer" title="Instagram" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-panel)', border: '1px solid var(--border-light)', color: 'var(--text-main)', marginRight: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a href="https://www.tiktok.com/@habibi_qila?_r=1&_t=ZS-98gtpRf8j8q" target="_blank" rel="noopener noreferrer" title="TikTok" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-panel)', border: '1px solid var(--border-light)', color: 'var(--text-main)', marginRight: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.74a4.85 4.85 0 01-1.02-.05z"/></svg>
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
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '12px' }}>Main Boulevard, Qila Didar Singh, Gujranwala, Punjab, Pakistan.</p>
          <div className="footer-socials-findus" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <a href="https://www.facebook.com/share/195qQ7gAJp/" target="_blank" rel="noopener noreferrer" title="Facebook" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', background: '#1877f2', color: '#fff', textDecoration: 'none' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="https://www.instagram.com/habibi_bites_qds?igsh=ZDEyNDFqY2JhMmIx" target="_blank" rel="noopener noreferrer" title="Instagram" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', color: '#fff', textDecoration: 'none' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a href="https://www.tiktok.com/@habibi_qila?_r=1&_t=ZS-98gtpRf8j8q" target="_blank" rel="noopener noreferrer" title="TikTok" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', background: '#000', border: '1px solid var(--border-light)', color: '#fff', textDecoration: 'none' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.74a4.85 4.85 0 01-1.02-.05z"/></svg>
            </a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom" style={{ textAlign: 'center', padding: '20px 0', borderTop: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        © {new Date().getFullYear()} Habibi Bites. All Rights Reserved. Crafted with passion.
      </div>
    </footer>
  );
};
