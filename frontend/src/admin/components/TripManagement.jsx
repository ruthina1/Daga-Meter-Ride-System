// src/admin/components/TripManagement.jsx
import React, { useState, useEffect } from 'react';
import {
  getTrips,
  searchTrips,
  getTripsByDate
} from '../services/api';
import { FaSearch, FaArrowLeft, FaArrowRight, FaDownload, FaFilter} from 'react-icons/fa';
import Sidebar from './Sidebar';
import '../styles/TripManagement.css';

export default function TripManagement() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTrips, setTotalTrips] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const tripsPerPage = 6;

  // Fetch trips
   const fetchTrips = async () => {
     setLoading(true);
     try {
       const result = await getTrips(currentPage);
        if (result.success) {
          setTrips(result.data.trips || []);     // <-- expects "trips"
          setTotalTrips(result.data.totalRide || 0);
        }
        else {
         console.error(result.message);
       }
     } catch (error) {
       console.error(error);
     }
     setLoading(false);
   };

  useEffect(() => {
    fetchTrips(currentPage);
  }, [currentPage]);

  // Search trips
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setIsSearching(false);
      fetchTrips();
      return;
    }
    setLoading(true);
    const result = await searchTrips(searchTerm);
    if (result.success && result.trip) {
      
      setTrips(result.trip); // backend returns single driver
      setIsSearching(true);
      console.log(trips);
    } else {
      setTrips([]); // no driver found
      setIsSearching(true);
    }

    setLoading(false);
  };

  const filterTripsByDate = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }
  
    console.log("Filtering with dates:", { startDate, endDate }); // Debug log
  
    setLoading(true);
    try {
      const result = await getTripsByDate(startDate, endDate);
      console.log("API Response:", result); // Debug log
      
      if (result.success && result.data) {
        setTrips(result.data || []); 
        setIsSearching(true); 
        setTotalTrips(result.data.length || 0); 
        console.log("Filtered drivers:", result.data.length); // Debug log
      } else {
        setTrips([]);
        setTotalTrips(0);
        alert("No drivers found for the selected date range.");
      }
    } catch (error) {
      console.error("Filter error:", error);
      console.error("Error details:", error.response); // More detailed error info
      alert("Failed to filter drivers by date: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  // Download trips filtered by date
const handleDownload = async () => {
  if (!startDate || !endDate) {
    alert('Please select start and end date.');
    return;
  }

  try {
    const res = await getTripsByDate(startDate, endDate);
    if (!res.success || !res.data.length) {
      alert('No drivers available for the selected date range.');
      return;
    }

    const TripsData = res.data;
    const dateRangeText = `${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`;
    const generatedDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const printWindow = window.open('', '_blank');

    const htmlContent = `
      <html>
        <head>
          <title>Daga Meter Ride - Trip Report</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            
            body { 
              font-family: 'Inter', sans-serif; 
              margin: 0; 
              padding: 0;
              color: #333;
              background: #f8f9fa;
            }
            
            .report-container {
              max-width: 210mm;
              min-height: 297mm;
              margin: 0 auto;
              background: white;
              padding: 25mm;
              box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            
            .header {
              text-align: center;
              border-bottom: 3px solid #2c5aa0;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            
            .company-name {
              font-size: 32px;
              font-weight: 700;
              color: #2c5aa0;
              margin: 0;
            }
            
            .company-tagline {
              font-size: 16px;
              color: #666;
              font-weight: 300;
              margin: 5px 0 0 0;
            }
            
            .report-title {
              font-size: 24px;
              font-weight: 600;
              color: #2c5aa0;
              text-align: center;
              margin: 30px 0;
            }
            
            .report-meta {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
              margin-bottom: 30px;
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #2c5aa0;
            }
            
            .meta-item {
              display: flex;
              flex-direction: column;
            }
            
            .meta-label {
              font-size: 12px;
              font-weight: 600;
              color: #666;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .meta-value {
              font-size: 14px;
              font-weight: 500;
              color: #333;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 25px 0;
              font-size: 12px;
            }
            
            th {
              background: #2c5aa0;
              color: white;
              padding: 12px 8px;
              text-align: left;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              border: 1px solid #1e3d6d;
            }
            
            td {
              padding: 10px 8px;
              border: 1px solid #ddd;
              text-align: left;
            }
            
            tr:nth-child(even) {
              background-color: #f8f9fa;
            }
            
            .total-row {
              background: #e3f2fd !important;
              font-weight: 600;
              border-top: 2px solid #2c5aa0;
            }
            
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #ddd;
              text-align: center;
              font-size: 11px;
              color: #666;
            }
            
            .footer-content {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 10px;
            }
            
            @media print {
              body { margin: 0; }
              .report-container { 
                box-shadow: none; 
                padding: 15mm;
              }
            }
          </style>
        </head>
        <body>
          <div class="report-container">
            <!-- Header -->
            <div class="header">
              <h1 class="company-name">Daga Meter Ride</h1>
              <p class="company-tagline">Your Trusted Ride-Hailing Partner</p>
              <h2 class="report-title">Drivers Management Report</h2>
            </div>
            
            <!-- Report Metadata -->
            <div class="report-meta">
              <div class="meta-item">
                <span class="meta-label">Date Range</span>
                <span class="meta-value">${dateRangeText}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Total Trips</span>
                <span class="meta-value">${TripsData.length.toLocaleString()}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Report Generated</span>
                <span class="meta-value">${generatedDate}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Report Type</span>
                <span class="meta-value">Trip Analysis Report</span>
              </div>
            </div>
            
            <!-- Trip Table -->
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Passenger Name</th>
                  <th>Driver Name</th>
                  <th>Initial Location</th>
                  <th>Destination</th>
                  <th>Ride Date and Time</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                ${TripsData.map((trip, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${trip.user_name || 'N/A'}</td>
                    <td>${trip.driver_name || 'N/A'}</td>
                    <td>${trip.source_location || 'N/A'}</td>
                    <td>${trip.destinationLocation || 'N/A'}</td>
                    <td>${trip.created_at ? new Date(trip.created_at).toLocaleDateString() : 'N/A'}</td>
                    <td>${trip.price || 'N/A'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <!-- Footer -->
            <div class="footer">
              <div class="footer-content">
                <div>Daga Meter Ride - Trip Management System</div>
                <div>Confidential Report</div>
              </div>
              <div>© ${new Date().getFullYear()} Daga Meter Ride. All rights reserved.</div>
              <div>Generated by Admin Panel</div>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };

  } catch (error) {
    console.error('Error generating report:', error);
    alert('Failed to generate report.');
  }
};


  const handleClearSearch = () => {
    setSearchTerm('');
    setIsSearching(false);
    setCurrentPage(1);
    setStartDate('');
    setEndDate('');
    fetchTrips(1);
  };

  const totalPages = Math.ceil(totalTrips / tripsPerPage);

  if (loading) return <div className="loading-container">Loading trip data...</div>;

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="trip-management-container">
        {/* Stats */}
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-title">Total Trips</div>
            <div className="stat-value">{totalTrips}</div>
          </div>
        </div>

        {/* Search, Date Filters, Download */}
        <div className="search-container">
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="search-input"
            />
            {searchTerm && (
              <button onClick={handleClearSearch} className="clear-input-button">×</button>
            )}
          </div>
          <button onClick={handleSearch} className="search-button"><FaSearch /> Search</button>

          {/* Date filters */}
          <div className="date-filter-containeru">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="date-inputu" />
            to
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="date-inputu" />
          </div>
           <button 
              onClick={filterTripsByDate} 
              className="filter-date-button"
              disabled={!startDate || !endDate}
            >
              <FaFilter /> Filter
            </button>
          {/* Download */}
          <button onClick={handleDownload} className="download-button"><FaDownload /> Download</button>
        </div>

        {/* Trips Table */}
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Passenger Name</th>
                <th>Driver Name</th>
                <th>Initial Location</th>
                <th>Destination</th>
                <th>Ride Date & Time</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((trip) => (
                <tr key={trip.id}>
                  <td>{trip.user_name}</td>
                  <td>{trip.driver_name}</td>
                  <td>{trip.source_location}</td>
                  <td>{trip.destinationLocation}</td>
                  <td>{new Date(trip.rideDateTime).toLocaleString()}</td>
                  <td>{trip.price.toLocaleString()} ETB</td>
                </tr>
              ))}
            </tbody>
          </table>
          {trips.length === 0 && (
            <div className="no-users">
              {isSearching ? 'No trips found matching your search' : 'No trips found'}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!isSearching && totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="pagination-button"
              title="Previous page"
            >
              <FaArrowLeft /> Previous
            </button>
            <span className="page-info">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="pagination-button"
              title="Next page"
            >
              Next <FaArrowRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
