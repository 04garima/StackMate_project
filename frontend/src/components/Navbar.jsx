import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  
  const isActive = (path) => location.pathname === path ? "active" : "";

  return (
    <nav className="navbar">
      <div className="nav-logo">
        <Link style={{textDecoration: 'none'}} to="/">
          <h2 className="brand-font">Stack<span className="text-orange">Mate</span></h2>
        </Link>
      </div>
      
      <div className="nav-links">
        <Link to="/" className={isActive('/')}>Home</Link>
        <Link to="/about" className={isActive('/about')}>About</Link>
        <Link to="/contact" className={isActive('/contact')}>Contact</Link>
        {user && (
          <>
            <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
            <Link to="/matches" className={isActive('/matches')}>Matches</Link>
          </>
        )}
      </div>

      <div className="nav-actions">
        {user ? (
          <>
            <span style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginRight: '1rem'}}>
              Hey, <strong style={{color: '#fff'}}>{user?.name?.split(' ')[0] || 'User'}</strong>
            </span>
            <button onClick={logout} className="btn-login" style={{cursor: 'pointer', background: 'transparent'}}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-login">Login</Link>
            <Link to="/signup" className="btn-signup">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
