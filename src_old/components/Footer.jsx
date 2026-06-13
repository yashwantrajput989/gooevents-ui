import React from 'react';
import { Music } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="nav-logo">
              <div className="logo-icon">
                <Music size={14} fill="white" color="white" />
              </div>
              <span className="logo-text">ingo</span>
            </div>
            <p>Your premium destination for entertainment booking. Experience the best shows in town.</p>
          </div>
          <div className="footer-grid">
            <div className="footer-col">
              <h4>Categories</h4>
              <ul>
                <li>Movies</li>
                <li>Concerts</li>
                <li>Sports</li>
                <li>Plays</li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Support</h4>
              <ul>
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Terms of Service</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 ingo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
