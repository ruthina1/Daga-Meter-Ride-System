import { useState } from 'react';
import { FaKey, FaEnvelope, FaExclamationTriangle, FaTrash, FaChevronRight, FaBell, FaLanguage, FaMoon } from "react-icons/fa";
import { FaShieldAlt } from 'react-icons/fa';
import '../styles/Setting.css';

export default function Setting() {
  const [activeSetting, setActiveSetting] = useState(null);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("english");

  const settings = [
    { id: 'password', icon: <FaKey />, title: 'Change Password', description: 'Update your account password' },
    { id: 'privacy', icon: <FaShieldAlt />, title: 'Privacy Policy', description: 'Review our privacy practices' },
    { id: 'contact', icon: <FaEnvelope />, title: 'Contact Us', description: 'Get in touch with our support team' },
    { id: 'complain', icon: <FaExclamationTriangle />, title: 'Submit a Complaint', description: 'Report issues or concerns' },
    { id: 'delete', icon: <FaTrash />, title: 'Delete Account', description: 'Permanently remove your account', warning: true },
    { id: 'appearance', icon: <FaMoon />, title: 'Appearance', description: 'Customize look and feel' },
  ];

  const handleSettingClick = (settingId) => {
    setActiveSetting(settingId);
    // Here you would typically navigate to the specific setting page or open a modal
    console.log(`Opening setting: ${settingId}`);
  };

  return (
    <div className="setting-container">
      <div className="setting-header">
        <h1>Settings</h1>
        <p>Manage your account preferences and settings</p>
      </div>

      <div className="settings-grid">
        {settings.map((setting) => (
          <div 
            key={setting.id} 
            className={`setting-card ${activeSetting === setting.id ? 'active' : ''} ${setting.warning ? 'warning' : ''}`}
            onClick={() => handleSettingClick(setting.id)}
          >
            <div className="setting-icon">
              {setting.icon}
            </div>
            <div className="setting-info">
              <h3>{setting.title}</h3>
              <p>{setting.description}</p>
            </div>
            <div className="setting-arrow">
              <FaChevronRight />
            </div>
          </div>
        ))}
      </div>

      {/* Example of a expanded setting (would conditionally render based on activeSetting) */}
      {activeSetting === 'notifications' && (
        <div className="setting-detail">
          <div className="detail-header">
            <button className="back-button" onClick={() => setActiveSetting(null)}>
              <FaChevronRight className="back-icon" />
              Back to Settings
            </button>
            <h2>Notification Preferences</h2>
          </div>
          
          <div className="detail-content">
            <div className="preference-item">
              <div className="preference-info">
                <h4>Push Notifications</h4>
                <p>Receive alerts about new rides and updates</p>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={notifications}
                  onChange={() => setNotifications(!notifications)}
                />
                <span className="slider"></span>
              </label>
            </div>
            
            <div className="preference-item">
              <div className="preference-info">
                <h4>Email Notifications</h4>
                <p>Get weekly reports and important updates via email</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>
            
            <div className="preference-item">
              <div className="preference-info">
                <h4>Sound Effects</h4>
                <p>Play sounds for notifications</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}