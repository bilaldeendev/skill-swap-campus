import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials, getAvatarColor } from '../../utils/helpers';
import {
  LayoutDashboard, Users, Calendar, MessageSquare, Bell,
  LogOut, Settings, ShieldCheck, Search, Repeat2
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/browse', icon: Search, label: 'Browse Skills' },
  { to: '/schedule', icon: Calendar, label: 'Schedule' },
  { to: '/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Repeat2 size={20} color="white" />
        </div>
        <span className="logo-text">SkillSwap</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <ShieldCheck size={18} />
            <span>Admin</span>
          </NavLink>
        )}
      </nav>

      {/* Bottom section */}
      <div className="sidebar-bottom">
        {/* Credits display */}
        <div className="credits-card">
          <span className="credits-label">Your Credits</span>
          <span className="credits-value">{user?.credits ?? 0}</span>
        </div>

        {/* Profile link */}
        <NavLink to={`/profile/${user?._id}`} className="sidebar-profile">
          <div
            className="avatar"
            style={{
              width: 36, height: 36, fontSize: 13,
              background: user?.avatar ? 'none' : getAvatarColor(user?.name),
            }}
          >
            {user?.avatar
              ? <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
              : getInitials(user?.name)}
          </div>
          <div className="profile-info">
            <span className="profile-name">{user?.name}</span>
            <span className="profile-role">{user?.campus || 'Student'}</span>
          </div>
          <Settings size={14} style={{ color: 'var(--text-muted)', marginLeft: 'auto' }} />
        </NavLink>

        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={16} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
