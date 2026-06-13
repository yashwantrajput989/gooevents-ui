import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Music } from 'lucide-react';
import './Auth.css';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const returnUrl = location.state?.returnUrl || '/';

  const handleGoogleLogin = () => {
    // Mocking Google Login
    const mockUser = {
      name: 'Demo User',
      email: 'demo@example.com',
      picture: 'https://ui-avatars.com/api/?name=Demo+User&background=f97316&color=fff',
      token: 'mock-jwt-token'
    };
    
    localStorage.setItem('user', JSON.stringify(mockUser));
    navigate(returnUrl, { state: location.state });
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass card">
        <div className="nav-logo" style={{ justifyContent: 'center', marginBottom: '24px' }}>
          <div className="logo-icon">
            <Music size={18} fill="white" color="white" />
          </div>
          <span className="logo-text">ingo</span>
        </div>
        <h2>Welcome Back</h2>
        <p>Sign in to book your favorite shows and manage your tickets.</p>
        
        <button className="google-btn" onClick={handleGoogleLogin}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
          Sign in with Google
        </button>

        <p className="auth-footer">
          By signing in, you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default Auth;
