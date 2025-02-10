import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [showAbout, setShowAbout] = useState(false);
  const [credentials, setCredentials] = useState({email: '', password: ''});
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
  };

    return (
        <div className="login-container">
          <div className="login-box">
            <h1 className="login-title">TradeWise</h1>
            <form onSubmit={handleSubmit}>
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
              <div className="tagline">smart investing starts here</div>
              <button onClick={() => navigate('/dashboard')}
              type="submit" 
              className="login-button">login</button>
            </form>
            <div className="new-user">
              new user?<span className="create-link"> create account</span> 
            </div>
            <button 
              className="about-button" 
              onClick={() => setShowAbout(!showAbout)}
            >
              about
            </button>

            {showAbout && (
              <div className="about-section">
                <h2 className="login-title">TradeWise</h2>
                <p>TradeWise is a user-friendly app that makes investion in the stock market simple and straight-forward.</p>
                <p>To begin, create an account.</p>
                <p>Once you log in, you will be taken to your dashboard.</p>
                <p>Every page has a help button for more detailed instructions.</p>
              </div>
            )}
            </div>
          </div>
      );
};
    
export default LoginPage;