import React from 'react';
import { formatNumber } from '../services/utils';
import { FaUser, FaCar } from 'react-icons/fa';
import '../styles/SummaryCard.css';

export default function SummaryCard({ icon, value, label, color })  {
  const getIconComponent = () => {
    switch(icon) {
      case 'person':
        return <FaUser />;
      case 'directions_car':
        return <FaCar />;
      default:
        return <FaUser />;
    }
  };

  return (
    <div className="summary-card">
      <div className="icon-container" style={{ backgroundColor: color.bg, color: color.fg }}>
        {getIconComponent()}
      </div>
      <div className="summary-info">
        <div className="summary-value">{formatNumber(value)}</div>
        <div className="summary-label">{label}</div>
      </div>
    </div>
  );
};