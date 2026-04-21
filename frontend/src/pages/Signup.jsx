import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/auth/signup', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password
      });

      login(response.data.token, response.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container" style={{justifyContent: 'center', paddingTop: '2rem'}}>
      <div className="form-box" style={{margin: '0 auto'}}>
        <h2 style={{fontSize: '2rem', marginBottom: '0.5rem', fontFamily: 'Archivo Black'}}>Create Account</h2>
        <p className="subtitle" style={{marginBottom: '2rem', fontSize: '0.95rem', textAlign: 'left'}}>Join the ultimate college skill exchange network.</p>

        <form onSubmit={handleSignup}>
          <div className="input-block">
            <label>Full Name</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Ravi Sharma" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>
          <div className="input-block">
            <label>College Email</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="student@college.edu" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="input-block">
            <label>Password</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              minLength="6"
            />
          </div>

          <button type="submit" className="btn-primary" style={{width: '100%', marginTop: '1rem'}} disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Sign Up Free'}
          </button>

          {error && <div className="message error" style={{marginTop: '1rem'}}>{error}</div>}
        </form>

        <p style={{marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)'}}>
          Already have an account? <Link to="/login" className="text-orange" style={{textDecoration: 'none', fontWeight: 600}}>Log in here</Link>
          <br /><br />
          Is your college not registered? <Link to="/register-college" className="text-orange" style={{textDecoration: 'none', fontWeight: 600}}>Register it here</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
