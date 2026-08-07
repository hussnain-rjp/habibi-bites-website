import React, { useState, useEffect } from 'react';
import { useDb } from '../contexts/DbContext.jsx';
import { RateLimitError } from '../../infrastructure/rateLimiting/RateLimiter.js';
import { validateForm } from '../../core/validation/Validator.js';
import { sanitizeError } from '../../core/errors/ErrorHandler.js';

export const ReviewsPage = () => {
  const db = useDb();
  const [reviews, setReviews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    const data = await db.getReviews();
    setReviews(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;
    setReviewError('');
    setFieldErrors({});

    // ── Client-side schema validation ──
    const { valid, errors } = validateForm(
      { name: 'reviewName', rating: 'reviewRating', comment: 'reviewComment' },
      { name: name.trim(), rating: Number(rating), comment: comment.trim() },
      { name: 'Your Name', rating: 'Star Rating', comment: 'Your Comment' }
    );
    if (!valid) {
      setFieldErrors(errors);
      return;
    }

    try {
      await db.addReview(name.trim(), rating, comment.trim());
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setShowModal(false);
        setName('');
        setComment('');
        setReviewError('');
        setFieldErrors({});
      }, 2000);
    } catch (err) {
      setReviewError(sanitizeError(err, 'Could not submit review. Please try again.'));
    }
  };

  return (
    <main className="section-container page-top-margin">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <span className="section-subtitle">Real Customer Feedback</span>
          <h1 className="section-title">What Food Lovers Say</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Write a Review ⭐
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {reviews.map(rev => (
          <div key={rev.id} style={{ background: 'var(--bg-panel)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <strong style={{ fontSize: '1rem' }}>{rev.name}</strong>
              <span style={{ color: 'var(--accent)' }}>{'⭐'.repeat(rev.rating)}</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '12px' }}>"{rev.comment}"</p>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Posted on {rev.date}</span>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px' }}>
          <div className="custom-modal" style={{ width: '100%', maxWidth: '480px', background: 'var(--bg-dark)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', overflow: 'hidden', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: 'var(--accent)' }}>Write a Customer Review</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-main)', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#4caf50' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>✅</div>
                <h4>Thank You!</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Your review has been submitted for moderation.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                {reviewError && (
                  <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.12)', border: '1px solid #ef4444', color: '#fca5a5', marginBottom: '14px', fontSize: '0.88rem', fontWeight: 600 }}>
                    {reviewError}
                  </div>
                )}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '4px' }}>Your Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Hamza Malik"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setFieldErrors(p => ({ ...p, name: undefined })); }}
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-elevated)', border: `1px solid ${fieldErrors.name ? '#ef4444' : 'var(--border)'}`, color: 'var(--text-main)' }}
                  />
                  {fieldErrors.name && <span style={{ color: '#fca5a5', fontSize: '0.78rem', fontWeight: 600, display: 'block', marginTop: '3px' }}>⚠ {fieldErrors.name}</span>}
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '4px' }}>Rating *</label>
                  <select 
                    value={rating} 
                    onChange={(e) => setRating(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-main)' }}
                  >
                    <option value="5">⭐⭐⭐⭐⭐ (5/5 Excellent)</option>
                    <option value="4">⭐⭐⭐⭐ (4/5 Very Good)</option>
                    <option value="3">⭐⭐⭐ (3/5 Average)</option>
                    <option value="2">⭐⭐ (2/5 Below Expectation)</option>
                    <option value="1">⭐ (1/5 Poor)</option>
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '4px' }}>Your Experience / Comments *</label>
                  <textarea
                    rows="4"
                    placeholder="Tell us about the food crunch, taste, delivery speed..."
                    value={comment}
                    onChange={(e) => { setComment(e.target.value); setFieldErrors(p => ({ ...p, comment: undefined })); }}
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-elevated)', border: `1px solid ${fieldErrors.comment ? '#ef4444' : 'var(--border)'}`, color: 'var(--text-main)' }}
                  />
                  {fieldErrors.comment && <span style={{ color: '#fca5a5', fontSize: '0.78rem', fontWeight: 600, display: 'block', marginTop: '3px' }}>⚠ {fieldErrors.comment}</span>}
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  Submit Review ➔
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
};
