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
          axios.get('http://127.0.0.1:5000/api/match', { headers: { Authorization: `Bearer ${token}` } })
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
      const matchesRes = await axios.get('http://127.0.0.1:5000/api/match', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMatches(matchesRes.data);
      
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to update skills.');
      setMessageType('danger');
    }
  };

  if (!profile) return (
    <div className="d-flex justify-content-center align-items-center" style={{minHeight: '200px'}}>
      <div className="spinner-border text-warning" role="status"/>
    </div>
  );

  return (
    <div className="fade-in">
      {!profile.college_id && (
        <div className="alert alert-warning border-0 mb-4" style={{background: 'rgba(255,193,7,0.1)', color: '#ffca2c'}}>
          <h5 className="alert-heading fw-bold fs-6">College Not Verified</h5>
          <p className="mb-0 small">Your account is not associated with a registered college. You won't be able to see matches until your college is added and approved by an administrator.</p>
        </div>
      )}

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
            <h3 className="fs-5 fw-bold mb-4 text-white d-flex align-items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{width: '20px', height: '20px', color: 'var(--accent-orange)'}}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent Matches
            </h3>
            
            <div className="d-flex flex-column gap-3">
              {matches.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted mb-0">No matches found yet.</p>
                  <p className="text-muted small">Update your skills to see potential partners!</p>
                </div>
              ) : matches.slice(0, 5).map((match, i) => (
                <div key={i} className="p-3 rounded-3" style={{background: 'rgba(255,255,255,0.02)', border: '1px solid #2a2a30'}}>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="fw-bold text-white" style={{fontSize: '0.9rem'}}>{match.name}</span>
                    <span className="badge rounded-pill bg-success bg-opacity-10 text-success border-0" style={{fontSize: '0.65rem'}}>Match</span>
                  </div>
                  <p className="mb-2 text-secondary text-truncate" style={{fontSize: '0.8rem'}}>{match.bio || "No bio provided"}</p>
                  <div className="d-flex flex-wrap gap-1">
                    {match.theyCanTeach.slice(0, 2).map((skill, idx) => (
                      <span key={idx} className="badge bg-secondary bg-opacity-10 text-secondary border-0" style={{fontSize: '0.65rem'}}>{skill}</span>
                    ))}
                    {match.theyCanTeach.length > 2 && <span className="text-muted small">+{match.theyCanTeach.length - 2} more</span>}
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