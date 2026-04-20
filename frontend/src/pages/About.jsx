import React from 'react';

function About() {
  return (
    <div className="page-container">
      
      {/* Mission Card EXACTLY like Image 3 */}
      <div className="mission-card">
        <p className="section-label">OUR MISSION</p>
        <h2 className="mission-quote">
          "Make skill exchange as easy as sending a message"
        </h2>
        <p className="feature-desc" style={{fontSize: '1.1rem', maxWidth: '750px', margin: '0 auto'}}>
          Every college has students who are great at DSA but struggle with design. Others are designers who can't crack coding interviews. StackMate matches them — so both grow, for free, together.
        </p>
      </div>

      {/* Core Values EXACTLY like Image 2 */}
      <p className="section-label" style={{marginTop: '2rem'}}>WHAT WE STAND FOR</p>
      <h2 style={{fontSize: '2.5rem', marginBottom: '1rem', color: '#fff'}}>Our Core Values</h2>
      
      {/* grid-4 forces 4 items in one line */}
      <div className="grid-4" style={{marginBottom: '6rem'}}> 
        <div className="feature-card">
          <h3 className="feature-title">Peer Learning</h3>
          <p className="feature-desc">We believe students learn best from each other, not just textbooks.</p>
        </div>
        <div className="feature-card">
          <h3 className="feature-title">Fair Exchange</h3>
          <p className="feature-desc">Every match is mutual. No one gives without receiving.</p>
        </div>
        <div className="feature-card">
          <h3 className="feature-title">Trust First</h3>
          <p className="feature-desc">Only verified college students. No randoms, no spam.</p>
        </div>
        <div className="feature-card">
          <h3 className="feature-title">Keep It Simple</h3>
          <p className="feature-desc">No complicated system. Just connect and exchange.</p>
        </div>
      </div>

      {/* The Tech Stack */}
      <p className="section-label">TECH STACK</p>
      <h2 style={{fontSize: '2.5rem', color: '#fff', marginBottom: '1rem'}}>What powers StackMate</h2>
      
      <div className="grid-4" style={{marginBottom: '4rem'}}>
        <div className="feature-card" style={{textAlign: 'center', padding: '2rem 1rem'}}>
          <div className="feature-icon">⚛️</div>
          <h3 className="feature-title">React</h3>
          <p className="feature-desc" style={{fontSize: '0.85rem'}}>Vite and React functional components for lightning-fast frontend delivery.</p>
        </div>
        
        <div className="feature-card" style={{textAlign: 'center', padding: '2rem 1rem'}}>
          <div className="feature-icon">🐍</div>
          <h3 className="feature-title">Flask</h3>
          <p className="feature-desc" style={{fontSize: '0.85rem'}}>A lightweight, performant Python backend handling REST APIs efficiently.</p>
        </div>

        <div className="feature-card" style={{textAlign: 'center', padding: '2rem 1rem'}}>
          <div className="feature-icon">🍃</div>
          <h3 className="feature-title">MongoDB</h3>
          <p className="feature-desc" style={{fontSize: '0.85rem'}}>A robust NoSQL database utilized locally with MongoDB Compass and PyMongo.</p>
        </div>

        <div className="feature-card" style={{textAlign: 'center', padding: '2rem 1rem'}}>
          <div className="feature-icon">🔐</div>
          <h3 className="feature-title">JWT Auth</h3>
          <p className="feature-desc" style={{fontSize: '0.85rem'}}>Secure stateless JSON Web Tokens for protecting API routes.</p>
        </div>
      </div>
      
    </div>
  );
}

export default About;
