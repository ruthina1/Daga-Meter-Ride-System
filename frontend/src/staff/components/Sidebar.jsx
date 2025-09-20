import { useEffect } from 'react';
import avater from '../images/avater.jpg';
import { FaHistory, FaCog, FaSignOutAlt, FaArrowLeft, FaHome } from "react-icons/fa";
import '../styles/Sidebar.css';

export default function Sidebar({ setActiveComponent, onVisibilityChange, isVisible }) {
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
    <div className="side-bar" hidden={!isVisible}>
      <div className="back-button" onClick={handleBackClick}>
        <FaArrowLeft className="back-icon" />
        <p>Back</p>
      </div>

      <div className='profile'>
        <img src={avater} alt="profile" />
        <h2>Abebe Alemu</h2>
      </div>

      <div className="side">
        <div className="side-item" onClick={() => handleItemClick("main")}>
          <FaHome className="side-icon" />
          <p>Home</p>
        </div>

        <div className="side-item" onClick={() => handleItemClick("history")}>
          <FaHistory className="side-icon" />
          <p>History</p>
        </div>

        <div className="side-item" onClick={() => handleItemClick("setting")}>
          <FaCog className="side-icon" />
          <p>Setting</p>
        </div>

        <div className="side-item" onClick={handleLogout}>
          <FaSignOutAlt className="side-icon" />
          <p>Logout</p>
        </div>
      </div>
    </div>
  );
}
