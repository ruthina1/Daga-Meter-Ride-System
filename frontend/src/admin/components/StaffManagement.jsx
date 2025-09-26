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
  FaFilter,
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
    try {
      const result = await getStaff(currentPage, staffPerPage);
      if (result.success) {
        setStaff(result.data.staff || []);
        setTotalStaff(result.data.totalCount || 0);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setIsSearching(false);
      fetchStaff();
      return;
    }
    setLoading(true);
    const result = await searchStaff(searchTerm);
    if (result.success && result.staff) {
      
      setStaff(result.staff); // backend returns single driver
      setIsSearching(true);
      console.log(staff);
    } else {
      setStaff([]); // no driver found
      setIsSearching(true);
    }

    setLoading(false);
  };

  const handleEdit = (member) => {
    setEditingId(member.phone);
    setEditData({
      fullName: member.name,
      phoneNumber: member.phone
    });
  };

  const handleSave = async (staffPhone) => {
    try {
      const result = await updateStaff(staffPhone, editData);
      if (result.success) {
        setStaff(staff.map(s => s.phone === staffPhone ? { ...s, ...editData } : s));
        setEditingId(null);
        setEditData({});
        setIdPreview(null);
      }
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
    setIdPreview(null);
  };

  const handleDelete = async (staffPhone) => {
    try {
      const result = await deleteStaff(staffPhone);
      if (result.success) {
        setStaff(staff.filter(s => s.phone !== staffPhone));
        setTotalStaff(prev => prev - 1);
        setDeleteConfirm(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const filterStaffByDate = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }
    setLoading(true);
    try {
      const result = await getStaffByDate(startDate, endDate);
      if (result.success && result.data) {
        setStaff(result.data || []);
        setTotalStaff(result.data.length || 0);
        setIsSearching(true);
      } else {
        setStaff([]);
        setTotalStaff(0);
        alert("No staff found for the selected date range.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to filter staff by date.");
    }
    setLoading(false);
  };

  const handleDownload = async () => {
    if (!startDate || !endDate) {
      alert('Please select start and end date.');
      return;
    }
    try {
      const res = await getStaffByDate(startDate, endDate);
      if (!res.success || !res.data.length) {
        alert('No staff available for the selected date range.');
        return;
      }
      const staffData = res.data;
      const dateRangeText = `${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`;
      const generatedDate = new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' });

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
              <h2 class="report-title">Staff Management Report</h2>
            </div>
            
            <!-- Report Metadata -->
            <div class="report-meta">
              <div class="meta-item">
                <span class="meta-label">Date Range</span>
                <span class="meta-value">${dateRangeText}</span>
              </div>
              <span class="meta-label">Total Drivers</span>
                <span class="meta-value">${staffData.length.toLocaleString()}</span>
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
                  <th>Registration Date</th>
                </tr>
              </thead>
              <tbody>
                ${staffData.map((s, i) => `
                  <tr>
                    <td>${i+1}</td>
                    <td>${s.name}</td>
                    <td>${s.phone}</td>
                    <td>${new Date(s.registrationDate).toLocaleDateString()}</td>
                  </tr>
                `).join('')}
               </tbody>
            </table>
            
            <!-- Footer -->
            <div class="footer">
              <div class="footer-content">
                <div>Daga Meter Ride - Staff Management System</div>
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
      printWindow.onload = () => printWindow.print();
    } catch (err) {
      console.error(err);
      alert("Failed to generate report.");
    }
  };


  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const handleRegister = async (formData) => {
    const { name, phone, password, residential_id } = formData;
    
    // Check if all required fields are filled
    if (!name || !phone || !password || !residential_id) {
      alert('Please fill all required fields');
      return { success: false, message: 'All fields are required' };
    }
    
    const submitData = new FormData();
    submitData.append("name", name);
    submitData.append("phone", phone);
    submitData.append("password", password);
    submitData.append("residential_id", residential_id);
    
    try {
      const result = await registerStaff(submitData);
      
      console.log("Registration result:", result);
      
      if (result.success) {
        setShowRegisterForm(false);
        setRegistrationSuccess(true);
        fetchStaff();
        
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
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyPress={e => e.key==='Enter' && handleSearch()}
                className="search-input"
              />
              <button onClick={handleSearch} className="search-button"><FaSearch /> Search</button>
            </div>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="date-filter-containerd">
          <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className="date-inputd" />
          <label>to</label>
          <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} className="date-inputd" />
          <button onClick={filterStaffByDate} className="filter-date-button" disabled={!startDate || !endDate}><FaFilter /> Filter</button>
          <button onClick={handleDownload} className="download-buttonu"><FaDownload /> Download</button>
          <button onClick={() => setShowRegisterForm(true)} className="new-driver-buttond"><FaPlus /> New Staff</button>
        </div>

        {/* Staff Table */}
        <div className="drivers-table-container">
          <table className="drivers-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Phone Number</th>
                <th>Registered Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map(member => (
                <tr key={member.phone}>
                  <td>{editingId===member.phone
                    ? <input type="text" value={editData.name} onChange={e=>handleInputChange('name', e.target.value)} />
                    : member.name}</td>
                  <td>{editingId===member.phone
                    ? <input type="text" value={editData.phone} onChange={e=>handleInputChange('phone', e.target.value)} />
                    : member.phone}</td>
                  <td>{new Date(member.created_at).toLocaleDateString()}</td> {/* Display registration date */}
      
                  <td>
                    {editingId===member.phone
                      ? <div className='action-buttons'>
                          <button onClick={()=>handleSave(member.phone)} className="action-button save-button"><FaSave /></button>
                          <button onClick={handleCancelEdit} className="action-button cancel-button"><FaTimes /></button>
                        </div>
                      : <div className='action-buttons'>
                          <button onClick={()=>handleEdit(member)} className="action-button edit-button"><FaEdit /></button>
                          <button onClick={()=>setDeleteConfirm(member.phone)} className="action-button delete-button"><FaTrash /></button>
                        </div>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {staff.length===0 && <div className="no-staff">No staff found</div>}
        </div>

        {/* Pagination */}
        {!isSearching && totalPages>1 && (
          <div className="paginationd">
            <button onClick={()=>setCurrentPage(prev=>Math.max(prev-1,1))} disabled={currentPage===1} className="pagination-button"><FaArrowLeft /> Prev</button>
            <span>Page {currentPage} of {totalPages}</span>
            <button onClick={()=>setCurrentPage(prev=>Math.min(prev+1,totalPages))} disabled={currentPage===totalPages} className="pagination-button">Next <FaArrowRight /></button>
          </div>
        )}

        {/* Delete Modal */}
        {deleteConfirm && (
          <div className="delete-modal">
            <div>
              <p>Are you sure you want to delete this staff?</p>
              <button onClick={()=>handleDelete(deleteConfirm)}>Yes</button>
              <button onClick={()=>setDeleteConfirm(null)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Register Form */}
        {showRegisterForm && <StaffRegistrationForm onClose={()=>setShowRegisterForm(false)} onRegister={handleRegister} />}
      </div>
    </div>
  );
}


// Staff Registration Form
function StaffRegistrationForm({ onClose, onRegister }) {
  const [formData, setFormData] = useState({ name:'', phone:'', password:'', residential_id:null });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [idPreview, setIdPreview] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState('');

  const validatePassword = (password) => {
    if(password.length<6) return 'too-short';
    if(!/[A-Z]/.test(password)) return 'no-upper';
    if(!/[a-z]/.test(password)) return 'no-lower';
    if(!/\d/.test(password)) return 'no-number';
    return 'strong';
  };

  const handlePasswordChange = (password) => {
    setFormData(prev=>({...prev,password}));
    const strength = validatePassword(password);
    switch(strength){
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
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setIdPreview(event.target.result);
      setFormData(prev=>({...prev,residential_id:file}));
    };
    reader.readAsDataURL(file);
  };

  const removeId = () => { setIdPreview(null); setFormData(prev=>({...prev,residential_id:null})); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if(!formData.name) newErrors.fullName='Full name required';
    if(!formData.phone) newErrors.phoneNumber='Phone number required';
    if(!formData.password) newErrors.password='Password required';
    if(!formData.residential_id) newErrors.idImage='ID image required';
    if(Object.keys(newErrors).length>0){ setErrors(newErrors); return; }
    setLoading(true);
    const result = await onRegister(formData);
    setLoading(false);
    if(!result.success) setErrors({submit:result.message});
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
          <div className='form-row'>
             <div className="form-group">
              <label>Full Name *</label>
              <input type="text" value={formData.name} onChange={e=>setFormData(prev=>({...prev,name:e.target.value}))} className={errors.name ? 'error' : ''} placeholder="Enter full name" />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

              <div className="form-group">
                <label>Phone Number *</label>
                <input type="text" value={formData.phone} onChange={e=>setFormData(prev=>({...prev,phone:e.target.value}))} className={errors.phone?'error':''} placeholder="+251900000000" />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>
          </div>
         
         <div className='form-row'>
            <div className="form-group">
              <label>Password *</label>
              <input type="password" value={formData.password} onChange={e=>handlePasswordChange(e.target.value)} className={errors.password?'error':''} placeholder="At least 6 characters" />
              {passwordStrength && <span className={`password-strength ${passwordStrength==='Strong password'?'strong':'weak'}`}>{passwordStrength}</span>}
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>
         </div>
         

              <div className="form-group">
                <label>Staff's ID *</label>
                <div className="id-upload-area">
                  {idPreview ? (
                    <div className="id-preview-container">
                      <img src={idPreview} alt="ID preview" className="id-preview-large" />
                      <button type="button" onClick={removeId} className="remove-id-button">
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="id-upload-placeholder">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleIdUpload}
                        className="id-input-hidden"
                        id="id-upload"
                      />
                    
                    </div>
                  )}
                  {errors.residential_id && <span className="error-text">{errors.residential_id}</span>}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={onClose} className="cancel-button">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="submit-button">
                  {loading ? 'Registering...' : 'Register Staff'}
                </button>
              </div>
        </form>
      </div>
    </div>
  );
}
