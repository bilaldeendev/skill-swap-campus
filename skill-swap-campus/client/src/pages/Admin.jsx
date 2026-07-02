import { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import api from '../utils/api';
import { getInitials, getAvatarColor, formatDate } from '../utils/helpers';
import { ShieldCheck, Users, ToggleLeft, ToggleRight } from 'lucide-react';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/admin/all').then(({ data }) => setUsers(data)).finally(() => setLoading(false));
  }, []);

  const toggle = async (id) => {
    const { data } = await api.put(`/users/admin/${id}/toggle`);
    setUsers(prev => prev.map(u => u._id === id ? data.user : u));
  };

  return (
    <Layout>
      <div className="animate-fade-in" style={{ maxWidth: 1000 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 26, display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShieldCheck size={24} color="var(--primary)" /> Admin Panel
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
            Manage platform users
          </p>
        </div>

        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Users size={18} style={{ color: 'var(--text-secondary)' }} />
            <h2 style={{ fontSize: 16, color: 'var(--text-secondary)' }}>
              All Users ({users.length})
            </h2>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 12 }} />)}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {users.map(u => (
                <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)' }}>
                  <div className="avatar" style={{ width: 40, height: 40, fontSize: 14, background: getAvatarColor(u.name) }}>
                    {getInitials(u.name)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.email} · Joined {formatDate(u.createdAt)}</div>
                  </div>
                  <span className={`badge badge-${u.role === 'admin' ? 'primary' : 'info'}`}>{u.role}</span>
                  <span className={`badge ${u.isActive ? 'badge-accent' : 'badge-danger'}`}>
                    {u.isActive ? 'Active' : 'Deactivated'}
                  </span>
                  {u.role !== 'admin' && (
                    <button className="btn btn-ghost btn-sm" onClick={() => toggle(u._id)}>
                      {u.isActive ? <ToggleRight size={16} color="var(--accent)" /> : <ToggleLeft size={16} />}
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
