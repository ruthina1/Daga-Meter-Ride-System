import React, { useState, useEffect } from 'react';
import { 
  getCars, 
  updateCar, 
  deleteCar, 
  searchCar,
  registerCar, 
  getCarsByDate
} from '../services/api';
import { 
  FaEdit, FaTrash, FaSave, FaTimes, FaSearch, FaArrowLeft, FaArrowRight, FaPlus, FaDownload ,FaFilter
} from 'react-icons/fa';
import Sidebar from './Sidebar';
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
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    fetchCars();
  }, [currentPage]);

const fetchCars = async () => {
  setLoading(true);
  const result = await getCars(currentPage, carsPerPage); // token handled in api.js
  if (result.success) {
    setCars(result.data.cars || []);
    setTotalCars(result.data.totalCount || 0);
  }
  setLoading(false);
};

 const handleSearch = async () => {
  if (!searchTerm.trim()) {
    setIsSearching(false);
    fetchCars();
    return;
  }
  setLoading(true);
  const result = await searchCar(searchTerm);

  if (result.success && result.car) {   
    setCars(result.car);               
    setIsSearching(true);
    console.log(result.cars);
  } else {
    setCars([]);
    setIsSearching(true);
  }

  setLoading(false);
};


  const handleEdit = (car) => {
    setEditingId(car.plate_no);
    setEditData({
      model: car.model,
      driver_name: car.driver_name,
      car_type: car.car_type,
      registrationDate: car.registrationDate
    });
  };

  const handleSave = async (carId) => {
    const result = await updateCar(token, carId, editData);
    if (result.success) {
      setCars(cars.map(c => c.plate_no === carId ? { ...c, ...editData } : c));
      setEditingId(null);
      setEditData({});
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleDelete = async (carId) => {
    const result = await deleteCar(token, carId);
    if (result.success) {
      setCars(cars.filter(c => c.plate_no !== carId));
      setTotalCars(prev => prev - 1);
      setDeleteConfirm(null);
    }
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };


  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  const handleRegister = async (formData) => {
    const { model, plate_no, car_type } = formData;
    if (!model || !plate_no || !car_type) {
      alert('Please fill all required fields');
      return { success: false, message: 'All fields are required' };
    }
    
    const submitData = new FormData();
    submitData.append("model", model);
    submitData.append("plate_no", plate_no);
    submitData.append("car_type", car_type);
    
    console.log("Submitting car data:", {
      model: model,
      plate_no: plate_no,
      car_type: car_type,
    });
    
    try {
      const result = await registerCar(submitData);
      
      console.log("Registration result:", result);
      
      if (result.success) {
        setShowRegisterForm(false);
        setRegistrationSuccess(true);
        fetchCars();
        
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
  const totalPages = Math.ceil(totalCars / carsPerPage);

  if (loading) return <div className="loading-container">Loading car data...</div>;

 const handleDownload = async () => {
   if (!startDate || !endDate) {
     alert('Please select start and end date.');
     return;
   }
 
   try {
     const res = await getCarsByDate(startDate, endDate);
     if (!res.success || !res.data.length) {
       alert('No drivers available for the selected date range.');
       return;
     }
 
     const carsData = res.data;
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
           <title>Daga Meter Ride - Car Report</title>
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
               <h2 class="report-title">Car Management Report</h2>
             </div>
             
             <!-- Report Metadata -->
             <div class="report-meta">
               <div class="meta-item">
                 <span class="meta-label">Date Range</span>
                 <span class="meta-value">${dateRangeText}</span>
               </div>
               <div class="meta-item">
                 <span class="meta-label">Total Cars</span>
                 <span class="meta-value">${carsData.length.toLocaleString()}</span>
               </div>
               <div class="meta-item">
                 <span class="meta-label">Report Generated</span>
                 <span class="meta-value">${generatedDate}</span>
               </div>
               <div class="meta-item">
                 <span class="meta-label">Report Type</span>
                 <span class="meta-value">Car Analysis Report</span>
               </div>
             </div>
             
             <!-- car Table -->
             <table>
               <thead>
                 <tr>
                   <th>#</th>
                   <th>Car Name</th>
                   <th>Driver Name</th>
                   <th>Plate Number</th>
                   <th>Car Type</th>
                   <th>Registration Date</th>
                 </tr>
               </thead>
               <tbody>
                 ${carsData.map((car, index) => `
                   <tr>
                     <td>${index + 1}</td>
                     <td>${car.model || 'N/A'}</td>
                     <td>${car.driver_name || 'N/A'}</td>
                     <td>${car.plate_no || 'N/A'}</td>
                     <td>${car.car_type || 'N/A'}</td>
                     <td>${car.created_at ? new Date(car.created_at).toLocaleDateString() : 'N/A'}</td>
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
 const handleClearSearch = () => {
  setSearchTerm('');
  setIsSearching(false);
  setCurrentPage(1);
  setStartDate('');
  setEndDate('');
  fetchCars(1); 
};



  const filterCarsByDate = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }
  
    console.log("Filtering with dates:", { startDate, endDate }); // Debug log
  
    setLoading(true);
    try {
      const result = await getCarsByDate(startDate, endDate);
      console.log("API Response:", result); // Debug log
      
      if (result.success && result.data) {
        setCars(result.data || []); 
        setIsSearching(true); 
        setTotalCars(result.data.length || 0); 
        console.log("Filtered drivers:", result.data.length); // Debug log
      } else {
        setCars([]);
        setTotalCars(0);
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
                       <input
                         type="text"
                         placeholder="Search"
                         value={searchTerm}
                         onChange={e => setSearchTerm(e.target.value)}
                         onKeyPress={e => e.key === 'Enter' && handleSearch()}
                         className="search-input"
                       />
                       {searchTerm && (
              <button onClick={handleClearSearch} className="clear-input-button">×</button>
            )}
                       <button onClick={handleSearch} className="search-buttonu"><FaSearch /> Search</button>
                     </div>
          </div>
        </div>
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
                    onClick={filterCarsByDate} 
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
                className="new-car-button"
              >
                <FaPlus /> New Car
              </button>
          </div>

        <div className="cars-table-container">
          <table className="cars-table">
            <thead>
              <tr>
                <th>Car Name</th>
                <th>Driver Name</th>
                <th>Plate Number</th>
                <th>Car Type</th>
                <th>Registration Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cars.map(car => (
                 <tr key={car.plate_no}>
                  <td>{editingId === car.plate_no ? <input value={editData.model || ''} onChange={e => handleInputChange('model', e.target.value)} /> : car.model}</td>
                  <td>{editingId === car.plate_no ? <input type="text" value={editData.driver_name || ''} onChange={e => handleInputChange('driver_name', e.target.value)} /> : car.driver_name}</td>
                  <td>{editingId === car.plate_no ? <input type="text" value={editData.plate_no || ''} onChange={e => handleInputChange('plate_no', e.target.value)} /> : car.plate_no}</td>
                  <td>{editingId === car.plate_no? <select value={editData.car_type || 'Normal'} onChange={e => handleInputChange('car_type', e.target.value)}><option value="Normal">Normal</option><option value="VIP">VIP</option></select> : car.car_type}</td>
                  <td>{editingId === car.plate_no ? <input type="date" value={editData.registrationDate?.slice(0,10) || ''} onChange={e => handleInputChange('registrationDate', e.target.value)} /> : new Date(car.registrationDate).toLocaleDateString()}</td>
                  <td>
                    {editingId === car.plate_no ? (
                      <div className="action-buttons">
                        <button onClick={() => handleSave(car.plate_no)} className="action-button save-button"><FaSave /></button>
                        <button onClick={handleCancelEdit}  className="action-button cancel-button"><FaTimes /></button>
                      </div>
                    ) : (
                      <div className="action-buttons">
                        <button onClick={() => handleEdit(car)} className="action-button edit-button"><FaEdit /></button>
                        <button onClick={() => setDeleteConfirm(car.plate_no)} className="action-button delete-button"><FaTrash /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {cars.length === 0 && <div className="no-cars">{isSearching ? 'No cars found' : 'No cars registered'}</div>}
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
              <p>Are you sure you want to delete this car?</p>
              <button onClick={() => handleDelete(deleteConfirm)}>Yes, Delete</button>
              <button onClick={() => setDeleteConfirm(null)}>Cancel</button>
            </div>
          </div>
        )}

        {showRegisterForm && (
          <CarRegistrationForm onClose={() => setShowRegisterForm(false)} onRegister={handleRegister} />
        )}
      </div>
    </div>
  );
}

// Car Registration Form Component
function CarRegistrationForm({ onClose, onRegister }) {
  const [formData, setFormData] = useState({
  plate_no: '',    
  model: '',
  car_type: 'Normal',
  registrationDate: ''
});

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.model) newErrors.model = 'Car name is required';
    if (!formData.plate_no) newErrors.plate_no = 'Plate Number is required';
    if (!formData.car_type) newErrors.car_type = 'Car Type is required';


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

  return (
    <div className="modal-overlay">
      <div className="modal-content car-registration-modal">
        <div className="modal-header">
          <h2>Register New Car</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        {errors.submit && <div className="error-message">{errors.submit}</div>}

        <form onSubmit={handleSubmit} className="car-registration-form">
          <div className="form-group">
            <label>Car Name *</label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className={errors.model ? 'error' : ''}
            />
            {errors.model && <span className="error-text">{errors.model}</span>}
          </div>
         <div className="form-group">
            <label>Plate Number *</label>
            <input
              type="text"
              value={formData.plate_no}
              onChange={(e) => setFormData({ ...formData, plate_no: e.target.value })}
              className={errors.plate_no ? 'error' : ''}
            />
            {errors.plate_no && <span className="error-text">{errors.plate_no}</span>}
          </div>

          <div className="form-group">
            <label>Car Type *</label>
            <select value={formData.car_type} onChange={(e) => setFormData({ ...formData, car_type: e.target.value })}>
              <option value="Normal">Normal</option>
              <option value="VIP">VIP</option>
            </select>
          </div>

          <div className="form-group">
            <label>Registration Date *</label>
            <input type="date" value={formData.registrationDate} onChange={(e) => setFormData({ ...formData, registrationDate: e.target.value })} className={errors.registrationDate ? 'error' : ''} />
            {errors.registrationDate && <span className="error-text">{errors.registrationDate}</span>}
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">Cancel</button>
            <button type="submit" disabled={loading} className="submit-button">{loading ? 'Registering...' : 'Register Car'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

