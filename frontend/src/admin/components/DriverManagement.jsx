// src/admin/components/DriverManagement.jsx
import React, { useState, useEffect } from 'react';
import { 
  getDrivers, updateDriver, deleteDriver, searchDrivers, registerDriver, getDriversByDate 
} from '../services/api';
import { FaEdit, FaTrash, FaFilter ,FaSave, FaTimes, FaSearch, FaArrowLeft, FaArrowRight, FaPlus, FaDownload, FaEye } from 'react-icons/fa';
import Sidebar from './Sidebar';
import '../styles/DriverManagement.css';

export default function DriverManagement() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalDrivers, setTotalDrivers] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [licensePreview, setLicensePreview] = useState(null);

  const driversPerPage = 6;

  useEffect(() => {
    fetchDrivers();
  }, [currentPage]);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const result = await getDrivers(currentPage);
      if (result.success) {
        setDrivers(result.data.drivers || []);
        setTotalDrivers(result.data.totalCount || 0);
      } else {
        console.error(result.message);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setIsSearching(false);
      fetchDrivers();
      return;
    }
    setLoading(true);
    const result = await searchDrivers(searchTerm);
    if (result.success && result.driver) {
      
      setDrivers(result.driver); // backend returns single driver
      setIsSearching(true);
      console.log(drivers);
    } else {
      setDrivers([]); // no driver found
      setIsSearching(true);
    }

    setLoading(false);
  };

const handleEdit = (driver) => {
  setEditingId(driver.phone);
  setEditData({
    name: driver.name,
    phone: driver.phone,
    plate_no: driver.plate_no,
    license: null,
  });
};

  const handleSave = async (driver) => {
  const { name, phone, plate_no } = editData;

  try {
    const result = await updateDriver(name, phone, plate_no, currentPage);

    if (result.success) {

      fetchDrivers(); // refetch the current page
      setEditingId(null);
      setEditData({});
      setDrivers(prev =>
        prev.map(d =>
          d.phone === driver.phone ? { ...d, name: name, phone: phone, plate_no: plate_no } : d
        )
      );

      setEditingId(null);
      setEditData({});
    } else {
      console.error(result.message);
    }
  } catch (err) {
    console.error("Update failed:", err);
  }
};


  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleDelete = async (driver) => {
    const result = await deleteDriver(driver.phoneNumber, currentPage);
    if (result.success) {
      setDrivers(prev => prev.filter(d => d.id !== driver.id));
      setTotalDrivers(prev => prev - 1);
      setDeleteConfirm(null);
    } else {
      console.error(result.message);
    }
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleLicenseUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setLicensePreview(reader.result);
      reader.readAsDataURL(file);
      setEditData(prev => ({ ...prev, license: file }));
    }
  };

  // Filter drivers by date
