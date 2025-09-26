// src/admin/components/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import { getUsers, updateUser, deleteUser, searchUsers, getUsersByDate, downloadUsers } from '../services/api';
import { FaEdit, FaTrash, FaSave, FaTimes, FaSearch, FaArrowLeft, FaArrowRight, FaDownload, FaFilter } from 'react-icons/fa';
import Sidebar from './Sidebar';
import '../styles/UserManagement.css';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const usersPerPage = 6;

  // Fetch users
  const fetchUsers = async (page = currentPage) => {
  setLoading(true);
  try {
    const result = await getUsers(page);
    setUsers(result.users || []);
    // Change from result.totalCount to result.totalUsers to match backend response
    setTotalUsers(result.totalUsers || result.users?.length || 0);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);


const handleSearch = async () => {
  if (!searchTerm.trim()) {
    setIsSearching(false);
    fetchUsers(1);
    return;
  }

  setLoading(true);
  try {
    const result = await searchUsers(searchTerm);
    if (result.success && result.user) {
      // Backend returns single user object, convert to array for consistency
      setUsers(Array.isArray(result.user) ? result.user : [result.user]);
      setIsSearching(true);
    } else {
      setUsers([]); // no user found
      setIsSearching(true);
    }
  } catch (error) {
    console.error(error);
    setUsers([]);
    setIsSearching(true);
  } finally {
    setLoading(false);
  }
};

  // Download users
 // Download users - updated function
const handleDownload = async () => {
  if (!startDate || !endDate) {
    alert('Please select start and end date.');
    return;
  }

  try {
    const res = await getUsersByDate(startDate, endDate);
    if (!res.success || !res.data.length) {
      alert('No drivers available for the selected date range.');
      return;
    }

    const usersData = res.data;
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
          <title>Daga Meter Ride - Users Report</title>
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
              <h2 class="report-title">Users Management Report</h2>
            </div>
            
            <!-- Report Metadata -->
            <div class="report-meta">
              <div class="meta-item">
                <span class="meta-label">Date Range</span>
                <span class="meta-value">${dateRangeText}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Total Drivers</span>
                <span class="meta-value">${usersData.length.toLocaleString()}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Report Generated</span>
                <span class="meta-value">${generatedDate}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Report Type</span>
                <span class="meta-value">Users Analysis Report</span>
              </div>
            </div>
            
            <!-- Users Table -->
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Full Name</th>
                  <th>Phone Number</th>
                  <th>Registration Date</th>
                  <th>Total Payment</th>

                </tr>
              </thead>
              <tbody>
                ${usersData.map((user, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${user.name || 'N/A'}</td>
                    <td>${user.phone || 'N/A'}</td>
                    <td>${user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</td>
                    <td>${user.totalPayment || 'N/A'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <!-- Footer -->
            <div class="footer">
              <div class="footer-content">
                <div>Daga Meter Ride - Users Management System</div>
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
  // Edit user
  const handleEdit = (user) => {
    setEditingId(user.id);
    setEditData({
      name: user.name,
      phone: user.phone
    });
  };

  const handleSave = async (userId) => {
    try {
      const result = await updateUser(userId, editData);
      if (result.success) {
        setUsers(users.map(user => user.id === userId ? { ...user, ...editData } : user));
        setEditingId(null);
        setEditData({});
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  // Delete user
  const handleDelete = async (userId) => {
    try {
      const result = await deleteUser(userId);
      if (result.success) {
        setUsers(users.filter(user => user.id !== userId));
        setTotalUsers(prev => prev - 1);
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

const handleClearSearch = () => {
  setSearchTerm('');
  setIsSearching(false);
  setCurrentPage(1);
  setStartDate('');
  setEndDate('');
  fetchUsers(1); 
};

const filterUsersByDate = async () => {
  if (!startDate || !endDate) {
    alert("Please select both start and end dates.");
    return;
  }

  setLoading(true);
  try {
    const result = await getUsersByDate(startDate, endDate);
    if (result.success && result.data) {
      setUsers(result.data || []); 
      setIsSearching(true); 
      setTotalUsers(result.data.length || 0); 
    } else {
      setUsers([]);
      setTotalUsers(0);
      alert("No users found for the selected date range.");
    }
  } catch (error) {
    console.error(error);
    alert("Failed to filter users by date.");
  } finally {
    setLoading(false);
  }
};
  const totalPages = Math.ceil(totalUsers / usersPerPage);

  if (loading) {
    return (
      <div className="loading-container">
        <div>Loading user data...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <div className="user-management-container">
        {/* Stats */}
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-title">Total Users</div>
            <div className="stat-value">{totalUsers}</div>
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

            <button onClick={handleSearch} className="search-buttonu"><FaSearch /> Search</button>
          </div>
          

          {/* Date filters */}
{/* Date filters */}
         {/* Date filters */}
          <div className="date-filter-containeru">
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              className="date-inputu" 
            />
            <label>to</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              className="date-inputu" 
            />
            <button 
              onClick={filterUsersByDate} 
              className="filter-date-button"
              disabled={!startDate || !endDate}
            >
              <FaFilter /> Filter
            </button>
          </div>
          {/* Download */}
          <button onClick={handleDownload} className="download-buttonu"><FaDownload /> Download</button>
        </div>

        {/* Users Table */}
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Phone Number</th>
                <th>Registration Date</th>
                <th>Total Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.phone}>
                  <td>
                    {editingId === user.phone ? (
                      <input
                        type="text"
                        value={editData.fullName || ''}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className="edit-input"
                      />
                    ) : user.name}
                  </td>
                  <td>
                    {editingId === user.phone ? (
                      <input
                        type="text"
                        value={editData.phoneNumber || ''}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                        className="edit-input"
                      />
                    ) : user.phone}
                  </td>
                  <td>{user.registrationDate ? new Date(user.registrationDate).toLocaleDateString() : 'N/A'}</td>

                  <td>{user.total_spent != null ? user.total_spent.toLocaleString() : '0'} ETB</td>

                  <td>
                    {editingId === user.phone ? (
                      <div className="action-buttons">
                        <button onClick={() => handleSave(user.phoneNumber)} className="action-button save-button" title="Save"><FaSave /></button>
                        <button onClick={handleCancelEdit} className="action-button cancel-button" title="Cancel"><FaTimes /></button>
                      </div>
                    ) : (
                      <div className="action-buttons">
                        <button onClick={() => handleEdit(user)} className="action-button edit-button" title="Edit"><FaEdit /></button>
                        <button onClick={() => setDeleteConfirm(user.phoneNumber)} className="action-button delete-button" title="Delete"><FaTrash /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="no-users">
              {isSearching ? 'No users found matching your search' : 'No users found'}
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

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="delete-modal">
            <div className="delete-modal-content">
              <h3>Confirm Delete</h3>
              <p>Are you sure you want to delete this user permanently?</p>
              <div className="delete-modal-actions">
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="confirm-delete-button"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="cancel-delete-button"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
