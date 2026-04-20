import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="page-container">
      
      {/* Hero Section */}
      <div className="badge">🎓 College Skill Exchange Platform</div>
      
      <h1 className="title-massive">
        Trade Skills,<br/>
        <span className="text-orange">Not Money</span>
      </h1>
      
      <p className="subtitle">
        StackMate connects college students to exchange skills peer-to-peer. Teach what you know. Learn what you need.
      </p>
      
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '8rem' }}>
        <Link to="/waitlist" className="btn-primary">
          Get Started Free
        </Link>
        <Link to="/about" className="btn-secondary">
          Learn More &rarr;
        </Link>
      </div>

      {/* Features Section */}
      <p className="section-label">WHY STACKMATE</p>
      <h2 style={{fontSize: '2.5rem', marginBottom: '1rem'}}>Everything you need to exchange skills</h2>
      
      <div className="grid-4" style={{marginBottom: '8rem'}}>
        <div className="feature-card">
          <div className="feature-icon">🔄</div>
          <h3 className="feature-title">Skill Exchange</h3>
          <p className="feature-desc">
            Trade your skills with peers. Teach DSA, learn Design. No money involved.
          </p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">🏫</div>
          <h3 className="feature-title">College Only</h3>
          <p className="feature-desc">
            Only verified students from approved colleges can join. Safe and trusted.
          </p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">🤝</div>
          <h3 className="feature-title">Mutual Matching</h3>
          <p className="feature-desc">
            You only match when both sides benefit. Fair exchange, always.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">💬</div>
          <h3 className="feature-title">Connect & Chat</h3>
          <p className="feature-desc">
            Chat with your match, schedule sessions, and grow together.
          </p>
        </div>
      </div>

      {/* Steps Section */}
      <p className="section-label">HOW IT WORKS</p>
      <h2 style={{fontSize: '2.5rem', marginBottom: '1rem'}}>Start exchanging in 4 simple steps</h2>

      <div className="grid-4" style={{marginBottom: '8rem'}}>
        <div className="feature-card">
          <div className="step-no">01</div>
          <h3 className="feature-title">Sign Up</h3>
          <p className="feature-desc">Register with your college email</p>
        </div>

        <div className="feature-card">
          <div className="step-no">02</div>
          <h3 className="feature-title">Add Skills</h3>
          <p className="feature-desc">List what you offer and what you want</p>
        </div>

        <div className="feature-card">
          <div className="step-no">03</div>
          <h3 className="feature-title">Get Matched</h3>
          <p className="feature-desc">We find your perfect skill partner</p>
        </div>

        <div className="feature-card">
          <div className="step-no">04</div>
          <h3 className="feature-title">Exchange</h3>
          <p className="feature-desc">Connect, learn, and grow together</p>
        </div>
      </div>

      {/* Bottom CTA */}
      <h1 className="title-massive" style={{fontSize: '4rem', marginBottom: '1.5rem'}}>
        Ready to start exchanging?
      </h1>
      <p className="subtitle" style={{marginBottom: '2rem'}}>
        Join hundreds of students already growing their skills.
      </p>
      <Link to="/waitlist" className="btn-primary">Join StackMate Free</Link>

    </div>
  );
}

export default Home;
