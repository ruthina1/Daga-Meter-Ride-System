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
  FaEdit, FaTrash, FaSave, FaTimes, FaSearch, FaArrowLeft, FaArrowRight, FaPlus, FaDownload 
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
    const result = await getCars(token, currentPage, carsPerPage);
    if (result.success) {
      setCars(result.data.cars || result.data);
      setTotalCars(result.data.totalCount || result.data.length);
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
    const result = await searchCar(token, searchTerm);
    if (result.success) setCars(result.data);
    setLoading(false);
  };

  const handleEdit = (car) => {
    setEditingId(car.plate_no);
    setEditData({
      carName: car.carName,
      price: car.price,
      carType: car.carType,
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

  const handleRegister = async (formData) => {
    const result = await registerCar(token, formData);
    if (result.success) {
      setShowRegisterForm(false);
      fetchCars();
    }
    return result;
  };

  const totalPages = Math.ceil(totalCars / carsPerPage);

  if (loading) return <div className="loading-container">Loading car data...</div>;

  const handleDownloadReport = async () => {
    if (!startDate || !endDate) {
      alert("Please select a valid date range.");
      return;
    }

    try {
      const result = await getCarsByDate(startDate, endDate);
      if (!result.success || !result.data || result.data.length === 0) {
        alert("No car data available for the selected date range.");
        return;
      }

      const reportCars = result.data;
      const printWindow = window.open('', '_blank');
      const dateRangeText = `${startDate} to ${endDate}`;
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Car Management Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
              .header { text-align: center; margin-bottom: 20px; }
              .header h1 { font-size: 24px; margin-bottom: 5px; color: #2c3e50; }
              .filters { margin-bottom: 15px; font-size: 14px; color: #666; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 13px; }
              th { background-color: #f8f9fa; font-weight: bold; color: #333; }
              tr:nth-child(even) { background-color: #f9f9f9; }
              .footer { margin-top: 20px; font-size: 12px; color: #777; text-align: center; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Car Management Report</h1>
              <div class="filters">
                <div>Date Range: ${dateRangeText}</div>
                <div>Generated on: ${new Date().toLocaleString()}</div>
                <div>Total Cars: ${reportCars.length}</div>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Car Name</th>
                  <th>Price</th>
                  <th>Car Type</th>
                  <th>Registration Date</th>
                </tr>
              </thead>
              <tbody>
                ${reportCars.map(car => `
                  <tr>
                    <td>${car.carName}</td>
                    <td>${car.price}</td>
                    <td>${car.carType}</td>
                    <td>${new Date(car.registrationDate).toLocaleDateString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="footer">Report generated by Daga Meter Ride System</div>
          </body>
        </html>
      `;
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.onload = () => printWindow.print();
    } catch (error) {
      console.error("Error generating car report:", error);
      alert("Failed to generate car report. Please try again.");
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
                <button onClick={() => setSearchTerm('')} className="clear-input-button">×</button>
              )}
            </div>
            <button onClick={handleSearch} className="search-button"><FaSearch /> Search</button>
          </div>
        </div>

        <div className="filters-container">
          <div className="date-filter-container">
            <div className="date-inputs-row">
              <div className="date-input-group">
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="date-input"/>
              </div>
              <label> to </label>
              <div className="date-input-group">
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="date-input"/>
              </div>
            </div>
          </div>
          <div className="action-buttons-container">
            <button onClick={handleDownloadReport} className="download-button" disabled={!startDate || !endDate || cars.length === 0}>
              <FaDownload /> Download
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
                <th>Car Name</th>
                <th>Price</th>
                <th>Car Type</th>
                <th>Registration Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cars.map(car => (
                 <tr key={car.plate_no}>
                  <td>{editingId === car.plate_no ? <input value={editData.carName || ''} onChange={e => handleInputChange('carName', e.target.value)} /> : car.carName}</td>
                  <td>{editingId === car.plate_no ? <input type="number" value={editData.price || ''} onChange={e => handleInputChange('price', e.target.value)} /> : car.price}</td>
                  <td>{editingId === car.plate_no? <select value={editData.carType || 'Normal'} onChange={e => handleInputChange('carType', e.target.value)}><option value="Normal">Normal</option><option value="VIP">VIP</option></select> : car.carType}</td>
                  <td>{editingId === car.plate_no ? <input type="date" value={editData.registrationDate?.slice(0,10) || ''} onChange={e => handleInputChange('registrationDate', e.target.value)} /> : new Date(car.registrationDate).toLocaleDateString()}</td>
                  <td>
                    {editingId === car.plate_no ? (
                      <>
                        <button onClick={() => handleSave(car.plate_no)}><FaSave /></button>
                        <button onClick={handleCancelEdit}><FaTimes /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(car)}><FaEdit /></button>
                        <button onClick={() => setDeleteConfirm(car.plate_no)}><FaTrash /></button>
                      </>
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
  carName: '',
  price: '',
  carType: 'Normal',
  registrationDate: ''
});

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.carName) newErrors.carName = 'Car name is required';
    if (!formData.price) newErrors.price = 'Price is required';
    if (!formData.plate_no) newErrors.plate_no = 'Plate number is required';


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
            <label>Price *</label>
            <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className={errors.price ? 'error' : ''} />
            {errors.price && <span className="error-text">{errors.price}</span>}
          </div>

          <div className="form-group">
            <label>Car Type *</label>
            <select value={formData.carType} onChange={(e) => setFormData({ ...formData, carType: e.target.value })}>
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

