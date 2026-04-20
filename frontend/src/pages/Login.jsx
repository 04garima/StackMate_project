import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/auth/login', {
        email,
        password
      });

      login(response.data.token, response.data.user);
      
      const role = response.data.user.role;
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'college') {
        navigate('/college/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to login to server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container" style={{justifyContent: 'center', paddingTop: '2rem'}}>
      <div className="form-box" style={{margin: '0 auto'}}>
        <h2 style={{fontSize: '2rem', marginBottom: '0.5rem', fontFamily: 'Archivo Black'}}>Welcome Back</h2>
        <p className="subtitle" style={{marginBottom: '2rem', fontSize: '0.95rem', textAlign: 'left'}}>Sign into your StackMate account</p>

        <form onSubmit={handleLogin}>
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
            />
          </div>

          <button type="submit" className="btn-primary" style={{width: '100%', marginTop: '1rem'}} disabled={isLoading}>
            {isLoading ? 'Authenicating...' : 'Login'}
          </button>

          {error && <div className="message error" style={{marginTop: '1rem'}}>{error}</div>}
        </form>

        <p style={{marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)'}}>
          Don't have an account? <Link to="/signup" className="text-orange" style={{textDecoration: 'none', fontWeight: 600}}>Sign up instead</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
