import React from "react";
import { Link } from "react-router-dom";
import SwapMark from "../components/SwapMark.jsx";
import "../styles/landing.css";

const FEATURES = [
  {
    title: "Match by what you offer and need",
    body: "List what you can teach and what you want to learn. We surface people on your campus whose skills complete yours.",
    accent: "marigold",
  },
  {
    title: "Book it like a real session",
    body: "Pick a time, a place, a duration. It lands on both calendars and your dashboard, no back-and-forth texting required.",
    accent: "teal",
  },
  {
    title: "Earn credits, not just favors",
    body: "Teach a session, earn a credit. Spend credits to learn from someone else. Nobody keeps a mental tally.",
    accent: "coral",
  },
  {
    title: "Reputation that travels with you",
    body: "Ratings and reviews build up after every swap, so trust isn't something you have to start from zero each time.",
    accent: "marigold",
  },
];

export default function Landing() {
  return (
    <div className="landing">
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Built for campus, by people who trade favors anyway</span>
            <h1 className="hero-title">
              Trade what you know
              <br />
              for what you want to learn.
            </h1>
            <p className="hero-sub">
              Skill Swap Campus matches students who can teach with students who want to learn — then
              handles the scheduling so the swap actually happens.
            </p>
            <div className="hero-actions">
              <Link to="/signup" className="btn btn-accent">
                Start swapping
              </Link>
              <Link to="/browse" className="btn btn-outline">
                See who's teaching
              </Link>
            </div>
          </div>

          <div className="hero-demo" aria-hidden="true">
            <div className="swap-card swap-card-left">
              <span className="pill pill-teach">Teaches</span>
              <h3>Guitar &mdash; beginner chords</h3>
              <p className="text-soft">Maya O. · Music dept</p>
            </div>
            <div className="swap-connector">
              <SwapMark size={34} spin />
            </div>
            <div className="swap-card swap-card-right">
              <span className="pill pill-learn">Wants</span>
              <h3>Python &mdash; intro to loops</h3>
              <p className="text-soft">Maya O. · Music dept</p>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 className="section-title">How a swap actually happens</h2>
          <div className="feature-grid">
            {FEATURES.map((f) => (
              <div className={`feature-card accent-${f.accent}`} key={f.title}>
                <h3>{f.title}</h3>
                <p className="text-soft">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container cta-inner">
          <SwapMark size={40} />
          <h2>Your next study buddy is one swap away.</h2>
          <Link to="/signup" className="btn btn-primary">
            Create your free account
          </Link>
        </div>
      </section>
    </div>
  );
}
