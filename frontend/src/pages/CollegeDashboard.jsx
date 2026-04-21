import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function CollegeDashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://127.0.0.1:5000/api/analytics/college', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  if (!stats) return (
    <div className="d-flex justify-content-center align-items-center" style={{minHeight:'200px'}}>
      <div className="spinner-border text-warning" role="status"/>
    </div>
  );

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold mb-1" style={{color:'#fff'}}>College Overview</h1>
          <p style={{color:'var(--text-muted)'}}>Manage your student community and track platform engagement.</p>
        </div>
        <div className="text-end">
          <span className="badge bg-success bg-opacity-10 text-success border-0 px-3 py-2">Verified College</span>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="rounded-4 p-4 h-100" style={{background:'linear-gradient(145deg, #1d1d21 0%, #161619 100%)', border:'1px solid var(--border-subtle)'}}>
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="p-2 rounded-3" style={{background: 'rgba(255,171,0,0.1)', color: 'var(--accent-orange)'}}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="mb-0 text-uppercase fw-bold" style={{color:'var(--text-muted)', fontSize:'0.75rem', letterSpacing:'0.05em'}}>Total Students</p>
            </div>
            <h2 className="fw-bold mb-0" style={{color:'#fff', fontSize: '2.5rem'}}>{stats.totalStudents}</h2>
          </div>
        </div>
        <div className="col-md-4">
          <div className="rounded-4 p-4 h-100" style={{background:'rgba(25,135,84,0.02)', border:'1px solid rgba(25,135,84,0.15)'}}>
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="p-2 rounded-3" style={{background: 'rgba(25,135,84,0.1)', color: '#75d9a3'}}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="mb-0 text-uppercase fw-bold" style={{color:'var(--text-muted)', fontSize:'0.75rem', letterSpacing:'0.05em'}}>Active Accounts</p>
            </div>
            <h2 className="fw-bold mb-0" style={{color:'#75d9a3', fontSize: '2.5rem'}}>{stats.totalStudents}</h2>
            <p className="small text-muted mt-2 mb-0">98% of total student body</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="rounded-4 p-4 h-100" style={{background:'rgba(220,53,69,0.02)', border:'1px solid rgba(220,53,69,0.15)'}}>
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="p-2 rounded-3" style={{background: 'rgba(220,53,69,0.1)', color: '#f08090'}}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p className="mb-0 text-uppercase fw-bold" style={{color:'var(--text-muted)', fontSize:'0.75rem', letterSpacing:'0.05em'}}>Blacklisted</p>
            </div>
            <h2 className="fw-bold mb-0" style={{color:'#f08090', fontSize: '2.5rem'}}>0</h2>
            <p className="small text-muted mt-2 mb-0">Needs immediate review</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row g-4">
        <div className="col-lg-6">
          <div className="rounded-4 p-4" style={{background: 'var(--bg-card)', border: '1px solid var(--border-subtle)'}}>
            <h5 className="fw-bold mb-4 text-white">Management Quick Links</h5>
            <div className="d-grid gap-3">
              <a href="/college/students" className="d-flex align-items-center justify-content-between p-3 rounded-3 text-decoration-none transition-all hover-bg-subtle" style={{background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)'}}>
                <div className="d-flex align-items-center gap-3">
                  <div className="p-2 rounded bg-primary bg-opacity-10 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  </div>
                  <div>
                    <p className="mb-0 fw-bold text-white">Manage Student List</p>
                    <p className="mb-0 small text-muted">Active, Blacklisted, and Pending</p>
                  </div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-muted"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </a>
              <a href="/contact" className="d-flex align-items-center justify-content-between p-3 rounded-3 text-decoration-none transition-all hover-bg-subtle" style={{background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)'}}>
                <div className="d-flex align-items-center gap-3">
                  <div className="p-2 rounded bg-warning bg-opacity-10 text-warning">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  </div>
                  <div>
                    <p className="mb-0 fw-bold text-white">Contact Platform Admin</p>
                    <p className="mb-0 small text-muted">Technical support & inquiries</p>
                  </div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-muted"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </a>
            </div>
          </div>
        </div>
        
        <div className="col-lg-6">
          <div className="rounded-4 p-4 h-100 d-flex flex-column justify-content-center align-items-center text-center" style={{background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border-subtle)'}}>
            <p className="text-muted mb-0">More insights coming soon</p>
            <p className="small text-muted">Department analytics and verification logs are under development.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CollegeDashboard;