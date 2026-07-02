import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import SwapMark from "./SwapMark.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          <SwapMark size={26} />
          <span>Skill Swap Campus</span>
        </Link>

        {user ? (
          <nav className="navbar-links">
            <Link to="/browse">Browse</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/schedule">Schedule</Link>
            <Link to="/messages">Messages</Link>
            <Link to="/profile" className="navbar-avatar" style={{ background: user.avatarColor }}>
              {user.name?.[0]?.toUpperCase()}
            </Link>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Log out
            </button>
          </nav>
        ) : (
          <nav className="navbar-links">
            <Link to="/login" className="btn btn-ghost btn-sm">
              Log in
            </Link>
            <Link to="/signup" className="btn btn-accent btn-sm">
              Get started
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
