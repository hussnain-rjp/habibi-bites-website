import React, { useState } from 'react';

export const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="section-container page-top-margin">
      <div className="section-header">
        <span className="section-subtitle">Get in Touch</span>
        <h1 className="section-title">Contact Habibi Bites</h1>
        <p style={{ color: 'var(--text-muted)' }}>Have a question or feedback about an order? Reach out to our team.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginTop: '20px' }}>
        
        {/* Contact Info Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ background: 'var(--bg-panel)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <h3 style={{ color: 'var(--accent)', marginTop: 0 }}>📍 Branch Address</h3>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Main Boulevard, Qila Didar Singh, Gujranwala, Punjab, Pakistan.</p>
          </div>

          <div style={{ background: 'var(--bg-panel)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <h3 style={{ color: 'var(--accent)', marginTop: 0 }}>📞 Phone & WhatsApp</h3>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Hotline: 0300-1234567 / 0321-7654321</p>
          </div>

          <div style={{ background: 'var(--bg-panel)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <h3 style={{ color: 'var(--accent)', marginTop: 0 }}>⏰ Kitchen Operating Hours</h3>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Mon - Fri: 12:00 PM - 02:00 AM<br/>Sat - Sun: 12:00 PM - 03:00 AM</p>
          </div>

          <div style={{ background: 'var(--bg-panel)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <h3 style={{ color: 'var(--accent)', marginTop: 0 }}>📱 Follow Us on Social Media</h3>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <a href="https://www.facebook.com/share/195qQ7gAJp/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-main)', background: '#1877f2', padding: '8px 14px', borderRadius: '6px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 'bold' }}>Facebook</a>
              <a href="https://www.instagram.com/habibi_bites_qds?igsh=ZDEyNDFqY2JhMmIx" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-main)', background: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', padding: '8px 14px', borderRadius: '6px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 'bold' }}>Instagram</a>
              <a href="https://www.tiktok.com/@habibi_qila?_r=1&_t=ZS-98gtpRf8j8q" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-main)', background: '#000', border: '1px solid var(--border-light)', padding: '8px 14px', borderRadius: '6px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 'bold' }}>TikTok</a>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div style={{ background: 'var(--bg-panel)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <h3 style={{ marginTop: 0, color: 'var(--accent)' }}>Send Us a Message</h3>

          {submitted ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#4caf50' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📬</div>
              <h4>Message Sent!</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Thank you for contacting Habibi Bites. We will reply shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '4px' }}>Your Name *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Hamza Malik"
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '4px' }}>Phone / Email *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="03001234567 or email@domain.com"
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '4px' }}>Message *</label>
                <textarea 
                  required 
                  rows="4"
                  placeholder="How can we assist you today?"
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-main)' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Send Message ➔
              </button>
            </form>
          )}

        </div>

      </div>
    </main>
  );
};
