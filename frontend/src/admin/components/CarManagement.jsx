import React, { useState, useEffect } from 'react';
import { getDrivers, updateDriver, deleteDriver, searchDrivers, registerDriver, getDriversByDate } from '../services/api';
import { FaEdit, FaTrash, FaSave, FaTimes, FaSearch, FaArrowLeft, FaArrowRight, FaPlus, FaDownload, FaEye } from 'react-icons/fa';
import Sidebar from './Sidebar';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import '../styles/CarManagement.css';

export default function CarManagement() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCars, setTotalCars] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const carsPerPage = 6;

  useEffect(() => {
    fetchCars();
  }, [currentPage]);

  const fetchCars = async () => {
    setLoading(true);
    const token = localStorage.getItem('authToken');
    const result = await getCars(token, currentPage, carsPerPage);
    
    if (result.success) {
      setCars(result.data.cars);
      setTotalCars(result.data.totalCount);
    }
    setLoading(false);
  };

  const fetchCarsByDate = async () => {
    if (!startDate || !endDate) return;
    
    setLoading(true);
    const token = localStorage.getItem('authToken');
    const result = await getCarsByDate(token, startDate, endDate);
    
    if (result.success) {
      setCars(result.data);
      setIsSearching(true);
    }
    setLoading(false);
  };

