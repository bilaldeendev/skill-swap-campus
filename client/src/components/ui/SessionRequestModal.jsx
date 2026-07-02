import { useState } from 'react';
import api from '../../utils/api';
import { SKILL_CATEGORIES } from '../../utils/helpers';
import { X, Calendar } from 'lucide-react';
import './Modal.css';

export default function SessionRequestModal({ targetUser, mySkills, onClose }) {
  const [form, setForm] = useState({
    skillOffered: mySkills[0] ? { name: mySkills[0].name, category: mySkills[0].category } : { name: '', category: '' },
    skillRequested: targetUser.skillsToTeach[0]
      ? { name: targetUser.skillsToTeach[0].name, category: targetUser.skillsToTeach[0].category }
      : { name: '', category: '' },
    scheduledAt: '',
    duration: 60,
    location: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!form.scheduledAt) return setError('Please select a date and time');
    setLoading(true);
    setError('');
    try {
      await api.post('/sessions', { provider: targetUser._id, ...form });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal glass-card animate-fade-in">
        <div className="modal-header">
          <h2><Calendar size={18} /> Request Swap with {targetUser.name}</h2>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '32px 0', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
            <div style={{ fontSize: 48 }}>🎉</div>
            <h3 style={{ color: 'var(--accent)' }}>Request Sent!</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              {targetUser.name} will be notified and can accept or decline your swap request.
            </p>
            <button className="btn btn-primary" onClick={onClose}>Done</button>
          </div>
        ) : (
          <form className="modal-form" onSubmit={submit}>
            {error && <div className="auth-error">{error}</div>}

            {/* What I offer */}
            <div className="form-group">
              <label className="form-label">What you'll teach them</label>
              {mySkills.length > 0 ? (
                <select className="form-input"
                  value={form.skillOffered.name}
                  onChange={(e) => {
                    const s = mySkills.find(sk => sk.name === e.target.value);
                    setForm(p => ({ ...p, skillOffered: { name: s.name, category: s.category } }));
                  }}>
                  {mySkills.map((s, i) => <option key={i} value={s.name}>{s.name}</option>)}
                </select>
              ) : (
                <input className="form-input" placeholder="Your skill name" value={form.skillOffered.name}
                  onChange={(e) => setForm(p => ({ ...p, skillOffered: { name: e.target.value, category: 'Other' } }))} />
              )}
            </div>

            {/* What I want to learn */}
            <div className="form-group">
              <label className="form-label">What you want to learn from them</label>
              {targetUser.skillsToTeach?.length > 0 ? (
                <select className="form-input"
                  value={form.skillRequested.name}
                  onChange={(e) => {
                    const s = targetUser.skillsToTeach.find(sk => sk.name === e.target.value);
                    setForm(p => ({ ...p, skillRequested: { name: s.name, category: s.category } }));
                  }}>
                  {targetUser.skillsToTeach.map((s, i) => <option key={i} value={s.name}>{s.name}</option>)}
                </select>
              ) : (
                <input className="form-input" placeholder="Skill to learn" value={form.skillRequested.name}
                  onChange={(e) => setForm(p => ({ ...p, skillRequested: { name: e.target.value, category: 'Other' } }))} />
              )}
            </div>

            {/* Date & time */}
            <div className="form-group">
              <label className="form-label">Date & Time</label>
              <input
                type="datetime-local"
                className="form-input"
                value={form.scheduledAt}
                min={new Date().toISOString().slice(0, 16)}
                onChange={(e) => setForm(p => ({ ...p, scheduledAt: e.target.value }))}
                required
              />
            </div>

            {/* Duration */}
            <div className="form-group">
              <label className="form-label">Duration</label>
              <select className="form-input" value={form.duration}
                onChange={(e) => setForm(p => ({ ...p, duration: Number(e.target.value) }))}>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </div>

            {/* Location */}
            <div className="form-group">
              <label className="form-label">Location (optional)</label>
              <input className="form-input" placeholder="Library, Zoom, etc." value={form.location}
                onChange={(e) => setForm(p => ({ ...p, location: e.target.value }))} />
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label">Message (optional)</label>
              <textarea className="form-input" rows={3} placeholder="Introduce yourself or describe what you'd like to learn..."
                value={form.notes} onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))}
                style={{ resize: 'vertical' }} />
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? <span className="animate-spin btn-spinner" /> : 'Send Swap Request'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
