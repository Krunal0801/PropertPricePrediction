import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-heading">PropertyPredictor</h3>
            <p className="footer-description">
              Your intelligent property prediction platform, helping you make better real estate decisions.
            </p>
          </div>
          
          <div className="footer-section">
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/search">Search Properties</Link></li>
              <li><Link to="/prediction">Price Prediction</Link></li>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3 className="footer-heading">Contact Us</h3>
            <ul className="footer-contact">
              <li><i className="fas fa-map-marker-alt"></i> 123 Main Street, Mumbai, India</li>
              <li><i className="fas fa-phone"></i> +91 1234567890</li>
              <li><i className="fas fa-envelope"></i> info@propertypredictor.com</li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3 className="footer-heading">Follow Us</h3>
            <div className="social-links">
              <a href="#" className="social-link"><i className="fab fa-facebook-f"></i></a>
              <a href="#" className="social-link"><i className="fab fa-twitter"></i></a>
              <a href="#" className="social-link"><i className="fab fa-instagram"></i></a>
              <a href="#" className="social-link"><i className="fab fa-linkedin-in"></i></a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2023 PropertyPredictor. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-of-service">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;