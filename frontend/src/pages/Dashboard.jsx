import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function Dashboard() {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [skillsOfferedInput, setSkillsOfferedInput] = useState('');
  const [skillsWantedInput, setSkillsWantedInput] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://127.0.0.1:5000/api/profile/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data);
        setSkillsOfferedInput(res.data.skillsOffered.join(', '));
        setSkillsWantedInput(res.data.skillsWanted.join(', '));
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
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

      <div className="rounded-3 p-4" style={{background: 'var(--bg-card)', border: '1px solid var(--border-subtle)'}}>
        <form onSubmit={handleUpdate}>
          <div className="mb-4">
            <label className="form-label fw-medium" style={{color: 'var(--text-muted)'}}>
              I can teach <span style={{color:'var(--accent-orange)'}}>( comma separated )</span>
            </label>
            <input
              type="text"
              className="form-control"
              style={{background:'#0d0d10', border:'1px solid var(--border-subtle)', color:'#fff'}}
              value={skillsOfferedInput}
              onChange={(e) => setSkillsOfferedInput(e.target.value)}
              placeholder="e.g. Python, React, Data Structures"
            />
          </div>
          <div className="mb-4">
            <label className="form-label fw-medium" style={{color: 'var(--text-muted)'}}>
              I want to learn <span style={{color:'var(--accent-orange)'}}>( comma separated )</span>
            </label>
            <input
              type="text"
              className="form-control"
              style={{background:'#0d0d10', border:'1px solid var(--border-subtle)', color:'#fff'}}
              value={skillsWantedInput}
              onChange={(e) => setSkillsWantedInput(e.target.value)}
              placeholder="e.g. Machine Learning, Figma, DevOps"
            />
          </div>
          <button type="submit" className="btn fw-bold px-4" style={{background:'var(--accent-orange)', color:'#000'}}>
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
}

export default Dashboard;