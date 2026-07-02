import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { api } from "../api.js";
import "../styles/dashboard.css";

function formatDate(d) {
  return new Date(d).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function Dashboard() {
  const { user, token } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .mySessions(token)
      .then((data) => setSessions(data.sessions))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleStatus(id, status) {
    const data = await api.updateSessionStatus(token, id, status);
    setSessions((prev) => prev.map((s) => (s._id === id ? data.session : s)));
  }

  const upcoming = sessions.filter((s) => ["pending", "confirmed"].includes(s.status));
  const past = sessions.filter((s) => ["completed", "cancelled", "declined"].includes(s.status));
  const incomingRequests = upcoming.filter(
    (s) => s.status === "pending" && s.teacher._id === user?._id
  );

  return (
    <div className="container dashboard">
      <div className="dash-head">
        <div>
          <span className="eyebrow">Welcome back</span>
          <h1>{user?.name?.split(" ")[0]}'s dashboard</h1>
        </div>
        <Link to="/browse" className="btn btn-accent">
          Find a skill to learn
        </Link>
      </div>

      <div className="stat-row">
        <div className="card stat-card">
          <span className="stat-number">{user?.credits ?? 0}</span>
          <span className="text-soft">Swap credits</span>
        </div>
        <div className="card stat-card">
          <span className="stat-number">{upcoming.length}</span>
          <span className="text-soft">Upcoming sessions</span>
        </div>
        <div className="card stat-card">
          <span className="stat-number">{incomingRequests.length}</span>
          <span className="text-soft">Requests waiting on you</span>
        </div>
        <div className="card stat-card">
          <span className="stat-number">{user?.rating ? user.rating.toFixed(1) : "—"}</span>
          <span className="text-soft">Your rating</span>
        </div>
      </div>

      <section className="dash-section">
        <h2>Upcoming sessions</h2>
        {loading ? (
          <p className="text-soft">Loading…</p>
        ) : upcoming.length === 0 ? (
          <div className="card empty-state">
            <p>No upcoming sessions yet. Go find someone teaching a skill you want.</p>
            <Link to="/browse" className="btn btn-outline btn-sm">
              Browse skills
            </Link>
          </div>
        ) : (
          <div className="session-list">
            {upcoming.map((s) => {
              const isTeacher = s.teacher._id === user._id;
              const other = isTeacher ? s.learner : s.teacher;
              return (
                <div className="card session-row" key={s._id}>
                  <div
                    className="navbar-avatar"
                    style={{ background: other.avatarColor }}
                  >
                    {other.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="session-info">
                    <strong>{s.skill}</strong>
                    <span className="text-soft">
                      {isTeacher ? "Teaching" : "Learning from"} {other.name} · {formatDate(s.dateTime)}
                    </span>
                  </div>
                  <span className={`pill status-${s.status}`}>{s.status}</span>
                  <div className="session-actions">
                    {isTeacher && s.status === "pending" && (
                      <>
                        <button className="btn btn-sm btn-accent" onClick={() => handleStatus(s._id, "confirmed")}>
                          Confirm
                        </button>
                        <button className="btn btn-sm btn-outline" onClick={() => handleStatus(s._id, "declined")}>
                          Decline
                        </button>
                      </>
                    )}
                    {s.status === "confirmed" && (
                      <button className="btn btn-sm btn-primary" onClick={() => handleStatus(s._id, "completed")}>
                        Mark complete
                      </button>
                    )}
                    {s.status !== "completed" && (
                      <button className="btn btn-sm btn-ghost" onClick={() => handleStatus(s._id, "cancelled")}>
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section className="dash-section">
          <h2>History</h2>
          <div className="session-list">
            {past.map((s) => {
              const isTeacher = s.teacher._id === user._id;
              const other = isTeacher ? s.learner : s.teacher;
              return (
                <div className="card session-row faded" key={s._id}>
                  <div className="navbar-avatar" style={{ background: other.avatarColor }}>
                    {other.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="session-info">
                    <strong>{s.skill}</strong>
                    <span className="text-soft">
                      {isTeacher ? "Taught" : "Learned from"} {other.name} · {formatDate(s.dateTime)}
                    </span>
                  </div>
                  <span className={`pill status-${s.status}`}>{s.status}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
