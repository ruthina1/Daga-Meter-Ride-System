// src/admin/components/StaffManagement.jsx
import React, { useState, useEffect } from 'react';
import {
  getStaff,
  updateStaff,
  deleteStaff,
  searchStaff,
  registerStaff,
  getStaffByDate
} from '../services/api';
import {
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaSearch,
  FaArrowLeft,
  FaArrowRight,
  FaPlus,
  FaDownload,
  FaEye
} from 'react-icons/fa';
import Sidebar from './Sidebar';
import '../styles/StaffManagement.css';

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalStaff, setTotalStaff] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [idPreview, setIdPreview] = useState(null);

  const staffPerPage = 6;

  useEffect(() => {
    fetchStaff();
  }, [currentPage]);

  const fetchStaff = async () => {
    setLoading(true);
    const result = await getStaff(currentPage, staffPerPage);
    if (result.success) {
      setStaff(result.data.staff);
      setTotalStaff(result.data.totalCount);
    }
    setLoading(false);
  };

  const fetchStaffByDate = async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    const result = await getStaffByDate(startDate, endDate);
    if (result.success) {
      setStaff(result.data);
      setIsSearching(true);
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setIsSearching(false);
      fetchStaff();
      return;
    }
    setIsSearching(true);
    setLoading(true);
    const result = await searchStaff(searchTerm);
    let filtered = result.success ? result.data : [];
    setStaff(filtered);
    setLoading(false);
  };

  const handleEdit = (member) => {
    setEditingId(member.id);
    setEditData({
      fullName: member.fullName,
      phoneNumber: member.phoneNumber,
      idImage: member.idImage
    });
    setIdPreview(member.idImage);
  };

  const handleSave = async (staffId) => {
    const result = await updateStaff(staffId, editData);
    if (result.success) {
      setStaff(staff.map(member =>
        member.id === staffId ? { ...member, ...editData } : member
      ));
      setEditingId(null);
      setEditData({});
      setIdPreview(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
    setIdPreview(null);
  };

  const handleDelete = async (staffId) => {
    const result = await deleteStaff(staffId);
    if (result.success) {
      setStaff(staff.filter(member => member.id !== staffId));
      setTotalStaff(prev => prev - 1);
      setDeleteConfirm(null);
    }
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setIsSearching(false);
    fetchStaff();
  };

  const handleIdUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setIdPreview(event.target.result);
      setEditData(prev => ({ ...prev, idImage: file }));
    };
    reader.readAsDataURL(file);
  };

  const handleRegister = async (formData) => {
    const result = await registerStaff(formData);
    if (result.success) {
      setShowRegisterForm(false);
      fetchStaff();
    }
    return result;
  };

  const handleDownloadReport = () => {
    if (!staff.length) { alert("No staff data available."); return; }
    const printWindow = window.open('', '_blank');
    const dateRangeText = startDate && endDate ? `${startDate} to ${endDate}` : 'All Dates';
    const htmlContent = `
      <html>
        <head>
          <title>Staff Management Report</title>
          <style>
            body { font-family: Arial; margin: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f8f9fa; font-weight: bold; }
            tr:nth-child(even){ background-color: #f9f9f9; }
          </style>
        </head>
        <body>
          <h2>Staff Management Report</h2>
          <div>Date Range: ${dateRangeText}</div>
          <div>Total Staff: ${staff.length}</div>
          <table>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Phone Number</th>
                <th>Registration Date</th>
                <th>ID</th>
              </tr>
            </thead>
            <tbody>
              ${staff.map(s => `
                <tr>
                  <td>${s.fullName}</td>
                  <td>${s.phoneNumber}</td>
                  <td>${new Date(s.registrationDate).toLocaleDateString()}</td>
                  <td>${s.idImage ? 'Yes' : 'No'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.onload = () => printWindow.print();
  };

  const totalPages = Math.ceil(totalStaff / staffPerPage);

  if (loading) return <div className="loading-container">Loading staff data...</div>;

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="staff-management-container">
        {/* Stats & Search */}
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-title">Total Staff</div>
            <div className="stat-value">{totalStaff}</div>
          </div>

          <div className="search-container">
            <div className="search-input-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSearch()}
                className="search-input"
              />
              {searchTerm && <button onClick={handleClearSearch} className="clear-input-button">×</button>}
            </div>
            <button onClick={handleSearch} className="search-button"><FaSearch /> Search</button>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="filters-container">
          <div className="date-filter-container">
            <div className="date-inputs-row">
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="date-input" />
              <label> to </label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="date-input" />
            </div>
          </div>
          <div className="action-buttons-container">
            <button onClick={handleDownloadReport} className="download-button"><FaDownload /> Download PDF</button>
            <button onClick={() => setShowRegisterForm(true)} className="new-staff-button"><FaPlus /> New Staff</button>
          </div>
        </div>

        {/* Staff Table */}
        <div className="staff-table-container">
          <table className="staff-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Phone Number</th>
                <th>Registration Date</th>
                <th>ID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map(member => (
                <tr key={member.id}>
                  <td>{editingId === member.id
                    ? <input type="text" value={editData.fullName} onChange={e => handleInputChange('fullName', e.target.value)} />
                    : member.fullName}</td>

                  <td>{editingId === member.id
                    ? <input type="text" value={editData.phoneNumber} onChange={e => handleInputChange('phoneNumber', e.target.value)} />
                    : member.phoneNumber}</td>

                  <td>{new Date(member.registrationDate).toLocaleDateString()}</td>

                  <td>
                    {editingId === member.id ? (
                      <input type="file" accept="image/*" onChange={handleIdUpload} />
                    ) : member.idImage ? (
                      <button onClick={() => setIdPreview(member.idImage)} className="view-id-button">
                        <FaEye /> View
                      </button>
                    ) : 'No ID'}
                  </td>

                  <td>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      {editingId === member.id ? (
                        <>
                          <button onClick={() => handleSave(member.id)} className="action-button save-button"><FaSave /></button>
                          <button onClick={handleCancelEdit} className="action-button cancel-button"><FaTimes /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(member)} className="action-button edit-button"><FaEdit /></button>
                          <button onClick={() => setDeleteConfirm(member.id)} className="action-button delete-button"><FaTrash /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {staff.length === 0 && (
          <div className="no-staff">
            {isSearching ? 'No staff found matching your search' : 'No staff found'}
          </div>
        )}

        {!isSearching && totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              <FaArrowLeft /> Previous
            </button>
            <span className="page-info">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              Next <FaArrowRight />
            </button>
          </div>
        )}

        {deleteConfirm && (
          <div className="delete-modal">
            <div className="delete-modal-content">
              <h3>Confirm Delete</h3>
              <p>Are you sure you want to delete this staff?</p>
              <div className="delete-modal-actions">
                <button onClick={() => handleDelete(deleteConfirm)} className="confirm-delete-button">Yes, Delete</button>
                <button onClick={() => setDeleteConfirm(null)} className="cancel-delete-button">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {showRegisterForm && (
          <StaffRegistrationForm onClose={() => setShowRegisterForm(false)} onRegister={handleRegister} />
        )}
      </div>
    </div>
  );
}

// Staff Registration Form (unchanged except token removed)
function StaffRegistrationForm({ onClose, onRegister }) {
  const [formData, setFormData] = useState({ fullName: '', phoneNumber: '', password: '', idImage: null });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [idPreview, setIdPreview] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');

  const validatePassword = (password) => {
    if (password.length < 6) return 'too-short';
    if (!/[A-Z]/.test(password)) return 'no-upper';
    if (!/[a-z]/.test(password)) return 'no-lower';
    if (!/\d/.test(password)) return 'no-number';
    return 'strong';
  };

  const handlePasswordChange = (password) => {
    setFormData(prev => ({ ...prev, password }));
    const strength = validatePassword(password);
    switch (strength) {
      case 'too-short': setPasswordStrength('At least 6 characters required'); break;
      case 'no-upper': setPasswordStrength('Add uppercase letter'); break;
      case 'no-lower': setPasswordStrength('Add lowercase letter'); break;
      case 'no-number': setPasswordStrength('Add number'); break;
      case 'strong': setPasswordStrength('Strong password'); break;
      default: setPasswordStrength(''); break;
    }
  };

  const handleIdUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setIdPreview(event.target.result);
      setFormData(prev => ({ ...prev, idImage: file }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = 'Full name required';
    if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number required';
    if (!formData.password) newErrors.password = 'Password required';
    if (!formData.idImage) newErrors.idImage = 'ID image required';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setLoading(true);
    const result = await onRegister(formData);
    setLoading(false);
    if (!result.success) setErrors({ submit: result.message });
  };

  const removeId = () => {
    setIdPreview(null);
    setFormData(prev => ({ ...prev, idImage: null }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content staff-registration-modal">
        <div className="modal-header">
          <h2>Register New Staff</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        {errors.submit && <div className="error-message">{errors.submit}</div>}
        <form onSubmit={handleSubmit} className="staff-registration-form">
          <div>
            <label>Full Name *</label>
            <input type="text" value={formData.fullName} onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))} className={errors.fullName ? 'error' : ''} placeholder="Enter full name" />
            {errors.fullName && <span className="error-text">{errors.fullName}</span>}
          </div>
          <div>
            <label>Phone Number *</label>
            <input type="text" value={formData.phoneNumber} onChange={e => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))} className={errors.phoneNumber ? 'error' : ''} placeholder="+251900000000" />
            {errors.phoneNumber && <span className="error-text">{errors.phoneNumber}</span>}
          </div>
          <div>
            <label>Password *</label>
            <input type="password" value={formData.password} onChange={e => handlePasswordChange(e.target.value)} className={errors.password ? 'error' : ''} placeholder="At least 6 characters" />
            {passwordStrength && <span className={`password-strength ${passwordStrength === 'Strong password' ? 'strong' : 'weak'}`}>{passwordStrength}</span>}
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>
          <div className="form-group">
            <label>ID *</label>
            <div className="id-upload-area">
              {idPreview ? (
                <div className="id-preview-container">
                  <img src={idPreview} alt="ID preview" className="id-preview-large" />
                  <button type="button" onClick={removeId} className="remove-id-button">Remove</button>
                </div>
              ) : (
                <div className="id-upload-placeholder">
                  <input type="file" accept="image/*" onChange={handleIdUpload} className="id-input-hidden" id="id-upload" />
                  <label htmlFor="id-upload" className="id-upload-label"><FaPlus className="upload-icon" /></label>
                </div>
              )}
              {errors.idImage && <span className="error-text">{errors.idImage}</span>}
            </div>
          </div>
          <div>
            <button type="button" onClick={onClose} className="cancel-button">Cancel</button>
            <button type="submit" className="submit-button" disabled={loading}>{loading ? 'Registering...' : 'Register Staff'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
