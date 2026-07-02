import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { getInitials, getAvatarColor, SKILL_CATEGORIES, SKILL_LEVELS, formatDate, CATEGORY_ICONS } from '../utils/helpers';
import { Star, MessageSquare, Calendar, Edit2, Plus, X, Save } from 'lucide-react';
import SessionRequestModal from '../components/ui/SessionRequestModal';
import './Profile.css';

export default function Profile() {
  const { id } = useParams();
  const { user: me, updateUser } = useAuth();
  const isOwn = !id || id === me?._id;
  const profileId = isOwn ? me?._id : id;

  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [sessionModal, setSessionModal] = useState(false);
  const [teachInput, setTeachInput] = useState({ name: '', category: SKILL_CATEGORIES[0], level: 'Intermediate' });
  const [learnInput, setLearnInput] = useState({ name: '', category: SKILL_CATEGORIES[0] });

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/users/${profileId}`);
      setProfile(data.user);
      setReviews(data.reviews);
      setEditData({
        name: data.user.name,
        bio: data.user.bio || '',
        campus: data.user.campus || '',
        department: data.user.department || '',
        year: data.user.year || '',
        skillsToTeach: data.user.skillsToTeach || [],
        skillsToLearn: data.user.skillsToLearn || [],
      });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (profileId) fetchProfile(); }, [profileId]);

  const saveProfile = async () => {
    try {
      const { data } = await api.put('/users/profile', editData);
      setProfile(data.user);
      updateUser(data.user);
      setEditing(false);
    } catch (err) { console.error(err); }
  };

  const addTeach = () => {
    if (!teachInput.name.trim()) return;
    setEditData(p => ({ ...p, skillsToTeach: [...p.skillsToTeach, { ...teachInput }] }));
    setTeachInput({ name: '', category: SKILL_CATEGORIES[0], level: 'Intermediate' });
  };

  const addLearn = () => {
    if (!learnInput.name.trim()) return;
    setEditData(p => ({ ...p, skillsToLearn: [...p.skillsToLearn, { ...learnInput }] }));
    setLearnInput({ name: '', category: SKILL_CATEGORIES[0] });
  };

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="skeleton" style={{ height: 200, borderRadius: 16 }} />
        <div className="skeleton" style={{ height: 300, borderRadius: 16 }} />
      </div>
    </Layout>
  );

  if (!profile) return (
    <Layout>
      <div className="empty-state"><h3>User not found</h3></div>
    </Layout>
  );

  const skills = isOwn ? editData : profile;

  return (
    <Layout>
      <div className="profile animate-fade-in">
        {/* Profile header */}
        <div className="profile-header glass-card">
          <div className="profile-cover" />
          <div className="profile-main">
            <div className="profile-avatar-wrap">
              <div className="avatar" style={{ width: 80, height: 80, fontSize: 28, background: getAvatarColor(profile.name) }}>
                {getInitials(profile.name)}
              </div>
              {profile.averageRating > 0 && (
                <div className="avatar-rating">
                  <Star size={10} fill="var(--warning)" color="var(--warning)" />
                  {profile.averageRating}
                </div>
              )}
            </div>

            <div className="profile-details">
              {editing ? (
                <input className="form-input" style={{ fontSize: 22, fontWeight: 700, maxWidth: 300, background: 'var(--bg-input)' }}
                  value={editData.name} onChange={(e) => setEditData(p => ({ ...p, name: e.target.value }))} />
              ) : (
                <h1>{profile.name}</h1>
              )}
              <div className="profile-meta">
                {profile.campus && <span>🎓 {profile.campus}</span>}
                {profile.department && <span>• {profile.department}</span>}
                {profile.year && <span>• {profile.year}</span>}
              </div>
              {editing ? (
                <textarea className="form-input" placeholder="Write a short bio..." rows={2}
                  value={editData.bio} onChange={(e) => setEditData(p => ({ ...p, bio: e.target.value }))}
                  style={{ marginTop: 8, resize: 'vertical' }} />
              ) : (
                profile.bio && <p className="profile-bio">{profile.bio}</p>
              )}

              <div className="profile-stats">
                <div className="pstat"><span>{profile.totalSessionsTaught}</span> Taught</div>
                <div className="pstat"><span>{profile.totalSessionsLearned}</span> Learned</div>
                <div className="pstat"><span>{profile.credits}</span> Credits</div>
                <div className="pstat"><span>{profile.totalReviews}</span> Reviews</div>
              </div>

              {/* Badges */}
              {profile.badges?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                  {profile.badges.map(b => (
                    <span key={b.name} style={{ background: 'rgba(124,110,250,0.12)', border: '1px solid rgba(124,110,250,0.25)', borderRadius: 99, padding: '4px 12px', fontSize: 12, color: 'var(--primary-light)', fontWeight: 600 }}>
                      {b.icon} {b.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="profile-actions">
              {isOwn ? (
                editing ? (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary btn-sm" onClick={saveProfile}><Save size={14} /> Save</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
                  </div>
                ) : (
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}><Edit2 size={14} /> Edit profile</button>
                )
              ) : (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className="btn btn-primary btn-sm" onClick={() => setSessionModal(true)}>
                    <Calendar size={14} /> Request Swap
                  </button>
                  <Link to={`/messages/${profile._id}`} className="btn btn-ghost btn-sm">
                    <MessageSquare size={14} /> Message
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="profile-grid">
          {/* Skills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Skills to teach */}
            <div className="glass-card" style={{ padding: 24 }}>
              <h2 style={{ fontSize: 16, marginBottom: 16, color: 'var(--text-secondary)' }}>Can Teach</h2>
              {(isOwn ? editData.skillsToTeach : profile.skillsToTeach)?.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No skills added yet</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(isOwn ? editData.skillsToTeach : profile.skillsToTeach)?.map((s, i) => (
                    <div className="skill-row" key={i}>
                      <span className="skill-cat-icon">{CATEGORY_ICONS[s.category] || '✨'}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.category} · {s.level}</div>
                      </div>
                      {editing && (
                        <button className="icon-btn" style={{ marginLeft: 'auto' }}
                          onClick={() => setEditData(p => ({ ...p, skillsToTeach: p.skillsToTeach.filter((_, idx) => idx !== i) }))}>
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {editing && (
                <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <input className="form-input" placeholder="Skill name" value={teachInput.name} style={{ flex: 1, minWidth: 120 }}
                    onChange={(e) => setTeachInput(p => ({ ...p, name: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && addTeach()} />
                  <select className="form-input" value={teachInput.category} style={{ maxWidth: 160 }}
                    onChange={(e) => setTeachInput(p => ({ ...p, category: e.target.value }))}>
                    {SKILL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <select className="form-input" value={teachInput.level} style={{ maxWidth: 130 }}
                    onChange={(e) => setTeachInput(p => ({ ...p, level: e.target.value }))}>
                    {SKILL_LEVELS.map(l => <option key={l}>{l}</option>)}
                  </select>
                  <button className="btn btn-primary btn-sm" onClick={addTeach}><Plus size={14} /> Add</button>
                </div>
              )}
            </div>

            {/* Skills to learn */}
            <div className="glass-card" style={{ padding: 24 }}>
              <h2 style={{ fontSize: 16, marginBottom: 16, color: 'var(--text-secondary)' }}>Wants to Learn</h2>
              {(isOwn ? editData.skillsToLearn : profile.skillsToLearn)?.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No skills added yet</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {(isOwn ? editData.skillsToLearn : profile.skillsToLearn)?.map((s, i) => (
                    <span key={i} className="skill-pill skill-pill--learn" style={{ fontSize: 13, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {s.name}
                      {editing && (
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, lineHeight: 1 }}
                          onClick={() => setEditData(p => ({ ...p, skillsToLearn: p.skillsToLearn.filter((_, idx) => idx !== i) }))}>
                          <X size={12} />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              )}
              {editing && (
                <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <input className="form-input" placeholder="Skill to learn" value={learnInput.name} style={{ flex: 1, minWidth: 140 }}
                    onChange={(e) => setLearnInput(p => ({ ...p, name: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && addLearn()} />
                  <select className="form-input" value={learnInput.category} style={{ maxWidth: 160 }}
                    onChange={(e) => setLearnInput(p => ({ ...p, category: e.target.value }))}>
                    {SKILL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <button className="btn btn-accent btn-sm" onClick={addLearn}><Plus size={14} /> Add</button>
                </div>
              )}
            </div>
          </div>

          {/* Reviews */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 16, marginBottom: 16, color: 'var(--text-secondary)' }}>
              Reviews ({reviews.length})
            </h2>
            {reviews.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px 0' }}>
                <Star size={36} style={{ color: 'var(--text-muted)' }} />
                <p>No reviews yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {reviews.map((r) => (
                  <div key={r._id} className="review-card">
                    <div className="review-header">
                      <div className="avatar" style={{ width: 36, height: 36, fontSize: 13, background: getAvatarColor(r.reviewer.name) }}>
                        {getInitials(r.reviewer.name)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{r.reviewer.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          Taught {r.skillTaught} · {formatDate(r.createdAt)}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 2, marginLeft: 'auto' }}>
                        {Array(5).fill(0).map((_, i) => (
                          <Star key={i} size={13} fill={i < r.rating ? 'var(--warning)' : 'none'} color={i < r.rating ? 'var(--warning)' : 'var(--border)'} />
                        ))}
                      </div>
                    </div>
                    {r.comment && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.6 }}>{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {sessionModal && (
        <SessionRequestModal
          targetUser={profile}
          mySkills={me?.skillsToTeach || []}
          onClose={() => setSessionModal(false)}
        />
      )}
    </Layout>
  );
}
