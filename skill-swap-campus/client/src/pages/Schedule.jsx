import { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatSessionDate, getInitials, getAvatarColor } from '../utils/helpers';
import { Calendar, Check, X, Clock, Star, CheckCircle } from 'lucide-react';
import ReviewModal from '../components/ui/ReviewModal';
import './Schedule.css';

const TABS = ['Upcoming', 'Pending', 'Completed', 'Cancelled'];

export default function Schedule() {
  const { user } = useAuth();
  const [tab, setTab] = useState('Upcoming');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewSession, setReviewSession] = useState(null);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const statusMap = {
        Upcoming: 'accepted',
        Pending: 'pending',
        Completed: 'completed',
        Cancelled: 'cancelled,declined',
      };
      const { data } = await api.get(`/sessions?status=${statusMap[tab]}`);
      const sorted = [...data].sort((a, b) =>
        tab === 'Completed'
          ? new Date(b.scheduledAt) - new Date(a.scheduledAt)
          : new Date(a.scheduledAt) - new Date(b.scheduledAt)
      );
      setSessions(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSessions(); }, [tab]);

  const respond = async (id, action) => {
    try {
      await api.put(`/sessions/${id}/respond`, { action });
      fetchSessions();
    } catch (err) { console.error(err); }
  };

  const complete = async (id) => {
    try {
      await api.put(`/sessions/${id}/complete`);
      fetchSessions();
    } catch (err) { console.error(err); }
  };

  const cancel = async (id) => {
    if (!window.confirm('Cancel this session?')) return;
    try {
      await api.put(`/sessions/${id}/cancel`);
      fetchSessions();
    } catch (err) { console.error(err); }
  };

  return (
    <Layout>
      <div className="schedule animate-fade-in">
        <div className="schedule-header">
          <div>
            <h1>Schedule</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
              Manage your skill swap sessions
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="tab-row">
          {TABS.map((t) => (
            <button
              key={t}
              className={`tab-btn ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Sessions */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />)}
          </div>
        ) : sessions.length === 0 ? (
          <div className="empty-state">
            <div className="icon"><Calendar size={48} /></div>
            <h3>No {tab.toLowerCase()} sessions</h3>
            <p>{tab === 'Upcoming' ? 'Browse students and request a skill swap' : `You have no ${tab.toLowerCase()} sessions`}</p>
          </div>
        ) : (
          <div className="session-cards">
            {sessions.map((s) => {
              const isProvider = s.provider._id === user?._id;
              const partner = isProvider ? s.requester : s.provider;
              const canReview = s.status === 'completed' &&
                ((isProvider && !s.providerReviewed) || (!isProvider && !s.requesterReviewed));

              return (
                <div className="session-card glass-card" key={s._id}>
                  <div className="session-card-left">
                    <div className="avatar" style={{
                      width: 52, height: 52, fontSize: 18,
                      background: getAvatarColor(partner.name),
                    }}>
                      {getInitials(partner.name)}
                    </div>
                    <div className="session-card-info">
                      <div className="sc-partner">{partner.name}</div>
                      <div className="sc-swap">
                        <span className="sc-skill teach">
                          {isProvider ? `You teach: ${s.skillRequested.name}` : `You learn: ${s.skillRequested.name}`}
                        </span>
                        <span className="sc-divider">↔</span>
                        <span className="sc-skill learn">
                          {isProvider ? `You learn: ${s.skillOffered.name}` : `You teach: ${s.skillOffered.name}`}
                        </span>
                      </div>
                      <div className="sc-meta">
                        <Clock size={13} />
                        {formatSessionDate(s.scheduledAt)}
                        <span>·</span>
                        {s.duration} min
                        {s.location && <><span>·</span>{s.location}</>}
                      </div>
                    </div>
                  </div>

                  <div className="session-card-right">
                    <span className={`badge status-${s.status}`}>
                      {s.status}
                    </span>

                    {/* Pending — provider can accept/decline */}
                    {s.status === 'pending' && isProvider && (
                      <div className="sc-actions">
                        <button className="btn btn-accent btn-sm" onClick={() => respond(s._id, 'accept')}>
                          <Check size={14} /> Accept
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => respond(s._id, 'decline')}>
                          <X size={14} /> Decline
                        </button>
                      </div>
                    )}

                    {/* Accepted — mark complete or cancel */}
                    {s.status === 'accepted' && (
                      <div className="sc-actions">
                        <button className="btn btn-primary btn-sm" onClick={() => complete(s._id)}>
                          <CheckCircle size={14} /> Complete
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => cancel(s._id)}>
                          <X size={14} /> Cancel
                        </button>
                      </div>
                    )}

                    {/* Completed — leave review */}
                    {canReview && (
                      <button className="btn btn-primary btn-sm" onClick={() => setReviewSession({ session: s, partner })}>
                        <Star size={14} /> Review
                      </button>
                    )}

                    {s.notes && (
                      <p className="sc-notes">"{s.notes}"</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {reviewSession && (
        <ReviewModal
          session={reviewSession.session}
          partner={reviewSession.partner}
          onClose={() => setReviewSession(null)}
          onSubmit={() => { setReviewSession(null); fetchSessions(); }}
        />
      )}
    </Layout>
  );
}