const filterDriversByDate = async () => {
  if (!startDate || !endDate) {
    alert("Please select both start and end dates.");
    return;
  }

  console.log("Filtering with dates:", { startDate, endDate }); // Debug log

  setLoading(true);
  try {
    const result = await getDriversByDate(startDate, endDate);
    console.log("API Response:", result); // Debug log
    
    if (result.success && result.data) {
      setDrivers(result.data || []); 
      setIsSearching(true); 
      setTotalDrivers(result.data.length || 0); 
      console.log("Filtered drivers:", result.data.length); // Debug log
    } else {
      setDrivers([]);
      setTotalDrivers(0);
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

// Download drivers report
const handleDownload = async () => {
  if (!startDate || !endDate) {
    alert('Please select start and end date.');
    return;
  }

  try {
    const res = await getDriversByDate(startDate, endDate);
    if (!res.success || !res.data.length) {
      alert('No drivers available for the selected date range.');
      return;
    }

    const driversData = res.data;
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
          <title>Daga Meter Ride - Drivers Report</title>
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
                <span class="meta-label">Total Drivers</span>
                <span class="meta-value">${driversData.length.toLocaleString()}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Report Generated</span>
                <span class="meta-value">${generatedDate}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Report Type</span>
                <span class="meta-value">Driver Analysis Report</span>
              </div>
            </div>
            
            <!-- Drivers Table -->
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Full Name</th>
                  <th>Phone Number</th>
                  <th>Plate Number</th>
                  <th>Registration Date</th>
                </tr>
              </thead>
              <tbody>
                ${driversData.map((driver, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${driver.name || 'N/A'}</td>
                    <td>${driver.phone || 'N/A'}</td>
                    <td>${driver.plate_no || 'N/A'}</td>
                    <td>${driver.created_at ? new Date(driver.created_at).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <!-- Footer -->
            <div class="footer">
              <div class="footer-content">
                <div>Daga Meter Ride - Drivers Management System</div>
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

// new driver registration 
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

const handleRegister = async (formData) => {
  const { name, phone, plate_no, password, licence } = formData;
  if (!name || !phone || !plate_no || !password || !licence) {
    alert('Please fill all required fields');
    return { success: false, message: 'All fields are required' };
  }
  
  const submitData = new FormData();
  submitData.append("name", name);
  submitData.append("phone", phone);
  submitData.append("plate_no", plate_no);
  submitData.append("password", password);
  submitData.append("licence", licence);
  
  console.log("Submitting driver data:", {
    name: name,
    phone: phone,
    plate_no: plate_no,
    hasPassword: !!password,
    hasLicence: !!licence,
    licenceType: licence?.type,
    licenceSize: licence?.size
  });
  
  try {
    const result = await registerDriver(submitData);
    
    console.log("Registration result:", result);
    
    if (result.success) {
      setShowRegisterForm(false);
      setRegistrationSuccess(true);
      fetchDrivers();
      
      // Show success message
      setTimeout(() => {
        setRegistrationSuccess(false);
      }, 3000);
      
      return result;
    } else {
      // Show specific error message from backend
      alert(result.message || "Registration failed");
      return result;
    }
  } catch (error) {
    console.error("Registration error:", error);
    alert("Registration failed: " + (error.message || "Unknown error"));
    return { success: false, message: error.message };
  }
};

const handleClearSearch = () => {
  setSearchTerm('');
  setIsSearching(false);
  setCurrentPage(1);
  setStartDate('');
  setEndDate('');
  fetchDrivers(1); 
};

  const totalPages = Math.ceil(totalDrivers / driversPerPage);

  if (loading) return <div className="loading-container">Loading driver data...</div>;

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="driver-management-container">
        {/* Stats and search */}
{/* Stats and search */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-title">Total Drivers</div>
          <div className="stat-value">{totalDrivers}</div>
        </div>
        
        {/* Search */}
        <div className="search-container">
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSearch()}
              className="search-input"
            />
            <button onClick={handleSearch} className="search-buttonu"><FaSearch /> Search</button>
            {searchTerm && (
              <button onClick={handleClearSearch} className="clear-input-button">×</button>
            )}

          </div>
          
          {/* Date filters */}
          
        </div>
        
      </div>

      {registrationSuccess && (
  <div className="success-message">
    ✅ Driver registered successfully!
  </div>
)}

      <div className="date-filter-containerd">
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              className="date-inputd" 
            />
            <label>to</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              className="date-inputd" 
            />
            <button 
                    onClick={filterDriversByDate} 
                    className="filter-date-button"
                    disabled={!startDate || !endDate}
                  >
                    <FaFilter /> Filter
                  </button>
             {/* Download */}
          <button onClick={handleDownload} className="download-buttonu">
            <FaDownload /> Download
          </button>

           <button 
                onClick={() => setShowRegisterForm(true)} 
                className="new-driver-buttond"
              >
                <FaPlus /> New Driver
              </button>
          </div>
          
         

        {/* Drivers table */}
        <div className="drivers-table-container">
          <table className="drivers-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Phone Number</th>
                <th>Plate Number</th>
                <th>License</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map(driver => (
                <tr key={driver.phone}>
                  <td>
                    {editingId === driver.phone ? (
                      <input type="text" value={editData.name || ''} onChange={e => handleInputChange('name', e.target.value)} />
                    ) : driver.name}
                  </td>
                  <td>
                    {editingId === driver.phone ? (
                      <input type="text" value={editData.phone || ''} onChange={e => handleInputChange('phone', e.target.value)} />
                    ) : driver.phone}
                  </td>
                  <td>
                    {editingId === driver.phone ? (
                      <input type="text" value={editData.plate_no || ''} onChange={e => handleInputChange('plate_no', e.target.value)} />
                    ) : driver.plate_no}
                  </td>
                  <td>
                    {editingId === driver.phone ? (
                      <input type="file" onChange={handleLicenseUpload} />
                    ) : (
                      <button onClick={() => window.open(driver.license, '_blank')} className='view-license-button '><FaEye /></button>
                    )}
                  </td>
                  <td>
                    {editingId === driver.phone ? (
                      <div className="action-buttons">
                        <button onClick={() => handleSave(driver)} className="action-button save-button"><FaSave /></button>
                        <button onClick={handleCancelEdit} className="action-button cancel-button"><FaTimes/></button>
                      </div>
                    ) : (
                      <div className="action-buttons">
                        <button onClick={() => handleEdit(driver)} className="action-button edit-button"><FaEdit /></button>
                        <button onClick={() => setDeleteConfirm(driver.id)} className="action-button delete-button"><FaTrash /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isSearching && totalPages > 1 && (
          <div className="paginationd">
            <button className="pagination-button" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}><FaArrowLeft /> Prev</button>
            <span>Page {currentPage} of {totalPages}</span>
            <button className="pagination-button" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Next <FaArrowRight /></button>
          </div>
        )}

        {/* Delete confirm modal */}
        {deleteConfirm && (
          <div className="delete-modal">
            <div>
              <p>Are you sure you want to delete this driver?</p>
              <button onClick={() => handleDelete(drivers.find(d => d.id === deleteConfirm))}>Yes</button>
              <button onClick={() => setDeleteConfirm(null)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Register driver */}
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
    name: '',
    phone: '',
    plate_no: '',
    password: '',
    licence: null
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
  if (!formData.name) newErrors.name = 'Full name is required';
  if (!formData.phone) newErrors.phone = 'Phone number is required';
  if (!formData.plate_no) newErrors.plate_no = 'Plate number is required';
  if (!formData.password) {
    newErrors.password = 'Password is required';
  } else if (validatePassword(formData.password) !== 'strong') {
    newErrors.password = 'Password does not meet requirements';
  }
  if (!formData.licence) newErrors.licence = 'License image is required';

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  setLoading(true);
  try {
    const result = await onRegister(formData);
    
    if (result.success) {
      alert('Driver registered successfully!');
      // Reset form after success
      setFormData({
        name: '',
        phone: '',
        plate_no: '',
        password: '',
        licence: null
      });
      setLicensePreview(null);
    } else {
      setErrors({ submit: result.message || 'Registration failed' });
    }
  } catch (error) {
    setErrors({ submit: error.message || 'Registration failed' });
  } finally {
    setLoading(false);
  }
};

const handleLicenseUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ licence: 'File size must be less than 5MB' });
      return;
    }

    // Check file type - allow common image formats
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setErrors({ licence: 'Please upload a valid image file (JPEG, PNG, GIF)' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setLicensePreview(e.target.result);
      setFormData(prev => ({ ...prev, licence: file }));
      setErrors(prev => ({ ...prev, licence: '' }));
    };
    reader.onerror = () => {
      setErrors({ licence: 'Error reading file. Please try again.' });
    };
    reader.readAsDataURL(file);
  }
};

  const removeLicense = () => {
    setLicensePreview(null);
    setFormData(prev => ({ ...prev, licence: null }));
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
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={errors.name ? 'error' : ''}
                placeholder="Enter full name"
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={errors.phone ? 'error' : ''}
                placeholder="+251900000000"
              />
              {errors.phone && <span className="error-text">{errors.phone}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Plate Number *</label>
              <input
                type="text"
                value={formData.plate_no}
                onChange={(e) => setFormData({ ...formData, plate_no: e.target.value })}
                className={errors.plate_no ? 'error' : ''}
                placeholder="AA000BB"
              />
              {errors.plate_no && <span className="error-text">{errors.plate_no}</span>}
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
                 
                </div>
              )}
              {errors.licence && <span className="error-text">{errors.licence}</span>}
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