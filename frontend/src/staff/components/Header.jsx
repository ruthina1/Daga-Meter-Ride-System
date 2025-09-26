import { useState } from 'react';
import avater from '../images/avater.jpg';
import { FaBell, FaSearch, FaBars, FaCog, FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import '../styles/header.css';

export default function Header({ onMenuClick, notifications = 3 }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleProfileClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = () => {
    // Handle logout logic here
    console.log('Logging out...');
    setShowDropdown(false);
  };

  const handleSettings = () => {
    // Handle settings navigation here
    console.log('Opening settings...');
    setShowDropdown(false);
  };

  return (
    <div className="header">
      <div className="header-left">
        <button className="menu-button" onClick={onMenuClick}>
          <FaBars className="menu-icon" />
        </button>
        <div className="header-title">
          <h1>Staff Dashboard</h1>
          <span className="welcome-text">Welcome back, Abebe!</span>
        </div>
      </div>

      

      <div className="header-right">
        <div className="header-actions">
          <button className="action-btn notification-btn">
            <FaBell className="action-icon" />
            {notifications > 0 && (
              <span className="notification-badge">{notifications}</span>
            )}
          </button>

          <div className="profile-section">
            <div className="profile-info">
              <span className="profile-name">Abebe Alemu</span>
              <span className="profile-role">Staff</span>
            </div>
            <div className="avatar-container" onClick={handleProfileClick}>
              <img src={avater} alt="profile" className="profile-avatar" />
              <div className="online-status"></div>
            </div>

            {showDropdown && (
              <div className="profile-dropdown">
                <div className="dropdown-item">
                  <FaUserCircle className="dropdown-icon" />
                  <span>My Profile</span>
                </div>
                <div className="dropdown-item" onClick={handleSettings}>
                  <FaCog className="dropdown-icon" />
                  <span>Settings</span>
                </div>
                <div className="dropdown-divider"></div>
                <div className="dropdown-item" onClick={handleLogout}>
                  <FaSignOutAlt className="dropdown-icon" />
                  <span>Logout</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}