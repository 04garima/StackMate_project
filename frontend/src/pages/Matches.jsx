import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://127.0.0.1:5000/api/match', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMatches(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  const filteredMatches = matches.filter(match => {
    // Search match by name, role, or skill
    const searchLow = searchTerm.toLowerCase();
    const nameMatch = match.name.toLowerCase().includes(searchLow);
    const roleMatch = match.role.toLowerCase().includes(searchLow);
    const skillMatch = 
        match.youCanTeach.some(s => s.toLowerCase().includes(searchLow)) ||
        match.theyCanTeach.some(s => s.toLowerCase().includes(searchLow));
        
    const passesSearch = nameMatch || roleMatch || skillMatch;
    
    if (!passesSearch) return false;
    
    // Filter
    if (filterType === 'all') return true;
    if (filterType === 'you_teach' && match.youCanTeach.length > 0) return true;
    if (filterType === 'they_teach' && match.theyCanTeach.length > 0) return true;
    if (filterType === 'mutual' && match.youCanTeach.length > 0 && match.theyCanTeach.length > 0) return true;
    
    return false;
  });

  return (
    <div className="fade-in">
      <h1 className="fw-bold mb-1" style={{color: 'var(--accent-orange)'}}>Your Matches</h1>
      <p style={{color: 'var(--text-muted)'}} className="mb-4">Peers who want to learn what you know, and know what you want to learn.</p>

      {/* Filtering and Searching UI */}
      <div className="d-flex flex-wrap gap-3 mb-4 p-3 rounded-3 align-items-center" style={{backgroundColor: '#19191d', border: '1px solid #2a2a30'}}>
        <div className="flex-grow-1" style={{minWidth: '200px'}}>
          <input 
            type="text" 
            className="form-control text-white border-secondary shadow-none bg-dark" 
            placeholder="Search by name, role, or skill..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{minWidth: '150px'}}>
          <select 
            className="form-select text-white border-secondary shadow-none bg-dark"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Matches</option>
            <option value="they_teach">They can teach me</option>
            <option value="you_teach">I can teach them</option>
            <option value="mutual">Mutual Matches (Both teach)</option>
          </select>
        </div>
        <button 
          className="btn fw-bold" 
          style={{backgroundColor: 'var(--accent-orange)', color: '#000'}} 
          onClick={() => {
            setLoading(true);
            const token = localStorage.getItem('token');
            axios.get('http://127.0.0.1:5000/api/match', {
              headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => setMatches(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
          }}
        >
          {loading ? "Searching..." : "Find Matches"}
        </button>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-warning" role="status"/>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="text-center py-5 rounded-3" style={{background:'var(--bg-card)', border:'1px solid var(--border-subtle)'}}>
          <h5 style={{color:'var(--text-main)'}}>No matches found</h5>
          <p style={{color:'var(--text-muted)'}}>Try updating your skills on your dashboard or adjusting your search filters to find more peers.</p>
        </div>
      ) : (
        <div className="row g-4">
          {filteredMatches.map((match) => (
            <div key={match.id} className="col-12 col-md-6 col-lg-4">
              <div className="rounded-3 p-4 h-100 d-flex flex-column" style={{background:'var(--bg-card)', border:'1px solid var(--border-subtle)', transition:'border-color 0.3s'}}
                onMouseEnter={e => e.currentTarget.style.borderColor='rgba(255,171,0,0.3)'}
                onMouseLeave={e => e.currentTarget.style.borderColor='var(--border-subtle)'}
              >
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                    style={{width:'48px', height:'48px', background:'rgba(255,171,0,0.1)', border:'1px solid rgba(255,171,0,0.2)', color:'var(--accent-orange)', fontSize:'1.2rem'}}>
                    {match.name.charAt(0)}
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold" style={{color:'#fff'}}>{match.name}</h6>
                    <small style={{color:'var(--text-muted)', textTransform:'capitalize'}}>{match.role}</small>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="mb-2" style={{color:'var(--text-muted)', fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:600}}>They can teach you:</p>
                  <div className="d-flex flex-wrap gap-1">
                    {match.theyCanTeach.map(skill => (
                      <span key={`they-${skill}`} className="px-2 py-1 rounded" style={{background:'rgba(25,135,84,0.15)', color:'#75d9a3', border:'1px solid rgba(25,135,84,0.3)', fontSize:'0.75rem'}}>{skill}</span>
                    ))}
                    {match.theyCanTeach.length === 0 && <span className="text-secondary" style={{fontSize: '0.8rem'}}>No matching skills requested</span>}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="mb-2" style={{color:'var(--text-muted)', fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:600}}>You can teach them:</p>
                  <div className="d-flex flex-wrap gap-1">
                    {match.youCanTeach.map(skill => (
                      <span key={`you-${skill}`} className="px-2 py-1 rounded" style={{background:'rgba(255,171,0,0.05)', color:'var(--accent-orange)', border:'1px solid rgba(255,171,0,0.3)', fontSize:'0.75rem'}}>{skill}</span>
                    ))}
                    {match.youCanTeach.length === 0 && <span className="text-secondary" style={{fontSize: '0.8rem'}}>They don't strictly need your skills</span>}
                  </div>
                </div>

                <Link to="/chat" state={{ peer: match }} className="btn fw-bold mt-auto w-100 text-decoration-none text-center"
                  style={{background:'var(--accent-orange)', color:'#000'}}>
                  Chat Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Matches;