import { Link } from 'react-router-dom';
import { Repeat2 } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: 24 }}>
      <div style={{ fontSize: 80, animation: 'float 3s ease-in-out infinite' }}>🔄</div>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 48, fontFamily: 'var(--font-display)', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          404
        </h1>
        <h2 style={{ fontSize: 22, marginTop: 8, marginBottom: 12 }}>Page not found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
          Looks like this skill hasn't been listed yet.
        </p>
        <Link to="/" className="btn btn-primary btn-lg">Back to home</Link>
      </div>
    </div>
  );
}