const handleSearch = async () => {
  if (!searchTerm.trim()) {
    setIsSearching(false);
    fetchCars();
    return;
  }

  setIsSearching(true);
  setLoading(true);
  const token = localStorage.getItem('authToken');
  const result = await searchCars(token, searchTerm);

  if (result.success) {
    // Try backend search first
    let filtered = result.data;

    // If backend didn’t return anything, fallback to local filter
    if (!filtered || filtered.length === 0) {
      const allCars = await fetchCars(); // fetch all from API
      filtered = allCars.filter(car =>
        car.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.phoneNumber.includes(searchTerm)
      );
    }

    setCars(filtered);
  }
  setLoading(false);
};


 const handleEdit = (car) => {
  setEditingId(car.id);
  setEditData({
    fullName: car.fullName,
    phoneNumber: car.phoneNumber,
    plateNumber: car.plateNumber,
    license: car.license
  });
};

  const handleSave = async (carId) => {
    const token = localStorage.getItem('authToken');
    const result = await updateCar(token, carId, editData);
    
    if (result.success) {
      setCars(cars.map(car => 
        car.id === carId ? { ...car, ...editData } : car
      ));
      setEditingId(null);
      setEditData({});
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleDelete = async (carId, phoneNumber) => {
    const token = localStorage.getItem('authToken');
    const result = await deleteCar(token, carId, phoneNumber);
    
    if (result.success) {
      setCars(cars.filter(car => car.id !== carId));
      setTotalCars(prev => prev - 1);
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
    setStartDate('');
    setEndDate('');
    setIsSearching(false);
    fetchCars();
  };


  const handleRegister = async (formData) => {
    const token = localStorage.getItem('authToken');
    const result = await registerDriver(token, formData);
    
    if (result.success) {
      setShowRegisterForm(false);
      fetchCars();
    }
    return result;
  };

  const handleDownloadReport = () => {
  if (!startDate || !endDate || drivers.length === 0) {
    alert("No driver data available for the selected date range.");
    return;
  }

  try {
    const printWindow = window.open('', '_blank');

    const dateRangeText = `${startDate} to ${endDate}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Driver Management Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .header h1 {
              font-size: 24px;
              margin-bottom: 5px;
              color: #2c3e50;
            }
            .filters {
              margin-bottom: 15px;
              font-size: 14px;
              color: #666;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 10px;
              text-align: left;
              font-size: 13px;
            }
            th {
              background-color: #f8f9fa;
              font-weight: bold;
              color: #333;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .footer {
              margin-top: 20px;
              font-size: 12px;
              color: #777;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Driver Management Report</h1>
            <div class="filters">
              <div>Date Range: ${dateRangeText}</div>
              <div>Generated on: ${new Date().toLocaleString()}</div>
              <div>Total Drivers: ${cars.length}</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Phone Number</th>
                <th>Plate Number</th>
                <th>Registration Date</th>
              </tr>
            </thead>
            <tbody>
              ${cars.map(car => `
                <tr>
                  <td>${cars.fullName}</td>
                  <td>${cars.phoneNumber}</td>
                  <td>${cars.plateNumber}</td>
                  <td>${new Date(car.registrationDate).toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            Report generated by Daga Meter Ride System
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    let fileName = `driver_report_${startDate}_to_${endDate}`;

    printWindow.onload = function() {
      try {
        printWindow.print();
      } catch (e) {
        console.error("Print error:", e);
        alert("Report opened in new window. Use your browser's Print > Save as PDF option.");
      }
    };
  } catch (error) {
    console.error("Error generating driver report:", error);
    alert("Failed to generate driver report. Please try again.");
  }
};


  const totalPages = Math.ceil(totalDrivers / carsPerPage);

  if (loading) {
    return (
      <div className="loading-container">
        <div>Loading car data...</div>
      </div>
    );
  }



  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <div className="car-management-container">
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-title">Total Cars</div>
            <div className="stat-value">{totalCars}</div>
          </div>

          <div className="search-container">
            <div className="search-input-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search"
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

        </div>

        <div className="filters-container">
          <div className="date-filter-container">
            <div className="date-inputs-row">
              <div className="date-input-group">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="date-input"
                />
              </div>
              <label> to </label>
              <div className="date-input-group">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="date-input"
                />
              </div>
            </div>
          </div>

          <div className="action-buttons-container">
            <button 
              onClick={handleDownloadReport} 
              className="download-button"
              disabled={!startDate || !endDate || cars.length === 0}
            >
              <FaDownload /> Download PDF
            </button>
            <button onClick={() => setShowRegisterForm(true)} className="new-car-button">
              <FaPlus /> New Car
            </button>
          </div>
        </div>

        <div className="cars-table-container">
          <table className="cars-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Phone Number</th>
                <th>Plate Number</th>
                <th>Registration Date</th>
                <th>License</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver) => (
                <tr key={driver.id}>
                  <td>
                    {editingId === driver.id ? (
                      <input
                        type="text"
                        value={editData.fullName || ''}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className="edit-input"
                      />
                    ) : (
                      driver.fullName
                    )}
                  </td>
                  <td>
                    {editingId === driver.id ? (
                      <input
                        type="text"
                        value={editData.phoneNumber || ''}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                        className="edit-input"
                      />
                    ) : (
                      driver.phoneNumber
                    )}
                  </td>
                  <td>
                    {editingId === driver.id ? (
                      <input
                        type="text"
                        value={editData.plateNumber || ''}
                        onChange={(e) => handleInputChange('plateNumber', e.target.value)}
                        className="edit-input"
                      />
                    ) : (
                      driver.plateNumber
                    )}
                  </td>
                  <td>{new Date(driver.registrationDate).toLocaleDateString()}</td>
                  <td>
                    {editingId === driver.id ? (
                      <div className="license-upload">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLicenseUpload}
                          className="license-input"
                        />
                        {licensePreview && (
                          <img src={licensePreview} alt="License preview" className="license-preview" />
                        )}
                      </div>
                    ) : (
                      <button 
                        onClick={() => window.open(driver.license, '_blank')}
                        className="view-license-button"
                      >
                        <FaEye /> View
                      </button>
                    )}
                  </td>
                  <td>
                    {editingId === driver.id ? (
                      <div className="action-buttons">
                        <button
                          onClick={() => handleSave(driver.id)}
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
                          onClick={() => handleEdit(driver)}
                          className="action-button edit-button"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(driver.id)}
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

          {drivers.length === 0 && (
            <div className="no-drivers">
              {isSearching ? 'No drivers found matching your search' : 'No drivers found'}
            </div>
          )}
        </div>

        {!isSearching && totalPages > 1 && (
          <div className="paginationd">
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
              <p>Are you sure you want to delete this driver permanently?</p>
              <div className="delete-modal-actions">
                <button
                  onClick={() => handleDelete(deleteConfirm, drivers.find(d => d.id === deleteConfirm)?.phoneNumber)}
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

        {showRegisterForm && (
          <DriverRegistrationForm 
            onClose={() => setShowRegisterForm(false)}
            onRegister={handleRegister}
          />
        )}
      </div>
    </div>
  );
}



// Driver Registration Form Component
function DriverRegistrationForm({ onClose, onRegister }) {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    plateNumber: '',
    password: '',
    license: null
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [licensePreview, setLicensePreview] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState('');

  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasMinLength = password.length >= 6;

    if (!hasMinLength) return 'too-short';
    if (!hasUpperCase) return 'no-upper';
    if (!hasLowerCase) return 'no-lower';
    if (!hasNumber) return 'no-number';
    return 'strong';
  };

  const handlePasswordChange = (password) => {
    setFormData(prev => ({ ...prev, password }));
    const strength = validatePassword(password);
    
    switch (strength) {
      case 'too-short':
        setPasswordStrength('At least 6 characters required');
        break;
      case 'no-upper':
        setPasswordStrength('Add uppercase letter');
        break;
      case 'no-lower':
        setPasswordStrength('Add lowercase letter');
        break;
      case 'no-number':
        setPasswordStrength('Add number');
        break;
      case 'strong':
        setPasswordStrength('Strong password');
        break;
      default:
        setPasswordStrength('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.plateNumber) newErrors.plateNumber = 'Plate number is required';
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (validatePassword(formData.password) !== 'strong') {
      newErrors.password = 'Password does not meet requirements';
    }
    if (!formData.license) newErrors.license = 'License image is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    const result = await onRegister(formData);
    setLoading(false);

    if (!result.success) {
      setErrors({ submit: result.message });
    }
  };

  const handleLicenseUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ license: 'File size must be less than 5MB' });
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setErrors({ license: 'Please upload an image file' });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setLicensePreview(e.target.result);
        setFormData(prev => ({ ...prev, license: file }));
        setErrors(prev => ({ ...prev, license: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLicense = () => {
    setLicensePreview(null);
    setFormData(prev => ({ ...prev, license: null }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content driver-registration-modal">
        <div className="modal-header">
          <h2>Register New Driver</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        
        {errors.submit && <div className="error-message">{errors.submit}</div>}
        
        <form onSubmit={handleSubmit} className="driver-registration-form">
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className={errors.fullName ? 'error' : ''}
                placeholder="Enter full name"
              />
              {errors.fullName && <span className="error-text">{errors.fullName}</span>}
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="text"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className={errors.phoneNumber ? 'error' : ''}
                placeholder="+251900000000"
              />
              {errors.phoneNumber && <span className="error-text">{errors.phoneNumber}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Plate Number *</label>
              <input
                type="text"
                value={formData.plateNumber}
                onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                className={errors.plateNumber ? 'error' : ''}
                placeholder="AA000BB"
              />
              {errors.plateNumber && <span className="error-text">{errors.plateNumber}</span>}
            </div>

            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className={errors.password ? 'error' : ''}
                placeholder="At least 6 characters"
              />
              {passwordStrength && (
                <span className={`password-strength ${
                  passwordStrength === 'Strong password' ? 'strong' : 'weak'
                }`}>
                  {passwordStrength}
                </span>
              )}
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Driver's License *</label>
            <div className="license-upload-area">
              {licensePreview ? (
                <div className="license-preview-container">
                  <img src={licensePreview} alt="License preview" className="license-preview-large" />
                  <button type="button" onClick={removeLicense} className="remove-license-button">
                    Remove
                  </button>
                </div>
              ) : (
                <div className="license-upload-placeholder">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLicenseUpload}
                    className="license-input-hidden"
                    id="license-upload"
                  />
                  <label htmlFor="license-upload" className="license-upload-label">
                    <FaPlus className="upload-icon" />
                    <span>Upload License Image</span>
                    <small>Max 5MB, JPG/PNG</small>
                  </label>
                </div>
              )}
              {errors.license && <span className="error-text">{errors.license}</span>}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="submit-button">
              {loading ? 'Registering...' : 'Register Driver'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}