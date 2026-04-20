import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function AdminColleges() {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user } = useContext(AuthContext);

  const fetchColleges = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://127.0.0.1:5000/api/admin/colleges?search=${search}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setColleges(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => { fetchColleges(); }, [search]);

  const handleStatusChange = async (collegeId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://127.0.0.1:5000/api/admin/colleges/${collegeId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchColleges();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const statusBadge = (status) => {
    const map = {
      pending:     { bg: 'rgba(255,171,0,0.08)',    color: 'var(--accent-orange)', border: 'rgba(255,171,0,0.3)' },
      approved:    { bg: 'rgba(25,135,84,0.12)',    color: '#75d9a3',              border: 'rgba(25,135,84,0.3)' },
      rejected:    { bg: 'rgba(108,117,125,0.12)',  color: '#adb5bd',              border: 'rgba(108,117,125,0.3)' },
      blacklisted: { bg: 'rgba(220,53,69,0.12)',    color: '#f08090',              border: 'rgba(220,53,69,0.3)' },
    };
    const s = map[status] || map.pending;
    return (
      <span className="px-2 py-1 rounded-pill" style={{background:s.bg, color:s.color, border:`1px solid ${s.border}`, fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em'}}>
        {status}
      </span>
    );
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{minHeight:'200px'}}>
      <div className="spinner-border text-warning" role="status"/>
    </div>
  );

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <h1 className="fw-bold mb-0" style={{color:'#fff'}}>Manage Colleges</h1>
        <input
          type="text"
          placeholder="Search colleges..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-control"
          style={{background:'var(--bg-card)', border:'1px solid var(--border-subtle)', color:'#fff', width:'260px'}}
        />
      </div>

      <div className="rounded-3 overflow-hidden" style={{border:'1px solid var(--border-subtle)'}}>
        <table className="table mb-0" style={{background:'var(--bg-card)', color:'var(--text-main)'}}>
          <thead style={{background:'#0d0d10', borderBottom:'1px solid var(--border-subtle)'}}>
            <tr>
              {['Name','Domain','Status','Actions'].map(h => (
                <th key={h} className="py-3 px-4 fw-semibold text-uppercase" style={{color:'var(--text-muted)', fontSize:'0.75rem', letterSpacing:'0.08em', border:'none'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {colleges.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-5" style={{color:'var(--text-muted)', border:'none'}}>No colleges found.</td></tr>
            ) : colleges.map(college => (
              <tr key={college.id} style={{borderBottom:'1px solid var(--border-subtle)', transition:'background 0.2s'}}
                onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                <td className="py-3 px-4 fw-medium" style={{color:'var(--text-main)', border:'none'}}>{college.name}</td>
                <td className="py-3 px-4" style={{color:'var(--accent-orange)', border:'none'}}>{college.domain}</td>
                <td className="py-3 px-4" style={{border:'none'}}>{statusBadge(college.status)}</td>
                <td className="py-3 px-4" style={{border:'none'}}>
                  <div className="d-flex gap-2">
                    {college.status === 'pending' && (<>
                      <button onClick={() => handleStatusChange(college.id, 'approved')} className="btn btn-sm fw-semibold" style={{background:'rgba(25,135,84,0.2)', color:'#75d9a3', border:'1px solid rgba(25,135,84,0.3)'}}>Approve</button>
                      <button onClick={() => handleStatusChange(college.id, 'rejected')} className="btn btn-sm fw-semibold" style={{background:'rgba(108,117,125,0.1)', color:'#adb5bd', border:'1px solid var(--border-subtle)'}}>Reject</button>
                    </>)}
                    {college.status === 'approved' && (
                      <button onClick={() => handleStatusChange(college.id, 'blacklisted')} className="btn btn-sm fw-semibold" style={{background:'rgba(220,53,69,0.15)', color:'#f08090', border:'1px solid rgba(220,53,69,0.3)'}}>Blacklist</button>
                    )}
                    {college.status === 'blacklisted' && (
                      <button onClick={() => handleStatusChange(college.id, 'approved')} className="btn btn-sm fw-semibold" style={{background:'rgba(25,135,84,0.2)', color:'#75d9a3', border:'1px solid rgba(25,135,84,0.3)'}}>Unblacklist</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminColleges;