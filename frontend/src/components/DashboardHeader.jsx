import React, { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function DashboardHeader() {
  const { user, logout } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
  };

  return (
    <header className="d-flex align-items-center justify-content-between px-4 sticky-top text-white" style={{height: '5rem', backgroundColor: '#111111', borderBottom: '1px solid #2a2a30', zIndex: 20}}>
      <div className="d-flex align-items-center">
        <h2 className="fs-5 fw-medium mb-0 brand-font" style={{color: 'rgba(255,255,255,0.9)', letterSpacing: '0.025em'}}>Workspace</h2>
      </div>

      <div className="d-flex align-items-center gap-4">
        {/* Notifications */}
        <div className="position-relative" ref={notifRef}>
          <button 
            onClick={() => setNotifOpen(!notifOpen)}
            className="btn p-0 text-secondary position-relative border-0 shadow-none" 
            style={{background: 'transparent'}}
            onMouseEnter={(e) => e.currentTarget.classList.replace('text-secondary', 'text-white')}
            onMouseLeave={(e) => { if(!notifOpen) e.currentTarget.classList.replace('text-white', 'text-secondary'); }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{width: '24px', height: '24px'}}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="position-absolute top-0 end-0 rounded-circle" style={{width: '8px', height: '8px', backgroundColor: 'var(--accent-orange)', border: '1px solid #111'}}></span>
          </button>

          {notifOpen && (
            <div className="position-absolute end-0 mt-3 rounded-3 shadow-lg py-2 z-3 animate-fade-in" style={{width: '20rem', backgroundColor: '#19191d', border: '1px solid #2a2a30'}}>
              <div className="px-3 py-2 border-bottom border-secondary border-opacity-10 d-flex justify-content-between align-items-center">
                <span className="fw-bold text-white fs-6">Notifications</span>
                <span className="badge rounded-pill bg-primary" style={{fontSize: '0.7rem'}}>2 New</span>
              </div>
              <div className="py-1 max-vh-50 overflow-auto">
                <div className="px-3 py-3 border-bottom border-secondary border-opacity-10 hover-bg-subtle" style={{cursor: 'pointer'}}>
                  <p className="mb-1 text-white fw-medium" style={{fontSize: '0.85rem'}}>New Match Found!</p>
                  <p className="mb-0 text-secondary" style={{fontSize: '0.75rem'}}>Someone in your college wants to learn Python.</p>
                  <span className="text-muted mt-1 d-block" style={{fontSize: '0.65rem'}}>2 hours ago</span>
                </div>
                <div className="px-3 py-3 border-bottom border-secondary border-opacity-10 hover-bg-subtle" style={{cursor: 'pointer'}}>
                  <p className="mb-1 text-white fw-medium" style={{fontSize: '0.85rem'}}>Profile Verified</p>
                  <p className="mb-0 text-secondary" style={{fontSize: '0.75rem'}}>Your college has verified your student status.</p>
                  <span className="text-muted mt-1 d-block" style={{fontSize: '0.65rem'}}>Yesterday</span>
                </div>
              </div>
              <div className="px-3 py-2 text-center">
                <button className="btn btn-link btn-sm text-secondary text-decoration-none" style={{fontSize: '0.75rem'}}>View all notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* User Dropdown */}
        <div className="position-relative" ref={dropdownRef}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="btn text-white d-flex align-items-center gap-2 p-1 pe-3 rounded-pill shadow-none"
            style={{border: dropdownOpen ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent', backgroundColor: dropdownOpen ? 'rgba(255,255,255,0.05)' : 'transparent'}}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            onMouseLeave={(e) => { if (!dropdownOpen) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; } }}
          >
            <div className="rounded-circle d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px', backgroundColor: '#19191d', border: '1px solid #2a2a30'}}>
              <span className="fw-bold" style={{color: 'var(--accent-orange)', fontSize: '0.875rem'}}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
            <div className="d-none d-md-flex flex-column align-items-start">
              <span className="fw-medium text-white" style={{fontSize: '0.875rem', letterSpacing: '0.025em'}}>{user?.name || 'User'}</span>
              <span className="text-secondary text-capitalize" style={{fontSize: '0.75rem'}}>{user?.role || 'student'}</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{width: '16px', height: '16px', transition: 'transform 0.3s', transform: dropdownOpen ? 'rotate(180deg)' : 'none'}}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="position-absolute end-0 mt-2 rounded-3 shadow py-2 z-3 animate-fade-in" style={{width: '14rem', backgroundColor: '#19191d', border: '1px solid #2a2a30', transformOrigin: 'top right'}}>
              <div className="px-3 py-2" style={{borderBottom: '1px solid #2a2a30'}}>
                <p className="fw-medium text-white mb-0" style={{fontSize: '0.875rem'}}>{user?.name}</p>
                <p className="text-secondary text-truncate mt-1 mb-0" style={{fontSize: '0.75rem'}}>{user?.email}</p>
              </div>

              <div className="py-2">
                {user?.role === 'student' && (
                  <button 
                    onClick={() => { setDropdownOpen(false); navigate('/dashboard'); }}
                    className="btn w-100 text-start px-3 py-2 d-flex align-items-center gap-2 border-0 rounded-0"
                    style={{color: '#d1d5db', backgroundColor: 'transparent'}}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#d1d5db'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{width: '16px', height: '16px'}}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Edit Profile
                  </button>
                )}
                {user?.role !== 'admin' && (
                  <button 
                    onClick={() => { setDropdownOpen(false); window.location.href = 'mailto:support@stackmate.com'; }}
                    className="btn w-100 text-start px-3 py-2 d-flex align-items-center gap-2 border-0 rounded-0"
                    style={{color: '#d1d5db', backgroundColor: 'transparent'}}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#d1d5db'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{width: '16px', height: '16px'}}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Contact Support
                  </button>
                )}
              </div>
              
              <div className="py-2" style={{borderTop: '1px solid #2a2a30'}}>
                <button 
                  onClick={handleLogout}
                  className="btn w-100 text-start px-3 py-2 d-flex align-items-center gap-2 border-0 rounded-0"
                  style={{color: '#ef4444', backgroundColor: 'transparent'}}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{width: '16px', height: '16px'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;

