import React, { useState, useEffect } from 'react';
import { getUsers, updateUser, deleteUser, searchUsers } from '../services/api';
import { FaEdit, FaTrash, FaSave, FaTimes, FaSearch, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import Sidebar from './Sidebar'; // Import Sidebar
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

  const usersPerPage = 6;

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    setLoading(true);
    const token = localStorage.getItem('authToken');
    const result = await getUsers(token, currentPage, usersPerPage);
    
    if (result.success) {
      setUsers(result.data.users);
      setTotalUsers(result.data.totalCount);
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setIsSearching(false);
      fetchUsers();
      return;
    }

    setIsSearching(true);
    setLoading(true);
    const token = localStorage.getItem('authToken');
    const result = await searchUsers(token, searchTerm);
    
    if (result.success) {
      setUsers(result.data);
    }
    setLoading(false);
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setEditData({
      fullName: user.fullName,
      phoneNumber: user.phoneNumber
    });
  };

  const handleSave = async (userId) => {
    const token = localStorage.getItem('authToken');
    const result = await updateUser(token, userId, editData);
    
    if (result.success) {
      setUsers(users.map(user => 
        user.id === userId ? { ...user, ...editData } : user
      ));
      setEditingId(null);
      setEditData({});
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleDelete = async (userId, phoneNumber) => {
    const token = localStorage.getItem('authToken');
    const result = await deleteUser(token, userId, phoneNumber);
    
    if (result.success) {
      setUsers(users.filter(user => user.id !== userId));
      setTotalUsers(prev => prev - 1);
      setDeleteConfirm(null);
    }
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setIsSearching(false);
    fetchUsers();
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
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-title">Total Users</div>
            <div className="stat-value">{totalUsers}</div>
          </div>
        </div>

        <div className="search-container">
          <div className="search-input-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by name or phone number"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="search-input"
            />
            {searchTerm && (
              <button onClick={handleClearSearch} className="clear-input-button">
                ×
              </button>
            )}
          </div>
          <button onClick={handleSearch} className="search-button">
            <FaSearch /> Search
          </button>
        </div>

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
                    ) : (
                      user.fullName
                    )}
                  </td>
                  <td>
                    {editingId === user.id ? (
                      <input
                        type="text"
                        value={editData.phoneNumber || ''}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                        className="edit-input"
                      />
                    ) : (
                      user.phoneNumber
                    )}
                  </td>
                  <td>{new Date(user.registrationDate).toLocaleDateString()}</td>
                  <td>{user.totalPayment.toLocaleString()} ETB</td>
                  <td>
                    {editingId === user.id ? (
                      <div className="action-buttons">
                        <button
                          onClick={() => handleSave(user.id)}
                          className="action-button save-button"
                          title="Save"
                        >
                          <FaSave />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="action-button cancel-button"
                          title="Cancel"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ) : (
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEdit(user)}
                          className="action-button edit-button"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(user.id)}
                          className="action-button delete-button"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
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
            <span className="page-info">
              Page {currentPage} of {totalPages}
            </span>
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

        {deleteConfirm && (
          <div className="delete-modal">
            <div className="delete-modal-content">
              <h3>Confirm Delete</h3>
              <p>Are you sure you want to delete this user permanently?</p>
              <div className="delete-modal-actions">
                <button
                  onClick={() => handleDelete(deleteConfirm, users.find(u => u.id === deleteConfirm)?.phoneNumber)}
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