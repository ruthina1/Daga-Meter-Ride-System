import React from 'react';
import { formatNumber } from '../services/utils';
import '../styles/StatCard.css';

export default function StatCard({ title, value, currency = false }) {
  return (
    // carsd at the top
    <div className="stat-card">
      <div className="stat-title">{title}</div>
      <div className="stat-value">
        {formatNumber(value)}
        {currency ? ' ETB' : ''}
      </div>
    </div>
  );
};