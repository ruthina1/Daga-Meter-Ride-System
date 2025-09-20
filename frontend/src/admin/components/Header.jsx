// src/admin/components/Header.jsx
import React from 'react';
import '../styles/Header.css';

export default function Header({ user, onLogout }) {
  return (
    <div className="header">
      <h1>Admin Dashboard</h1>
      <div className="user-info">
        <div className="user-avatar">{(user?.username || "A").charAt(0).toUpperCase()}</div>
          <span>{user?.username || "Admin"}</span>
          <button onClick={onLogout} className="logout-button">Logout</button>
        </div>

    </div>
  );
};