import { useState } from 'react';
import api from '../../utils/api';
import { X, Star } from 'lucide-react';
import './Modal.css';

export default function ReviewModal({ session, partner, onClose, onSubmit }) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/reviews', { session: session._id, reviewee: partner._id, rating, comment });
      onSubmit();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal glass-card animate-fade-in" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h2><Star size={18} /> Rate {partner.name}</h2>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form className="modal-form" onSubmit={submit}>
          {error && <div className="auth-error">{error}</div>}

          <div className="form-group" style={{ alignItems: 'center', gap: 12 }}>
            <label className="form-label">Your Rating</label>
            <div className="star-rating">
              {[1,2,3,4,5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="star-btn"
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    size={32}
                    fill={(hover || rating) >= star ? 'var(--warning)' : 'none'}
                    color={(hover || rating) >= star ? 'var(--warning)' : 'var(--border)'}
                  />
                </button>
              ))}
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][hover || rating]}
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Your Review (optional)</label>
            <textarea
              className="form-input"
              rows={4}
              placeholder={`How was your experience learning with ${partner.name}?`}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? <span className="animate-spin btn-spinner" /> : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
}
