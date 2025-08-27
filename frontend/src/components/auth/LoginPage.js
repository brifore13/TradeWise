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
    <div className="center-layout">
      <div className="card card-lg" style={{ width: '100%', maxWidth: '480px' }}>
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-brand mb-2">TradeWise</h1>
          {!isLogin && <p className="text-base text-secondary">Create your account</p>}
          {isLogin && <p className="text-base text-secondary">Welcome back to your portfolio</p>}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 text-center">
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}

        {/* Login Form */}
        {isLogin ? (
          <>
            <form onSubmit={handleLogin} className="space-y-6 mb-8">
              <div className="form-group">
                <input 
                  type="email"
                  placeholder="Email address"
                  className="form-input"
                  value={credentials.email}
                  onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <input 
                  type="password"
                  placeholder="Password"
                  className="form-input"
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  required
                />
              </div>

              <div className="text-center mb-6">
                <p className="text-sm text-secondary">Smart investing starts here</p>
              </div>

              <button type="submit" className="btn btn-primary btn-full btn-lg">
                Sign In
              </button>
            </form>

            <div className="text-center mb-8">
              <p className="text-sm text-secondary">
                New to TradeWise?{" "}
                <button
                  type="button"
                  className="text-brand font-medium hover:underline bg-transparent border-none cursor-pointer"
                  onClick={() => {
                    setIsLogin(false);
                    setError('');
                  }}
                >
                  Create account
                </button>
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Register Form */}
            <form onSubmit={handleRegister} className="space-y-6 mb-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="First Name"
                    className="form-input"
                    value={registerData.firstName}
                    onChange={(e) => setRegisterData({...registerData, firstName: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <input 
                    type="text"
                    placeholder="Last Name"
                    className="form-input"
                    value={registerData.lastName}
                    onChange={(e) => setRegisterData({...registerData, lastName: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <input 
                  type="email"
                  placeholder="Email address"
                  className="form-input"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <input 
                  type="password"
                  placeholder="Password"
                  className="form-input"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <input 
                  type="password"
                  placeholder="Confirm Password"
                  className="form-input"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-full btn-lg">
                Create Account
              </button>
            </form>

            <div className="text-center mb-8">
              <p className="text-sm text-secondary">
                Already have an account?{" "}
                <button
                  type="button"
                  className="text-brand font-medium hover:underline bg-transparent border-none cursor-pointer"
                  onClick={() => {
                    setIsLogin(true);
                    setError('');
                  }}
                >
                  Sign in
                </button>
              </p>
            </div>
          </>
        )}

        {/* About Section */}
        <div className="text-center">
          <button 
            className="btn btn-ghost btn-sm"
            onClick={() => setShowAbout(!showAbout)}
          >
            About TradeWise
          </button>

          {showAbout && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg text-left">
              <h3 className="text-lg font-semibold text-primary mb-4">About TradeWise</h3>
              <div className="space-y-3">
                <p className="text-sm text-secondary">
                  TradeWise is a user-friendly app that makes investment in the stock market simple and straightforward.
                </p>
                <p className="text-sm text-secondary">
                  To begin, create an account and log in to access your dashboard.
                </p>
                <p className="text-sm text-secondary">
                  Every page has a help button for detailed instructions.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;