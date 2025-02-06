import React, { useState } from "react";
import { useNavigate } from "react-router-dom";



const LoginPage = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({email: '', password: ''});
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();

    if (credentials.email && credentials.password) {
      localStorage.setItem('token', 'mock-jwt-token');
      navigate('/dashboard');
    } else {
      setError('Please enter both email and password');
    }
  };
    return (
        <div className="login-container">
          <div className="login-box">
            <h1 className="login-title">TradeWise</h1>
            <form onSubmit={handleLogin} className="space-y-4">
              <input 
                type="email"
                placeholder="email"
                className="input-field"
                value={credentials.email}
                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
              />
              <input 
                type="password"
                placeholder="password"
                className="input-field"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              />
              <button type="submit" className="button button-primary">Login</button>
            </form>
          </div>
        </div>
      );
};
    
export default LoginPage;