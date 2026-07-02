import { Link } from 'react-router-dom';
import { ArrowRight, Repeat2, Users, Calendar, Star, Zap, Shield, BookOpen } from 'lucide-react';
import './Landing.css';

const features = [
  { icon: Users, title: 'Smart Matching', desc: 'Our algorithm finds students who have what you want to learn and want what you can teach.' },
  { icon: Calendar, title: 'Easy Scheduling', desc: 'Book sessions with an intuitive calendar. No back-and-forth, just pick a time and confirm.' },
  { icon: Star, title: 'Ratings & Reviews', desc: 'Build your reputation as a great teacher. Reviews help the community trust each other.' },
  { icon: Zap, title: 'Credits System', desc: 'Earn credits when you teach, spend them to learn. A fair exchange for everyone.' },
  { icon: BookOpen, title: 'Any Skill', desc: 'Code, music, languages, cooking, fitness, art — if you know it, someone else wants to.' },
  { icon: Shield, title: 'Campus Verified', desc: 'Students only. Your campus community in a trusted, focused environment.' },
];

const skills = [
  'Python', 'Guitar', 'French', 'UI Design', 'Calculus', 'Photography',
  'Public Speaking', 'Yoga', 'Video Editing', 'Spanish', 'Data Science', 'Painting',
];

export default function Landing() {
  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="container landing-nav-inner">
          <div className="landing-logo">
            <div className="logo-icon-sm">
              <Repeat2 size={16} color="white" />
            </div>
            <span>SkillSwap Campus</span>
          </div>
          <div className="landing-nav-links">
            <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-glow" />
        <div className="container hero-content">
          <div className="hero-badge">
            <span className="badge badge-primary">🎓 For students, by students</span>
          </div>
          <h1 className="hero-title">
            Trade What You Know.<br />
            <span className="gradient-text">Learn What You Don't.</span>
          </h1>
          <p className="hero-subtitle">
            SkillSwap Campus connects students to exchange skills and knowledge —
            no money, just learning. Teach guitar, learn Python. Swap Spanish for Statistics.
          </p>
          <div className="hero-cta">
            <Link to="/register" className="btn btn-primary btn-lg">
              Start swapping <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-ghost btn-lg">I have an account</Link>
          </div>

          {/* Floating skill tags */}
          <div className="skill-cloud">
            {skills.map((skill, i) => (
              <span
                key={skill}
                className="skill-tag"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-bar">
        <div className="container stats-inner">
          {[
            { value: '2,400+', label: 'Active Students' },
            { value: '180+', label: 'Skills Available' },
            { value: '8,000+', label: 'Sessions Completed' },
            { value: '4.8★', label: 'Average Rating' },
          ].map((s) => (
            <div className="stat-item" key={s.label}>
              <span className="stat-value gradient-text">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2>Everything you need to learn and teach</h2>
            <p>A full platform built for the campus skill economy</p>
          </div>
          <div className="features-grid">
            {features.map(({ icon: Icon, title, desc }) => (
              <div className="feature-card glass-card" key={title}>
                <div className="feature-icon">
                  <Icon size={22} />
                </div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>How it works</h2>
            <p>Three simple steps to your first skill swap</p>
          </div>
          <div className="steps">
            {[
              { step: '01', title: 'Build your profile', desc: 'List the skills you can teach and the ones you want to learn. The more detail, the better your matches.' },
              { step: '02', title: 'Find your match', desc: 'Browse students or let our matching engine find your perfect swap partners automatically.' },
              { step: '03', title: 'Schedule & swap', desc: 'Book a session, exchange skills, earn credits, and leave a review. It\'s that simple.' },
            ].map((s) => (
              <div className="step" key={s.step}>
                <div className="step-number">{s.step}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container cta-inner">
          <h2>Ready to start learning?</h2>
          <p>Join thousands of students already swapping skills on campus.</p>
          <Link to="/register" className="btn btn-accent btn-lg">
            Create your profile <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <p>Built for students. © 2025 SkillSwap Campus</p>
        </div>
      </footer>
    </div>
  );
}
