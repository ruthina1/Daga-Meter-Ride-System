// src/admin/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import StatCard from './StatCard';
import EarningsChart from './EarningsChart';
import SummaryCard from './SummaryCard';
import { getDashboardData } from '../services/api';
import '../styles/Dashboard.css';

export default function Dashboard({ user, onLogout }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7days');
  
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        const result = await getDashboardData(token, timeRange);
        if (result.success) {
          setDashboardData(result.data);
        } else {
          console.error(result.message);
        }
        setLoading(false);
      }
    };
    
    fetchData();
  }, [timeRange]);

  // Handle time range change for the chart
  const handleTimeRangeChange = async (newTimeRange) => {
    setTimeRange(newTimeRange);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div>Loading dashboard data...</div>
      </div>
    );
  }
  
  if (!dashboardData) {
    return (
      <div className="loading-container">
        <div>Failed to load dashboard data.</div>
      </div>
    );
  }
  
  // src/admin/components/Dashboard.jsx
// ... other imports and code ...

return (
  <div className="dashboard-container">
    <Sidebar />
    
    <div className="main-content">
      <Header user={user} onLogout={onLogout} />
      
      <div className="stats-container">
        <StatCard title="Total Earning" value={dashboardData.totals.earning} currency={true} />
        <StatCard title="Total Passengers" value={dashboardData.totals.passenger} />
        <StatCard title="Total Drivers" value={dashboardData.totals.driver} />
        <StatCard title="Total Cars" value={dashboardData.totals.cars} />
      </div>
      
      <div className="charts-container">
        <EarningsChart 
          data={dashboardData.earningsData} 
          timeRange={timeRange}
          onTimeRangeChange={handleTimeRangeChange}
        />
        
        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-title">Quick Stats</div>
          </div>
          <div className="summary-cards">
            <SummaryCard 
              icon="person" 
              value={dashboardData.summary.passengers} 
              label="Total Passengers"  // Changed from "Active Passengers"
              color={{ bg: '#e3f2fd', fg: '#1565c0' }} 
            />
            <SummaryCard 
              icon="directions_car" 
              value={dashboardData.summary.drivers} 
              label="Total Drivers"  // Changed from "Active Drivers"
              color={{ bg: '#e8f5e9', fg: '#2e7d32' }} 
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);
};