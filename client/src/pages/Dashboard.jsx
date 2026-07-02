import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import api from '../utils/api';
import { formatSessionDate, getInitials, getAvatarColor } from '../utils/helpers';
import {
  Calendar, Users, Star, Zap, ArrowRight, CheckCircle,
  Clock, MessageSquare, TrendingUp, Award
} from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/sessions?status=accepted'),
      api.get('/sessions?status=pending'),
      api.get('/matches'),
    ]).then(([accepted, pending, matchRes]) => {
      const upcoming = [...accepted.data, ...pending.data]
        .filter(s => new Date(s.scheduledAt) > new Date())
        .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
        .slice(0, 5);
      setSessions(upcoming);
      setMatches(matchRes.data.matches?.slice(0, 4) || []);
    }).finally(() => setLoading(false));
  }, []);

  const pendingSessions = sessions.filter(s => s.status === 'pending' && s.provider._id === user?._id);
  const upcomingSessions = sessions.filter(s => s.status === 'accepted');

  const stats = [
    { icon: Calendar, label: 'Upcoming Sessions', value: upcomingSessions.length, color: 'primary' },
    { icon: Clock, label: 'Pending Requests', value: pendingSessions.length, color: 'warning' },
    { icon: Zap, label: 'Your Credits', value: user?.credits ?? 0, color: 'accent' },
    { icon: Star, label: 'Your Rating', value: user?.averageRating ? `${user.averageRating}★` : 'New', color: 'info' },
  ];

  return (
    <Layout>
      <div className="dashboard animate-fade-in">
        {/* Greeting */}
        <div className="dash-greeting">
          <div>
            <h1>Good day, {user?.name?.split(' ')[0]} 👋</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
              Here's what's happening with your skill swaps
            </p>
          </div>
          <Link to="/browse" className="btn btn-primary">
            Find a swap partner <ArrowRight size={16} />
          </Link>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {stats.map(({ icon: Icon, label, value, color }) => (
            <div className="stat-card glass-card" key={label}>
              <div className={`stat-icon stat-icon--${color}`}>
                <Icon size={20} />
              </div>
              <div>
                <div className="stat-number">{loading ? '—' : value}</div>
                <div className="stat-label">{label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="dash-grid">
          {/* Upcoming sessions */}
          <div className="dash-panel glass-card">
            <div className="panel-header">
              <h2><Calendar size={18} /> Upcoming Sessions</h2>
              <Link to="/schedule" className="btn btn-ghost btn-sm">View all</Link>
            </div>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 68 }} />)}
              </div>
            ) : sessions.length === 0 ? (
              <div className="empty-state" style={{ padding: '32px 0' }}>
                <Calendar size={40} style={{ color: 'var(--text-muted)' }} />
                <p>No upcoming sessions yet</p>
                <Link to="/browse" className="btn btn-primary btn-sm">Find a partner</Link>
              </div>
            ) : (
              <div className="session-list">
                {sessions.map((s) => {
                  const partner = s.requester._id === user?._id ? s.provider : s.requester;
                  const isProvider = s.provider._id === user?._id;
                  return (
                    <div className="session-item" key={s._id}>
                      <div className="avatar" style={{
                        width: 40, height: 40, fontSize: 14,
                        background: getAvatarColor(partner.name),
                      }}>
                        {getInitials(partner.name)}
                      </div>
                      <div className="session-info">
                        <div className="session-partner">{partner.name}</div>
                        <div className="session-skill">
                          {isProvider ? `Teaching ${s.skillRequested.name}` : `Learning ${s.skillRequested.name}`}
                        </div>
                        <div className="session-time">{formatSessionDate(s.scheduledAt)}</div>
                      </div>
                      <span className={`badge badge-${s.status === 'accepted' ? 'accent' : 'warning'}`}>
                        {s.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Your matches */}
          <div className="dash-panel glass-card">
            <div className="panel-header">
              <h2><Users size={18} /> Your Matches</h2>
              <Link to="/browse" className="btn btn-ghost btn-sm">Browse all</Link>
            </div>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 56 }} />)}
              </div>
            ) : matches.length === 0 ? (
              <div className="empty-state" style={{ padding: '32px 0' }}>
                <Users size={40} style={{ color: 'var(--text-muted)' }} />
                <p>Add skills to your profile to find matches</p>
                <Link to={`/profile/${user?._id}`} className="btn btn-primary btn-sm">Update skills</Link>
              </div>
            ) : (
              <div className="match-list">
                {matches.map(({ user: matchUser, isMutual, theyCanTeach }) => (
                  <Link to={`/profile/${matchUser._id}`} className="match-item" key={matchUser._id}>
                    <div className="avatar" style={{ width: 40, height: 40, fontSize: 14, background: getAvatarColor(matchUser.name) }}>
                      {getInitials(matchUser.name)}
                    </div>
                    <div className="match-info">
                      <div className="match-name">{matchUser.name}</div>
                      <div className="match-skill">Can teach: {theyCanTeach.join(', ')}</div>
                    </div>
                    {isMutual && (
                      <span className="badge badge-accent" style={{ fontSize: 11 }}>Mutual</span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Profile completion / badges */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div className="panel-header" style={{ marginBottom: 16 }}>
            <h2><Award size={18} /> Your Achievements</h2>
            <Link to={`/profile/${user?._id}`} className="btn btn-ghost btn-sm">View profile</Link>
          </div>
          {user?.badges?.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {user.badges.map((b) => (
                <div key={b.name} className="badge-chip">
                  <span>{b.icon}</span>
                  <span>{b.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              {[
                { icon: '🎓', name: 'First Teacher', desc: 'Complete your first teaching session' },
                { icon: '📚', name: 'Eager Learner', desc: 'Complete 5 learning sessions' },
                { icon: '💎', name: 'Top Rated', desc: 'Earn a 4.5+ average rating' },
              ].map(b => (
                <div key={b.name} className="badge-chip badge-chip--locked">
                  <span>{b.icon}</span>
                  <span>{b.name}</span>
                </div>
              ))}
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Complete sessions to earn badges!</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
