// src/admin/components/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import { getUsers, updateUser, deleteUser, searchUsers, getUsersByDate, downloadUsers } from '../services/api';
import { FaEdit, FaTrash, FaSave, FaTimes, FaSearch, FaArrowLeft, FaArrowRight, FaDownload } from 'react-icons/fa';
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
      setTotalUsers(result.totalCount || result.users.length || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  // Search users
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setIsSearching(false);
      fetchUsers(1);
      return;
    }

    setIsSearching(true);
    setLoading(true);
    try {
      const result = await searchUsers(searchTerm);
      setUsers(result.users || []);
      setTotalUsers(result.users.length || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  // Download users
  const handleDownload = async () => {
    try {
      await downloadUsers(); // Backend should handle CSV or Excel download
    } catch (error) {
      console.error(error);
    }
  };

  // Edit user
  const handleEdit = (user) => {
    setEditingId(user.id);
    setEditData({
      fullName: user.fullName,
      phoneNumber: user.phoneNumber
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

          <div className="date-filter-containeru">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="date-inputu" /><label>to</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="date-inputu" />
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
                <tr key={user.id}>
                  <td>
                    {editingId === user.id ? (
                      <input
                        type="text"
                        value={editData.fullName || ''}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className="edit-input"
                      />
                    ) : user.fullName}
                  </td>
                  <td>
                    {editingId === user.id ? (
                      <input
                        type="text"
                        value={editData.phoneNumber || ''}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                        className="edit-input"
                      />
                    ) : user.phoneNumber}
                  </td>
                  <td>{new Date(user.registrationDate).toLocaleDateString()}</td>
                  <td>{user.totalPayment.toLocaleString()} ETB</td>
                  <td>
                    {editingId === user.id ? (
                      <div className="action-buttons">
                        <button onClick={() => handleSave(user.id)} className="action-button save-button" title="Save"><FaSave /></button>
                        <button onClick={handleCancelEdit} className="action-button cancel-button" title="Cancel"><FaTimes /></button>
                      </div>
                    ) : (
                      <div className="action-buttons">
                        <button onClick={() => handleEdit(user)} className="action-button edit-button" title="Edit"><FaEdit /></button>
                        <button onClick={() => setDeleteConfirm(user.id)} className="action-button delete-button" title="Delete"><FaTrash /></button>
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
