import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Repeat2, ArrowRight, ArrowLeft, Plus, X } from 'lucide-react';
import { SKILL_CATEGORIES } from '../utils/helpers';
import './Auth.css';

const STEPS = ['Account', 'Your Profile', 'Your Skills'];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '', email: '', password: '',
    campus: '', department: '', year: '',
    skillsToTeach: [], skillsToLearn: [],
  });

  // Temp state for adding skills
  const [teachSkill, setTeachSkill] = useState({ name: '', category: SKILL_CATEGORIES[0], level: 'Intermediate' });
  const [learnSkill, setLearnSkill] = useState({ name: '', category: SKILL_CATEGORIES[0] });

  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const addTeachSkill = () => {
    if (!teachSkill.name.trim()) return;
    setForm((p) => ({ ...p, skillsToTeach: [...p.skillsToTeach, { ...teachSkill }] }));
    setTeachSkill({ name: '', category: SKILL_CATEGORIES[0], level: 'Intermediate' });
  };

  const addLearnSkill = () => {
    if (!learnSkill.name.trim()) return;
    setForm((p) => ({ ...p, skillsToLearn: [...p.skillsToLearn, { ...learnSkill }] }));
    setLearnSkill({ name: '', category: SKILL_CATEGORIES[0] });
  };

  const removeTeach = (i) => setForm((p) => ({ ...p, skillsToTeach: p.skillsToTeach.filter((_, idx) => idx !== i) }));
  const removeLearn = (i) => setForm((p) => ({ ...p, skillsToLearn: p.skillsToLearn.filter((_, idx) => idx !== i) }));

  const next = () => { setError(''); setStep((s) => s + 1); };
  const back = () => setStep((s) => s - 1);

  const submit = async () => {
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-glow" />
      <div className="auth-card glass-card animate-fade-in" style={{ maxWidth: 520 }}>
        <Link to="/" className="auth-logo">
          <div className="logo-icon"><Repeat2 size={18} color="white" /></div>
          <span>SkillSwap Campus</span>
        </Link>

        {/* Step indicator */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="step-indicator">
            {STEPS.map((_, i) => (
              <div key={i} className={`step-dot ${i === step ? 'active' : i < step ? 'done' : ''}`} />
            ))}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Step {step + 1} of {STEPS.length} — <span style={{ color: 'var(--text-secondary)' }}>{STEPS[step]}</span>
          </p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {/* Step 0 — Account */}
        {step === 0 && (
          <div className="auth-form">
            <div className="auth-header">
              <h1>Create your account</h1>
              <p>Let's get you set up on SkillSwap Campus</p>
            </div>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" name="name" placeholder="Your full name" value={form.name} onChange={handle} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" name="email" placeholder="student@university.edu" value={form.email} onChange={handle} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" name="password" placeholder="At least 6 characters" value={form.password} onChange={handle} required minLength={6} />
            </div>
            <button className="btn btn-primary btn-lg auth-submit" onClick={next} disabled={!form.name || !form.email || form.password.length < 6}>
              Continue <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Step 1 — Profile */}
        {step === 1 && (
          <div className="auth-form">
            <div className="auth-header">
              <h1>Your campus profile</h1>
              <p>Help others know who you are</p>
            </div>
            <div className="form-group">
              <label className="form-label">Campus / University</label>
              <input className="form-input" name="campus" placeholder="e.g. University of Lagos" value={form.campus} onChange={handle} />
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <input className="form-input" name="department" placeholder="e.g. Computer Science" value={form.department} onChange={handle} />
            </div>
            <div className="form-group">
              <label className="form-label">Year</label>
              <select className="form-input" name="year" value={form.year} onChange={handle}>
                <option value="">Select year</option>
                {['1st Year','2nd Year','3rd Year','4th Year','5th Year','Postgraduate'].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-ghost btn-lg" onClick={back} style={{ flex: 1 }}>
                <ArrowLeft size={16} /> Back
              </button>
              <button className="btn btn-primary btn-lg" onClick={next} style={{ flex: 2 }}>
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Skills */}
        {step === 2 && (
          <div className="auth-form">
            <div className="auth-header">
              <h1>Your skills</h1>
              <p>What can you teach? What do you want to learn?</p>
            </div>

            {/* Teach */}
            <div className="skills-input-area">
              <label className="form-label">Skills I can teach</label>
              <div className="skills-tags">
                {form.skillsToTeach.map((s, i) => (
                  <span key={i} className="skill-input-tag">
                    {s.name} <button onClick={() => removeTeach(i)}><X size={12} /></button>
                  </span>
                ))}
              </div>
              <div className="add-skill-row">
                <input className="form-input" placeholder="Skill name" value={teachSkill.name}
                  onChange={(e) => setTeachSkill(p => ({ ...p, name: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && addTeachSkill()} />
                <select className="form-input" value={teachSkill.category} style={{ maxWidth: 160 }}
                  onChange={(e) => setTeachSkill(p => ({ ...p, category: e.target.value }))}>
                  {SKILL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button className="btn btn-primary btn-sm" onClick={addTeachSkill}><Plus size={14} /></button>
              </div>
            </div>

            {/* Learn */}
            <div className="skills-input-area">
              <label className="form-label">Skills I want to learn</label>
              <div className="skills-tags">
                {form.skillsToLearn.map((s, i) => (
                  <span key={i} className="skill-input-tag" style={{ background: 'rgba(6,214,160,0.1)', borderColor: 'rgba(6,214,160,0.3)', color: 'var(--accent)' }}>
                    {s.name} <button onClick={() => removeLearn(i)} style={{ color: 'var(--accent)' }}><X size={12} /></button>
                  </span>
                ))}
              </div>
              <div className="add-skill-row">
                <input className="form-input" placeholder="Skill name" value={learnSkill.name}
                  onChange={(e) => setLearnSkill(p => ({ ...p, name: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && addLearnSkill()} />
                <select className="form-input" value={learnSkill.category} style={{ maxWidth: 160 }}
                  onChange={(e) => setLearnSkill(p => ({ ...p, category: e.target.value }))}>
                  {SKILL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button className="btn btn-accent btn-sm" onClick={addLearnSkill}><Plus size={14} /></button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-ghost btn-lg" onClick={back} style={{ flex: 1 }}>
                <ArrowLeft size={16} /> Back
              </button>
              <button className="btn btn-primary btn-lg" onClick={submit} disabled={loading} style={{ flex: 2 }}>
                {loading ? <span className="animate-spin btn-spinner" /> : <>Create account <ArrowRight size={16} /></>}
              </button>
            </div>

            <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
              You can update your skills anytime from your profile
            </p>
          </div>
        )}

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
