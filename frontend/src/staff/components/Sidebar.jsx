import { useEffect } from 'react';
import avater from '../images/avater.jpg';
import { FaHistory, FaCog, FaSignOutAlt, FaArrowLeft, FaHome, FaTimes } from "react-icons/fa";
import '../styles/Sidebar.css';

export default function Sidebar({ setActiveComponent, onVisibilityChange, isVisible, activeComponent }) {
  useEffect(() => {
    if (onVisibilityChange) {
      onVisibilityChange(isVisible);
    }
  }, [isVisible, onVisibilityChange]);

  const handleBackClick = () => {
    if (onVisibilityChange) {
      onVisibilityChange(false);
    }
  };

  const handleItemClick = (component) => {
    console.log("Sidebar item clicked:", component);
    if (setActiveComponent) {
      setActiveComponent(component);
    }
    if (onVisibilityChange) {
      onVisibilityChange(false);
    }
  };

  const handleLogout = () => {
    if (setActiveComponent) {
      setActiveComponent("signin");   
    }
    if (onVisibilityChange) {
      onVisibilityChange(false);
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isVisible && <div className="sidebar-overlay" onClick={handleBackClick}></div>}
      
      <div className={`side-bar ${isVisible ? 'visible' : ''}`}>
        <div className="sidebar-header">
          <div className="back-button" onClick={handleBackClick}>
            <FaArrowLeft className="back-icon" />
            <p>Back</p>
          </div>

          <div className='profile'>
            <div className="avatar-container">
              <img src={avater} alt="profile" />
              <div className="status-indicator"></div>
            </div>
            <h2>Abebe Alemu</h2>
            <p>Staff Account</p>
          </div>
        </div>

        <div className="sidebar-content">
          <div className="navigation-items">
            <div 
              className={`side-item ${activeComponent === "main" ? "active" : ""}`} 
              onClick={() => handleItemClick("main")}
            >
              <div className="side-item-content">
                <FaHome className="side-icon" />
                <p>Dashboard</p>
              </div>
              <div className="active-indicator"></div>
            </div>

            <div 
              className={`side-item ${activeComponent === "history" ? "active" : ""}`} 
              onClick={() => handleItemClick("history")}
            >
              <div className="side-item-content">
                <FaHistory className="side-icon" />
                <p>Ride History</p>
              </div>
              <div className="active-indicator"></div>
            </div>

            <div 
              className={`side-item ${activeComponent === "setting" ? "active" : ""}`} 
              onClick={() => handleItemClick("setting")}
            >
              <div className="side-item-content">
                <FaCog className="side-icon" />
                <p>Settings</p>
              </div>
              <div className="active-indicator"></div>
            </div>
          </div>

          <div className="sidebar-footer">
            <div className="side-item logout-item" onClick={handleLogout}>
              <div className="side-item-content">
                <FaSignOutAlt className="side-icon" />
                <p>Logout</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}