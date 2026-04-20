import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function RegisterCollege() {
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await axios.post('http://127.0.0.1:5000/api/college/register', { name, domain });
      setSuccess('College request submitted! An admin will review it shortly.');
      setName('');
      setDomain('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register college');
    }
  };

  return (
    <div className="page-container" style={{justifyContent: 'center', paddingTop: '2rem'}}>
      <div className="form-box" style={{margin: '0 auto', maxWidth: '500px'}}>
        <h2 style={{fontSize: '2rem', marginBottom: '0.5rem', fontFamily: 'Archivo Black'}}>Register College</h2>
        <p className="subtitle" style={{marginBottom: '2rem', fontSize: '0.95rem'}}>
          Can't find your college? Request to add it to StackMate.
        </p>

        <form onSubmit={handleRegister}>
          <div className="input-block">
            <label>College Name</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. National Institute of Technology" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>
          <div className="input-block">
            <label>College Email Domain</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. nit.edu" 
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn-primary" style={{width: '100%', marginTop: '1rem'}}>
            Submit Request
          </button>

          {success && <div className="message success" style={{marginTop: '1rem', color: 'green', backgroundColor: '#e6ffe6', padding: '1rem', borderRadius: '8px'}}>{success}</div>}
          {error && <div className="message error" style={{marginTop: '1rem'}}>{error}</div>}
        </form>
        <p style={{marginTop: '1.5rem', textAlign: 'center'}}>
          <Link to="/signup" className="text-orange" style={{textDecoration: 'none'}}>Back to Signup</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterCollege;
