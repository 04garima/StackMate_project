import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';

function Matches() {
  const location = useLocation();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const fetchMatches = async (type = filterType) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://127.0.0.1:5000/api/match?type=${type}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMatches(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [filterType]);

  const handleSendRequest = async (targetUserId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://127.0.0.1:5000/api/match/request', 
        { target_user_id: targetUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMatches(); // Refresh to update status
    } catch (err) {
      console.error(err);
      alert('Failed to send request');
    }
  };

  const [aiLoading, setAiLoading] = useState({});

  const handleConsultAI = async (peerId) => {
    try {
      setAiLoading(prev => ({ ...prev, [peerId]: true }));
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://127.0.0.1:5000/api/match/ai-score/${peerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMatches(prev => prev.map(m => m.id === peerId ? { 
        ...m, 
        matchScore: res.data.score, 
        matchReason: res.data.reason,
        isAI: res.data.is_ai
      } : m));
    } catch (err) {
      console.error(err);
      alert('AI Analysis failed.');
    } finally {
      setAiLoading(prev => ({ ...prev, [peerId]: false }));
    }
  };

  const filteredMatches = matches.filter(match => {
    const searchLow = searchTerm.toLowerCase();
    const nameMatch = match.name.toLowerCase().includes(searchLow);
    const roleMatch = match.role.toLowerCase().includes(searchLow);
    const skillMatch = 
        (match.youCanTeach || []).some(s => s.toLowerCase().includes(searchLow)) ||
        (match.theyCanTeach || []).some(s => s.toLowerCase().includes(searchLow));
        
    return nameMatch || roleMatch || skillMatch;
  });

  return (
    <div className="fade-in">
      <h1 className="fw-bold mb-1" style={{color: 'var(--accent-orange)'}}>Discover Peers</h1>
      <p style={{color: 'var(--text-muted)'}} className="mb-4">Explore students in your college and start collaborating based on shared skills.</p>

      {/* Filtering and Searching UI */}
      <div className="d-flex flex-wrap gap-3 mb-4 p-3 rounded-3 align-items-center" style={{backgroundColor: '#19191d', border: '1px solid #2a2a30'}}>
        <div className="flex-grow-1" style={{minWidth: '200px'}}>
          <input 
            type="text" 
            className="form-control text-white border-secondary shadow-none" 
            style={{ backgroundColor: '#25252b', border: '1px solid #3f3f46' }}
            placeholder="Search by name, role, or skill..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{minWidth: '150px'}}>
          <select 
            className="form-select text-white border-secondary shadow-none"
            style={{ backgroundColor: '#25252b', border: '1px solid #3f3f46' }}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="mutual">Mutual Matches</option>
            <option value="they_teach">They can teach me</option>
            <option value="i_teach">I can teach them</option>
            <option value="all">All Potential Peers</option>
          </select>
        </div>
        <button 
          className="btn fw-bold px-4" 
          style={{backgroundColor: 'var(--accent-orange)', color: '#000'}} 
          onClick={() => fetchMatches()}
          disabled={loading}
        >
          {loading ? "Searching..." : "Refresh"}
        </button>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-warning" role="status"/>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="text-center py-5 rounded-4 shadow-sm" style={{background:'rgba(255,255,255,0.02)', border:'1px dashed #2a2a30'}}>
          <div className="mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{width: '64px', height: '64px', color: 'rgba(255,255,255,0.1)'}}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h5 className="fw-bold" style={{color:'var(--text-main)'}}>No Peers Found</h5>
          <p className="mx-auto mb-4" style={{color:'var(--text-muted)', maxWidth: '400px'}}>
            We couldn't find any students matching your criteria. Try adjusting your filters or search term.
          </p>
          <Link to="/dashboard" className="btn fw-bold px-4 py-2" style={{background: 'var(--accent-orange)', color: '#000'}}>
            Update My Skills
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          {filteredMatches.map((match) => (
            <div 
              key={match.id} 
              id={`peer-${match.id}`}
              className="col-12 col-md-6 col-lg-4"
              style={location.state?.scrollTo === match.id ? { transform: 'scale(1.02)', transition: 'all 0.5s ease' } : {}}
            >
              <div 
                className="rounded-3 p-4 h-100 d-flex flex-column" 
                style={{
                  background:'var(--bg-card)', 
                  border: location.state?.scrollTo === match.id ? '2px solid var(--accent-orange)' : '1px solid var(--border-subtle)', 
                  transition:'border-color 0.3s'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor='rgba(255,171,0,0.3)'}
                onMouseLeave={e => e.currentTarget.style.borderColor=location.state?.scrollTo === match.id ? 'var(--accent-orange)' : 'var(--border-subtle)'}
              >
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                    style={{width:'48px', height:'48px', background:'rgba(255,171,0,0.1)', border:'1px solid rgba(255,171,0,0.2)', color:'var(--accent-orange)', fontSize:'1.2rem'}}>
                    {match.name.charAt(0)}
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="mb-0 fw-bold" style={{color:'#fff'}}>{match.name}</h6>
                        <small style={{color:'var(--text-muted)', textTransform:'capitalize'}}>{match.role}</small>
                      </div>
                      <div className="text-end">
                        <div className={`badge ${match.matchScore >= 80 ? 'bg-success' : match.matchScore >= 50 ? 'bg-warning' : 'bg-secondary'} bg-opacity-10 text-${match.matchScore >= 80 ? 'success' : match.matchScore >= 50 ? 'warning' : 'secondary'} border border-${match.matchScore >= 80 ? 'success' : match.matchScore >= 50 ? 'warning' : 'secondary'} border-opacity-25`} style={{fontSize: '0.7rem'}}>
                          {match.matchScore}% Match
                        </div>
                      </div>
                    </div>
                    <div className="mt-1">
                      {match.connectionStatus === 'accepted' && <span className="badge bg-success bg-opacity-10 text-success me-1" style={{fontSize: '0.65rem'}}>Connected</span>}
                      {match.connectionStatus === 'pending' && <span className="badge bg-warning bg-opacity-10 text-warning me-1" style={{fontSize: '0.65rem'}}>Pending Request</span>}
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="mb-2" style={{color:'var(--text-muted)', fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:600}}>They can teach you:</p>
                  <div className="d-flex flex-wrap gap-1">
                    {match.theyCanTeach.map(skill => (
                      <span key={`they-${skill}`} className="px-2 py-1 rounded" style={{background:'rgba(25,135,84,0.15)', color:'#75d9a3', border:'1px solid rgba(25,135,84,0.3)', fontSize:'0.75rem'}}>{skill}</span>
                    ))}
                    {match.theyCanTeach.length === 0 && <span className="text-secondary" style={{fontSize: '0.8rem'}}>No matching skills</span>}
                  </div>
                </div>

                <div className="mb-3">
                  <p className="mb-2" style={{color:'var(--text-muted)', fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:600}}>
                    {match.isAI ? "AI Insights:" : "Compatibility:"}
                  </p>
                  <div style={{ maxHeight: '120px', overflowY: 'auto', paddingRight: '5px' }} className="custom-scrollbar">
                    <p className="small text-white opacity-75 mb-0" style={{fontStyle: 'italic', fontSize: '0.85rem', whiteSpace: 'pre-line'}}>
                      "{match.matchReason}"
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="mb-2" style={{color:'var(--text-muted)', fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:600}}>You can teach them:</p>
                  <div className="d-flex flex-wrap gap-1">
                    {match.youCanTeach.map(skill => (
                      <span key={`you-${skill}`} className="px-2 py-1 rounded" style={{background:'rgba(255,171,0,0.05)', color:'var(--accent-orange)', border:'1px solid rgba(255,171,0,0.3)', fontSize:'0.75rem'}}>{skill}</span>
                    ))}
                    {match.youCanTeach.length === 0 && <span className="text-secondary" style={{fontSize: '0.8rem'}}>No matching skills</span>}
                  </div>
                </div>

                <div className="mt-auto">
                  {!match.isAI && (
                    <button 
                      onClick={() => handleConsultAI(match.id)}
                      disabled={aiLoading[match.id]}
                      className="btn w-100 mb-2 d-flex align-items-center justify-content-center gap-2"
                      style={{
                        background: 'rgba(13, 202, 240, 0.1)',
                        border: '1px solid rgba(13, 202, 240, 0.2)',
                        color: '#0dcaf0',
                        fontSize: '0.8rem',
                        padding: '8px',
                        borderRadius: '8px'
                      }}
                    >
                      {aiLoading[match.id] ? (
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0M7 11.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5m.5-4a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0m1.5-3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3M5 7a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m.5 4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5"/>
                        </svg>
                      )}
                      {aiLoading[match.id] ? 'Analyzing...' : 'Consult StackMate AI'}
                    </button>
                  )}

                  {match.connectionStatus === 'accepted' ? (
                    match.isBlockedByMe || match.hasBlockedMe ? (
                      <button className="btn fw-bold w-100 disabled" style={{background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.3)', border:'1px solid var(--border-subtle)'}}>
                        Chat Unavailable
                      </button>
                    ) : (
                      <Link to="/chat" state={{ peer: match }} className="btn fw-bold w-100" style={{background:'rgba(25,135,84,0.2)', color:'#75d9a3', border:'1px solid rgba(25,135,84,0.3)'}}>
                        Open Chat
                      </Link>
                    )
                  ) : match.connectionStatus === 'pending' ? (
                    <button className="btn fw-bold w-100 disabled" style={{background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.3)', border:'1px solid var(--border-subtle)'}}>
                      Request Sent
                    </button>
                  ) : (
                    <button onClick={() => handleSendRequest(match.id)} className="btn fw-bold w-100" style={{background:'var(--accent-orange)', color:'#000'}}>
                      Send Match Request
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Matches;