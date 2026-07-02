import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Search, Calendar, MessageSquare, Bell } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/browse', icon: Search, label: 'Browse' },
  { to: '/schedule', icon: Calendar, label: 'Schedule' },
  { to: '/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/notifications', icon: Bell, label: 'Alerts' },
];

export default function MobileNav() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <nav className="mobile-nav">
      <div className="mobile-nav-inner">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={22} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}