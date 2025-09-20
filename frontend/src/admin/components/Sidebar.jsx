import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaChevronDown } from 'react-icons/fa';
import '../styles/Sidebar.css';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDriverMenuOpen, setIsDriverMenuOpen] = useState(false);

  const mainMenuItems = [
    { id: 'overview', label: 'Overview', path: '/dashboard' },
    { id: 'users', label: 'User management', path: '/admin/users' }
  ];

  const driverSubMenuItems = [
    { id: 'drivers', label: 'Driver Management', path: '/admin/drivers' },
    { id: 'staff', label: 'Staff Management', path: '/admin/staff' },
    { id: 'trips', label: 'Trip Management', path: '/admin/trips' }
  ];

  const bottomMenuItems = [
    { id: 'cars', label: 'Car management', path: '/admin/cars' }
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const toggleDriverMenu = () => {
    setIsDriverMenuOpen(!isDriverMenuOpen);
  };

  const isDriverMenuActive = driverSubMenuItems.some(item => isActive(item.path));

  return (
    <div className="sidebar">
      <div className="logo">Admin Panel</div>
      
      {/* Main Navigation Items */}
      <ul className="nav-menu">
        {mainMenuItems.map(item => (
          <li
            key={item.id}
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            onClick={() => handleNavigation(item.path)}
          >
            {item.label}
          </li>
        ))}
        
        {/* Driver Management with Dropdown */}
        <li className={`dropdown-item ${isDriverMenuOpen ? 'open' : ''}`}>
          <div 
            className={`dropdown-header ${isDriverMenuActive ? 'active' : ''}`}
            onClick={toggleDriverMenu}
          >
            <span>Driver Management</span>
            <FaChevronDown className="dropdown-arrow" />
          </div>
          <ul className="submenu">
            {driverSubMenuItems.map(subItem => (
              <li
                key={subItem.id}
                className={`submenu-item ${isActive(subItem.path) ? 'active' : ''}`}
                onClick={() => handleNavigation(subItem.path)}
              >
                {subItem.label}
              </li>
            ))}
          </ul>
        </li>
      </ul>

      {/* Bottom Navigation Items */}
      <ul className="nav-menu bottom-menu">
        {bottomMenuItems.map(item => (
          <li
            key={item.id}
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            onClick={() => handleNavigation(item.path)}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}