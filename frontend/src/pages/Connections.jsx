import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function Connections() {
  const { user } = useContext(AuthContext);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchConnections = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://127.0.0.1:5000/api/match/connections', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConnections(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => { fetchConnections(); }, []);

  const handleResponse = async (matchId, action) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://127.0.0.1:5000/api/match/respond',
        { match_id: matchId, action: action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchConnections();
    } catch (err) {
      console.error(err);
      alert('Failed to respond to request');
    }
  };

  const pendingRequests = user ? connections.filter(c => c.status === 'pending' && c.sender_id !== user.id) : [];
  const sentRequests = user ? connections.filter(c => c.status === 'pending' && c.sender_id === user.id) : [];
  const acceptedMatches = connections.filter(c => c.status === 'accepted');

  if (loading) return (
    <div className="d-flex justify-content-center py-5">
      <div className="spinner-border text-warning" role="status" />
    </div>
  );

  return (
    <div className="fade-in">
      <div className="mb-5">
        <h1 className="fw-bold mb-1" style={{ color: 'var(--accent-orange)' }}>Match Requests</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your incoming and outgoing match requests.</p>

        <div className="row g-4 mt-2">
          {/* Incoming Requests */}
          <div className="col-lg-6">
            <div className="card h-100" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
              <div className="card-header border-0 bg-transparent pt-4 px-4">
                <h5 className="fw-bold mb-0 text-white">Incoming</h5>
              </div>
              <div className="card-body p-4">
                {pendingRequests.length === 0 ? (
                  <p className="text-muted small">No pending incoming requests.</p>
                ) : pendingRequests.map(req => (
                  <div key={req.match_id} className="p-3 rounded-3 mb-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="fw-bold mb-1 text-white">{req.peer.name}</h6>
                        <p className="mb-0 small text-muted">{req.peer.email}</p>
                      </div>
                      <div className="d-flex gap-2">
                        <button onClick={() => handleResponse(req.match_id, 'accepted')} className="btn btn-sm btn-success px-3">Accept</button>
                        <button onClick={() => handleResponse(req.match_id, 'rejected')} className="btn btn-sm btn-outline-secondary">Decline</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sent Requests */}
          <div className="col-lg-6">
            <div className="card h-100" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
              <div className="card-header border-0 bg-transparent pt-4 px-4">
                <h5 className="fw-bold mb-0 text-white">Sent</h5>
              </div>
              <div className="card-body p-4">
                {sentRequests.length === 0 ? (
                  <p className="text-muted small">No pending outgoing requests.</p>
                ) : sentRequests.map(req => (
                  <div key={req.match_id} className="p-3 rounded-3 mb-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="fw-bold mb-1 text-white">{req.peer.name}</h6>
                        <p className="mb-0 small text-muted">Waiting for response...</p>
                      </div>
                      <span className="badge bg-warning bg-opacity-10 text-warning px-3">Pending</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="fw-bold mb-1" style={{ color: 'var(--accent-orange)' }}>Connection History</h2>
        <p style={{ color: 'var(--text-muted)' }}>Your successful matches and ongoing collaborations.</p>

        <div className="row g-4 mt-2">
          {acceptedMatches.length === 0 ? (
            <div className="col-12 text-center py-5 rounded-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border-subtle)' }}>
              <p className="text-muted mb-0">No established connections yet. Start matching!</p>
            </div>
          ) : acceptedMatches.map(match => (
            <div key={match.match_id} className="col-md-6 col-xl-4">
              <div className="card h-100" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '48px', height: '48px', background: 'var(--accent-orange)', color: '#000', fontSize: '1.2rem' }}>
                      {match.peer.name[0]}
                    </div>
                    <div>
                      <h6 className="fw-bold mb-0 text-white">{match.peer.name}</h6>
                      <p className="mb-0 small text-muted">
                        {match.isBlockedByMe ? <span className="text-danger">Blocked</span> : 
                         match.hasBlockedMe ? <span className="text-warning">Unavailable</span> : 
                         match.peer.role}
                      </p>
                    </div>
                  </div>
                  <p className="small text-muted mb-4" style={{ display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {match.peer.bio || "No bio available."}
                  </p>
                  <div className="d-grid">
                    {match.isBlockedByMe || match.hasBlockedMe ? (
                      <button className="btn fw-bold disabled" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', border: '1px solid var(--border-subtle)' }}>
                        Chat Disabled
                      </button>
                    ) : (
                      <Link to="/chat" state={{ peer: match.peer }} className="btn fw-bold" style={{ background: 'rgba(255,171,0,0.1)', color: 'var(--accent-orange)', border: '1px solid rgba(255,171,0,0.3)' }}>
                        Open Chat
                      </Link>
                    )}
                  </div>
                </div>
                <div className="card-footer border-0 py-2 px-4" style={{ background: 'rgba(255,255,255,0.02)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                  Matched on {new Date(match.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Connections;
