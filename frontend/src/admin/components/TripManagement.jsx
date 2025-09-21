// src/admin/components/TripManagement.jsx
import React, { useState, useEffect } from 'react';
import { getTrips, searchTrips, getTripsByDate, downloadTrips } from '../services/api';
import { FaSearch, FaArrowLeft, FaArrowRight, FaDownload } from 'react-icons/fa';
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
  const fetchTrips = async (page = currentPage) => {
    setLoading(true);
    try {
      const result = await getTrips(page);
      setTrips(result.trips || []);
      setTotalTrips(result.totalCount || result.trips.length || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips(currentPage);
  }, [currentPage]);

  // Search trips
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setIsSearching(false);
      fetchTrips(1);
      return;
    }

    setIsSearching(true);
    setLoading(true);
    try {
      const result = await searchTrips(searchTerm);
      setTrips(result.trips || []);
      setTotalTrips(result.trips.length || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Download trips
  const handleDownload = async () => {
    try {
      await downloadTrips(); // Backend should handle CSV or Excel download
    } catch (error) {
      console.error(error);
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

  if (loading) {
    return (
      <div className="loading-container">
        <div>Loading trip data...</div>
      </div>
    );
  }

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
        <div className="search-containeru">
          <div className="search-input-containeru">
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
                  <td>{trip.passengerName}</td>
                  <td>{trip.driverName}</td>
                  <td>{trip.initialLocation}</td>
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
