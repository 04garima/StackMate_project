import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://127.0.0.1:5000/api/analytics/admin', {
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
      <h1 className="fw-bold mb-4" style={{color:'#fff'}}>Admin Overview</h1>

      <div className="row g-4 mb-4">
        {[{label:'Total Students', value: stats.totalStudents}, {label:'Total Colleges', value: stats.totalColleges}].map(item => (
          <div className="col-12 col-md-6" key={item.label}>
            <div className="rounded-3 p-4" style={{background:'var(--bg-card)', border:'1px solid var(--border-subtle)', transition:'border-color 0.3s'}}
              onMouseEnter={e => e.currentTarget.style.borderColor='rgba(255,171,0,0.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor='var(--border-subtle)'}>
              <p className="mb-1 text-uppercase fw-bold" style={{color:'var(--text-muted)', fontSize:'0.8rem', letterSpacing:'0.08em'}}>{item.label}</p>
              <h2 className="fw-bold mb-0" style={{color:'#fff'}}>{item.value}</h2>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {[{title:'Most Offered Skills', data: stats.mostOffered}, {title:'Most Wanted Skills', data: stats.mostWanted}].map(section => (
          <div className="col-12 col-md-6" key={section.title}>
            <div className="rounded-3 p-4 h-100" style={{background:'var(--bg-card)', border:'1px solid var(--border-subtle)'}}>
              <h6 className="fw-bold mb-4" style={{color:'var(--text-main)'}}>{section.title}</h6>
              {section.data.length === 0 ? (
                <p style={{color:'var(--text-muted)'}}>No data yet</p>
              ) : (
                <ul className="list-unstyled mb-0">
                  {section.data.map(([skill, count]) => (
                    <li key={skill} className="d-flex justify-content-between align-items-center mb-3">
                      <span style={{color:'var(--text-muted)'}}>{skill}</span>
                      <span className="px-3 py-1 rounded-pill" style={{background:'rgba(255,171,0,0.05)', color:'var(--accent-orange)', border:'1px solid rgba(255,171,0,0.3)', fontSize:'0.75rem'}}>
                        {count} Users
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;