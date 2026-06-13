import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, Ticket, LogOut, Music, Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsMenuOpen(false);
    navigate('/');
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="navbar glass">
      <div className="navbar-container">
        <Link to="/" className="nav-logo" onClick={() => setIsMenuOpen(false)}>
          <div className="logo-icon">
            <Music size={18} fill="white" color="white" />
          </div>
          <span className="logo-text">ingo</span>
        </Link>

        <div className="nav-search-container glass">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search for concerts, standups..." className="nav-search" />
        </div>

        <div className="nav-links desktop-only">
          <Link to="/" className="nav-link">Shows</Link>
          <Link to="/my-tickets" className="nav-link">
            <Ticket size={20} />
            <span>My Tickets</span>
          </Link>
          
          {user ? (
            <div className="user-profile">
              <img src={user.picture} alt={user.name} className="user-avatar" />
              <button onClick={handleLogout} className="logout-btn">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link to="/auth" className="btn-primary">Sign In</Link>
          )}
        </div>

        <button className="mobile-menu-toggle" onClick={toggleMenu}>
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''} glass`}>
        <div className="mobile-menu-links">
          <Link to="/" className="mobile-nav-link" onClick={toggleMenu}>Shows</Link>
          <Link to="/my-tickets" className="mobile-nav-link" onClick={toggleMenu}>
            <Ticket size={20} />
            <span>My Tickets</span>
          </Link>
          <hr className="mobile-divider" />
          {user ? (
            <>
              <div className="mobile-user-info">
                <img src={user.picture} alt={user.name} className="user-avatar" />
                <span>{user.name}</span>
              </div>
              <button onClick={handleLogout} className="mobile-logout-btn">
                <LogOut size={18} /> Sign Out
              </button>
            </>
          ) : (
            <Link to="/auth" className="btn-primary w-100" onClick={toggleMenu}>Sign In</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
