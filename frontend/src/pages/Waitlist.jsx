import React, { useState } from 'react';
import axios from 'axios';

function Waitlist() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await axios.post('http://127.0.0.1:5000/api/waitlist/add', {
        email: email
      });
      
      setStatus({ type: 'success', message: response.data.message });
      setEmail('');
    } catch (error) {
      console.error("Waitlist Error: ", error);
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.error || 'Server error. Is the Flask backend running?' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="hero" style={{marginBottom: '2rem'}}>
        <h1 className="title">Join the Waitlist</h1>
        <p className="subtitle">
          StackMate is rolling out to supported universities soon. Reserve your spot now!
        </p>
      </div>

      <div className="form-box">
        <form onSubmit={handleSubmit}>
          
          <div className="input-block">
            <label htmlFor="email">College Email Address</label>
            <input 
              id="email"
              type="email" 
              placeholder="student@college.edu" 
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" style={{width: '100%', margin: 0}} disabled={loading}>
            {loading ? 'Joining Base...' : 'Reserve my Spot'}
          </button>

          {status.message && (
            <div className={`message ${status.type}`}>
              {status.message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default Waitlist;
