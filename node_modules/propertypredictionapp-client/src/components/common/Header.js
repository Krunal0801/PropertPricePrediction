import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import NotificationDropdown from './NotificationDropdown';
import './Header.css';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { unreadCount } = useNotification();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };
  
  return (
    <header className="header">
      <div className="container header-container">
        <div className="header-left">
          <Link to="/" className="logo">
            PropertyPredictor
          </Link>
          
          <nav className={`main-nav ${isMenuOpen ? 'active' : ''}`}>
            <ul className="nav-list">
              <li className="nav-item">
                <Link to="/" className="nav-link">Home</Link>
              </li>
              <li className="nav-item">
                <Link to="/search" className="nav-link">Search</Link>
              </li>
              <li className="nav-item">
                <Link to="/prediction" className="nav-link">Price Prediction</Link>
              </li>
              {isAuthenticated && (
                <>
                  <li className="nav-item">
                    <Link to="/bookmarks" className="nav-link">Bookmarks</Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
        
        <div className="header-right">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              <i className="fas fa-search"></i>
            </button>
          </form>
          
          {isAuthenticated ? (
            <div className="user-menu">
              <NotificationDropdown count={unreadCount} />
              
              <div className="profile-dropdown">
                <button className="profile-button" onClick={toggleMenu}>
                  {user?.profilePicture ? (
                    <img
                      src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/${user.profilePicture}`}
                      alt={user.fullName}
                      className="profile-pic"
                    />
                  ) : (
                    <div className="profile-initials">
                      {user?.fullName?.charAt(0) || 'U'}
                    </div>
                  )}
                </button>
                
                {isMenuOpen && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <span>{user?.fullName}</span>
                      <span className="dropdown-email">{user?.email}</span>
                    </div>
                    <Link to="/profile" className="dropdown-item">Profile</Link>
                    <Link to="/bookmarks" className="dropdown-item">Bookmarks</Link>
                    <button onClick={logout} className="dropdown-item logout-button">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-secondary">Login</Link>
              <Link to="/register" className="btn-primary">Register</Link>
            </div>
          )}
          
          <button className="mobile-menu-button" onClick={toggleMenu}>
            <span className="menu-icon"></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
