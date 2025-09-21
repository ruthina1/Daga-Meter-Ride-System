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
  // Remove dashboardData, loading, fetchData, getDashboardData
  const [timeRange, setTimeRange] = useState('7days');

  // Handle time range change for the chart (if needed)
  const handleTimeRangeChange = (newTimeRange) => {
    setTimeRange(newTimeRange);
  };

  if (!user) {
    return (
      <div className="loading-container">
        <div>Failed to load dashboard data.</div>
      </div>
    );
  }



const dashboardData = {
  totals: {
    earning: user.TotalEarning ?? 0,
    passenger: user.TotalUsers ?? 0,
    driver: user.TotalDrivers ?? 0,
    cars: user.TotalCars ?? 0,
  },
  summary: {
    passengersSelf: (user.TotalUsers ?? 0) - (user.NonAccUsers ?? 0), // self registered
    passengersStaff: user.NonAccUsers ?? 0,                          // staff registered
    drivers: user.TotalDrivers ?? 0,
  },
  earningsData: user.earningsData || [],
};


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
             <div className="chart-title">Quick Status</div>
            <div className="chart-header">
                <div className="summary-cards">
                    <SummaryCard 
                      icon="person" 
                      value={dashboardData.summary.passengersSelf} 
                      label="Self-Registered Passengers"
                      color={{ bg: '#e3f2fd', fg: '#1565c0' }} 
                    />
                    <SummaryCard 
                      icon="person" 
                      value={dashboardData.summary.passengersStaff} 
                      label="Staff-Registered Passengers"
                      color={{ bg: '#ede7f6', fg: '#4527a0' }} 
                    />
                    <SummaryCard 
                      icon="directions_car" 
                      value={dashboardData.summary.drivers} 
                      label="Total Drivers"
                      color={{ bg: '#e8f5e9', fg: '#2e7d32' }} 
                    />
               </div>
           </div>
          </div>
        </div>
      </div>
    </div>
  );
};
