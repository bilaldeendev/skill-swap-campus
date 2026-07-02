import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import api from '../utils/api';
import { timeAgo } from '../utils/helpers';
import { Bell, CheckCheck } from 'lucide-react';
import './Notifications.css';

const NOTIF_ICONS = {
  'session-request': '📅',
  'session-accepted': '✅',
  'session-declined': '❌',
  'session-completed': '⭐',
  'new-message': '💬',
  'new-review': '🌟',
  'badge-earned': '🏆',
  'match-found': '🤝',
  'session-reminder': '⏰',
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
  };

  useEffect(() => { fetch(); }, []);

  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <Layout>
      <div className="notifications animate-fade-in">
        <div className="notif-header">
          <div>
            <h1>Notifications</h1>
            {unread > 0 && (
              <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 14 }}>
                {unread} unread notification{unread > 1 ? 's' : ''}
              </p>
            )}
          </div>
          {unread > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={markAllRead}>
              <CheckCheck size={16} /> Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 14 }} />)}
          </div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <Bell size={48} style={{ color: 'var(--text-muted)' }} />
            <h3>No notifications yet</h3>
            <p>We'll notify you about swap requests, messages, and more</p>
          </div>
        ) : (
          <div className="notif-list">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`notif-item glass-card ${!n.isRead ? 'unread' : ''}`}
                onClick={() => !n.isRead && markRead(n._id)}
              >
                <div className="notif-icon">{NOTIF_ICONS[n.type] || '🔔'}</div>
                <div className="notif-body">
                  <div className="notif-title">{n.title}</div>
                  <div className="notif-message">{n.message}</div>
                  <div className="notif-time">{timeAgo(n.createdAt)}</div>
                </div>
                {!n.isRead && <div className="notif-dot" />}
                {n.link && (
                  <Link to={n.link} className="btn btn-ghost btn-sm" onClick={(e) => e.stopPropagation()}>
                    View
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
