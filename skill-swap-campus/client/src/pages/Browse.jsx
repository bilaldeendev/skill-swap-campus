import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import api from '../utils/api';
import { getInitials, getAvatarColor, SKILL_CATEGORIES, CATEGORY_ICONS } from '../utils/helpers';
import { Search, Filter, Star, MessageSquare, Calendar } from 'lucide-react';
import './Browse.css';

export default function Browse() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      const { data } = await api.get(`/users?${params}`);
      setUsers(data.users);
      setTotalPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); fetchUsers(); }, 400);
    return () => clearTimeout(timer);
  }, [search, category]);

  useEffect(() => { fetchUsers(); }, [page]);

  return (
    <Layout>
      <div className="browse animate-fade-in">
        <div className="browse-header">
          <div>
            <h1>Browse Skills</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
              Find students to swap skills with
            </p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="browse-filters glass-card">
          <div className="search-bar">
            <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              className="search-input"
              placeholder="Search by name, skill, or campus..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-row">
            <Filter size={16} style={{ color: 'var(--text-muted)' }} />
            <div className="category-pills">
              <button
                className={`cat-pill ${!category ? 'active' : ''}`}
                onClick={() => setCategory('')}
              >
                All
              </button>
              {SKILL_CATEGORIES.slice(0, 8).map((cat) => (
                <button
                  key={cat}
                  className={`cat-pill ${category === cat ? 'active' : ''}`}
                  onClick={() => setCategory(cat === category ? '' : cat)}
                >
                  {CATEGORY_ICONS[cat]} {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results grid */}
        {loading ? (
          <div className="users-grid">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 260, borderRadius: 16 }} />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🔍</div>
            <h3>No students found</h3>
            <p>Try a different search or category</p>
          </div>
        ) : (
          <div className="users-grid">
            {users.map((u) => (
              <UserCard key={u._id} user={u} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
              Previous
            </button>
            <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              Page {page} of {totalPages}
            </span>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>
              Next
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}

function UserCard({ user }) {
  return (
    <div className="user-card glass-card">
      <div className="user-card-top">
        <div className="avatar" style={{
          width: 56, height: 56, fontSize: 20,
          background: getAvatarColor(user.name),
        }}>
          {user.avatar
            ? <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
            : getInitials(user.name)}
        </div>
        <div className="user-card-info">
          <h3>{user.name}</h3>
          <p>{user.campus || 'Campus not set'}</p>
          {user.averageRating > 0 && (
            <div className="user-rating">
              <Star size={12} fill="var(--warning)" color="var(--warning)" />
              <span>{user.averageRating}</span>
              <span style={{ color: 'var(--text-muted)' }}>({user.totalReviews})</span>
            </div>
          )}
        </div>
      </div>

      {user.skillsToTeach?.length > 0 && (
        <div className="user-card-skills">
          <div className="skills-label">Can teach</div>
          <div className="skill-pills">
            {user.skillsToTeach.slice(0, 3).map((s, i) => (
              <span key={i} className="skill-pill">{s.name}</span>
            ))}
            {user.skillsToTeach.length > 3 && (
              <span className="skill-pill skill-pill--more">+{user.skillsToTeach.length - 3}</span>
            )}
          </div>
        </div>
      )}

      {user.skillsToLearn?.length > 0 && (
        <div className="user-card-skills">
          <div className="skills-label">Wants to learn</div>
          <div className="skill-pills">
            {user.skillsToLearn.slice(0, 3).map((s, i) => (
              <span key={i} className="skill-pill skill-pill--learn">{s.name}</span>
            ))}
          </div>
        </div>
      )}

      <div className="user-card-actions">
        <Link to={`/profile/${user._id}`} className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
          View Profile
        </Link>
        <Link to={`/messages/${user._id}`} className="btn btn-ghost btn-sm">
          <MessageSquare size={15} />
        </Link>
      </div>
    </div>
  );
}
