import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Sidebar() {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const role = user?.role || 'student';

  const links = {
    admin: [
      { name: "Overview", path: "/admin/dashboard", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
      { name: "Colleges", path: "/admin/colleges", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" }
    ],
    college: [
      { name: "Overview", path: "/college/dashboard", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
      { name: "Students", path: "/college/students", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" }
    ],
    student: [
      { name: "Profile", path: "/dashboard", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
      { name: "Matches", path: "/matches", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
      { name: "Chat", path: "/chat", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" }
    ]
  };

  const currentLinks = links[role] || links.student;

  return (
    <div className="d-flex flex-column vh-100" style={{width: '256px', backgroundColor: '#111111', borderRight: '1px solid #2a2a30', zIndex: 20}}>
      <div className="p-4 pb-3">
        <Link to="/" className="d-flex align-items-center gap-3 text-decoration-none">
          <h2 className="fs-4 fw-bold text-white mb-0 brand-font">StackMate</h2>
        </Link>
        <div className="mt-3 d-flex align-items-center gap-2">
          <span className="rounded-circle" style={{width: '8px', height: '8px', backgroundColor: 'var(--accent-orange)'}}></span>
          <p className="mb-0 fw-bold text-uppercase" style={{fontSize: '0.75rem', color: 'var(--accent-orange)', letterSpacing: '0.1em'}}>{role} Portal</p>
        </div>
      </div>

      <nav className="flex-grow-1 px-3 mt-4 d-flex flex-column gap-2">
        {currentLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none fw-medium transition-all ${
                isActive 
                ? "text-white" 
                : "text-secondary"
              }`}
              style={isActive ? {backgroundColor: '#19191d', borderLeft: '4px solid var(--accent-orange)'} : {}}
              onMouseEnter={(e) => { if(!isActive) { e.currentTarget.style.color = 'white'; e.currentTarget.style.backgroundColor = '#19191d'; } }}
              onMouseLeave={(e) => { if(!isActive) { e.currentTarget.style.color = '#6c757d'; e.currentTarget.style.backgroundColor = 'transparent'; } }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{width: '20px', height: '20px', color: isActive ? 'var(--accent-orange)' : 'currentColor'}}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 2 : 1.5} d={link.icon} />
              </svg>
              {link.name}
            </Link>
          );
        })}
      </nav>
      
      {/* Decorative Bottom Graphic */}
      <div className="p-4 mt-auto">
        <div className="rounded-3 p-3 text-center" style={{backgroundColor: '#19191d', border: '1px solid #2a2a30'}}>
          <p className="fw-bold text-secondary mb-0" style={{fontSize: '0.75rem'}}>StackMate Core v2.0</p>
          <p className="text-secondary mt-1 text-uppercase mb-0" style={{fontSize: '10px'}}>Connected</p>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
