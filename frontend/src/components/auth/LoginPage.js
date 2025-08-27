import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../../services/api";

const LoginPage = () => {
  const navigate = useNavigate();
  const [showAbout, setShowAbout] = useState(false);
  const [credentials, setCredentials] = useState({email: '', password: ''});
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // login user
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // get user data from api/backend
    try {
      const data = await loginUser({
          email: credentials.email,
          password: credentials.password
        });

        localStorage.setItem('token', data.token);
        navigate('/dashboard')

    } catch (error) {
      setError(error.message || 'Login failed');
    }
  };

  // register new user
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // if password doesnt match confirm pw
    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const data = await registerUser(registerData);
        localStorage.setItem('token', data.token);
        navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
  }

    return (
        <div className="login-container">
          <div className="login-box">
            <h1 className="login-title">TradeWise</h1>
            {/* Display Error */}
            {error && <div className="error-message">{error}</div>}

            {/* Login */}
            {isLogin ? (
              <>
              <form onSubmit={handleLogin}>
                <input 
                  type="email"
                  placeholder="email"
                  className="input-field"
                  value={credentials.email}
                  onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                  required
                />
                <input 
                  type="password"
                  placeholder="password"
                  className="input-field"
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  required
                />
                <div className="tagline">smart investing starts here</div>
                <button
                  type="submit" 
                  className="login-button">login
                </button>
              </form>
                <div className="new-user">
                  new user?
                  <span 
                    className="create-link"
                    onClick={() => {
                      setIsLogin(false);
                      setError('');
                    }}
                  > create account</span> 
                </div>
              </>
            ) : (
              <>
              {/* Register User Form */}
              <form onSubmit={handleRegister}>
                <input
                  type="text"
                  placeholder="First Name"
                  className="input-field"
                  value={registerData.firstName}
                  onChange={(e) => setRegisterData({...registerData, firstName: e.target.value})}
                  required
                />
                <input 
                  type="text"
                  placeholder="Last Name"
                  className="input-field"
                  value={registerData.lastName}
                  onChange={(e) => setRegisterData({...registerData, lastName: e.target.value})}
                  required
                />
                <input 
                  type="email"
                  placeholder="Email"
                  className="input-field"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                  required
                />
                <input 
                  type="password"
                  placeholder="Password"
                  className="input-field"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                  required
                />
                <input 
                  type="password"
                  placeholder="Confirm Password"
                  className="input-field"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                />
                <button
                  type="submit"
                  className="login-button"
                >
                  register
                </button>
              </form>
              {/* back to login */}
              <div className="new-user">
                already have an account?
                <span
                  className="create-link"
                  onClick={() => {
                    setIsLogin(true);
                    setError('');
                  }}
                > login</span>
              </div>
              </>
            )}

            {/* About helper button */}
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