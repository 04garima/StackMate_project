import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function CollegeStudents() {
  const { user } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://127.0.0.1:5000/api/college/students?search=${search}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchStudents(); }, [search]);

  const handleStatusChange = async (studentId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://127.0.0.1:5000/api/college/students/${studentId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchStudents();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <h1 className="fw-bold mb-0" style={{color:'#fff'}}>Manage Students</h1>
        <input
          type="text"
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-control"
          style={{backgroundColor: '#25252b', border: '1px solid #3f3f46', color:'#fff', width:'260px'}}
        />
      </div>

      <div className="rounded-3 overflow-hidden" style={{border:'1px solid var(--border-subtle)'}}>
        <table className="table mb-0" style={{background:'var(--bg-card)'}}>
          <thead style={{background:'#0d0d10', borderBottom:'1px solid var(--border-subtle)'}}>
            <tr>
              {['Name','Email','Status','Actions'].map(h => (
                <th key={h} className="py-3 px-4 fw-semibold text-uppercase" style={{fontSize:'0.75rem', letterSpacing:'0.08em', border:'none'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-5" style={{color:'var(--text-muted)', border:'none'}}>No students found.</td></tr>
            ) : students.map(student => (
              <tr key={student.id} style={{borderBottom:'1px solid var(--border-subtle)', transition:'background 0.2s'}}
                onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                <td className="py-3 px-4 fw-medium" style={{border:'none'}}>{student.name}</td>
                <td className="py-3 px-4" style={{color:'var(--accent-orange)', border:'none'}}>{student.email}</td>
                <td className="py-3 px-4" style={{border:'none'}}>
                  <span className="px-2 py-1 rounded-pill" style={{
                    background: student.status === 'active' ? 'rgba(25,135,84,0.12)' : 'rgba(220,53,69,0.12)',
                    color: student.status === 'active' ? '#75d9a3' : '#f08090',
                    border: `1px solid ${student.status === 'active' ? 'rgba(25,135,84,0.3)' : 'rgba(220,53,69,0.3)'}`,
                    fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em'
                  }}>
                    {student.status}
                  </span>
                </td>
                <td className="py-3 px-4" style={{border:'none'}}>
                  {student.status === 'active' ? (
                    <button onClick={() => handleStatusChange(student.id, 'blacklisted')} className="btn btn-sm fw-semibold"
                      style={{background:'rgba(220,53,69,0.15)', color:'#f08090', border:'1px solid rgba(220,53,69,0.3)'}}>
                      Blacklist
                    </button>
                  ) : (
                    <button onClick={() => handleStatusChange(student.id, 'active')} className="btn btn-sm fw-semibold"
                      style={{background:'rgba(25,135,84,0.2)', color:'#75d9a3', border:'1px solid rgba(25,135,84,0.3)'}}>
                      Unblacklist
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CollegeStudents;