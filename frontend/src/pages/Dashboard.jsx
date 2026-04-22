import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import SkillSelector from '../components/SkillSelector';

function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role === 'admin') navigate('/admin/dashboard', { replace: true });
    if (user && user.role === 'college') navigate('/college/dashboard', { replace: true });
  }, [user, navigate]);

  const [profile, setProfile] = useState(null);
  const [skillsOfferedInput, setSkillsOfferedInput] = useState('');
  const [skillsWantedInput, setSkillsWantedInput] = useState('');
  const [matches, setMatches] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [profileRes, matchesRes] = await Promise.all([
          axios.get('http://127.0.0.1:5000/api/profile/me', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://127.0.0.1:5000/api/match?type=all', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        setProfile(profileRes.data);
        setSkillsOfferedInput(profileRes.data.skillsOffered.join(', '));
        setSkillsWantedInput(profileRes.data.skillsWanted.join(', '));
        setMatches(matchesRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const offers = skillsOfferedInput.split(',').map(s => s.trim()).filter(Boolean);
      const wants = skillsWantedInput.split(',').map(s => s.trim()).filter(Boolean);
      await axios.put('http://127.0.0.1:5000/api/profile/skills', {
        skillsOffered: offers,
        skillsWanted: wants
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Skills updated successfully!');
      setMessageType('success');
      
      // Refresh matches after skill update
      const matchesRes = await axios.get('http://127.0.0.1:5000/api/match?type=all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMatches(matchesRes.data);
      
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to update skills.');
      setMessageType('danger');
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
    } finally {
      setAiLoading(prev => ({ ...prev, [peerId]: false }));
    }
  };

  const [bulkLoading, setBulkLoading] = useState(false);
  const handleBulkAnalyze = async () => {
    setBulkLoading(true);
    const topPeers = matches.slice(0, 3).filter(m => !m.isAI);
    
    for (const peer of topPeers) {
      await handleConsultAI(peer.id);
      // Wait a bit between calls to avoid 429
      await new Promise(r => setTimeout(r, 2000));
    }
    setBulkLoading(false);
  };

  if (!profile) return (
    <div className="d-flex justify-content-center align-items-center" style={{minHeight: '200px'}}>
      <div className="spinner-border text-warning" role="status"/>
    </div>
  );

  return (
    <div className="fade-in">

      <div className="row g-4">
        <div className="col-lg-7">
          <h1 className="fw-bold mb-1" style={{color: '#fff'}}>Welcome, {profile.name}!</h1>
          <p style={{color: 'var(--text-muted)'}} className="mb-4">Configure your learning profile to find matches.</p>

          {message && (
            <div className={`alert alert-${messageType} border-0 mb-4`} style={{
              background: messageType === 'success' ? 'rgba(25,135,84,0.15)' : 'rgba(220,53,69,0.15)',
              color: messageType === 'success' ? '#75d9a3' : '#f08090'
            }}>
              {message}
            </div>
          )}

          <div className="rounded-3 p-4 mb-4" style={{background: 'var(--bg-card)', border: '1px solid var(--border-subtle)'}}>
            <form onSubmit={handleUpdate}>
              <SkillSelector 
                label={<>I can teach <span style={{color:'var(--accent-orange)'}}>( comma separated )</span></>}
                value={skillsOfferedInput}
                onChange={setSkillsOfferedInput}
                placeholder="e.g. Python, React, Data Structures"
              />
              <SkillSelector 
                label={<>I want to learn <span style={{color:'var(--accent-orange)'}}>( comma separated )</span></>}
                value={skillsWantedInput}
                onChange={setSkillsWantedInput}
                placeholder="e.g. Machine Learning, Figma, DevOps"
              />
              <button type="submit" className="btn fw-bold px-4" style={{background:'var(--accent-orange)', color:'#000'}}>
                Save Profile
              </button>
            </form>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="rounded-3 p-4 h-100" style={{background: 'var(--bg-card)', border: '1px solid var(--border-subtle)'}}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="fs-5 fw-bold text-white d-flex align-items-center gap-2 mb-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{width: '20px', height: '20px', color: 'var(--accent-orange)'}}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI Top Picks
              </h3>
              {matches.length > 0 && (
                <button 
                  onClick={handleBulkAnalyze} 
                  disabled={bulkLoading}
                  className="btn btn-sm p-0 border-0 text-orange fw-bold"
                  style={{ color: 'var(--accent-orange)', fontSize: '0.7rem', textDecoration: 'underline' }}
                >
                  {bulkLoading ? 'Analyzing...' : 'Refresh Picks'}
                </button>
              )}
            </div>
            
            <div className="d-flex flex-column gap-3">
              {matches.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted mb-0">No matches found yet.</p>
                  <p className="text-muted small">Update your skills to see potential partners!</p>
                </div>
              ) : matches.slice(0, 3).map((match, i) => (
                <div 
                  key={i} 
                  onClick={() => navigate('/matches', { state: { scrollTo: match.id } })}
                  className="p-2 px-3 rounded-3 mb-2" 
                  style={{background: 'rgba(255,255,255,0.02)', border: '1px solid #2a2a30', cursor: 'pointer'}}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <span className="fw-bold text-white d-block" style={{fontSize: '0.85rem'}}>{match.name}</span>
                      <small className="text-white opacity-50" style={{fontSize: '0.7rem', display: 'block', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                        {match.matchReason.split('\n')[0].replace('🚀 SYNERGY: ', '').replace('🔥 Why this is cool: ', '')}
                      </small>
                    </div>
                    <div className="text-end">
                      <div className={`badge rounded-pill ${match.matchScore >= 80 ? 'bg-success' : 'bg-warning'} bg-opacity-10 text-${match.matchScore >= 80 ? 'success' : 'warning'} border-0 mb-1`} style={{fontSize: '0.6rem'}}>{match.matchScore}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;