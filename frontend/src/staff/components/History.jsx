import { useState, useEffect } from "react";
import "../styles/History.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"; 


export default function History() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [totalPages, setTotalPages] = useState(1);

  

  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        setLoading(true);
        
        // Calculate offset based on current page
        const offset = (currentPage - 1) * itemsPerPage;
        
        const response = await fetch(
          `http://localhost:5000/api/ride-history?limit=${itemsPerPage}&offset=${offset}`, 
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
      
        setData(result.data || result);
        setFilteredData(result.data || result);
        
       
        if (result.totalCount) {
          setTotalPages(Math.ceil(result.totalCount / itemsPerPage));
        }
      } catch (err) {
        console.error("Error fetching history data:", err);
        setError("Failed to load history data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistoryData();
  }, [currentPage, itemsPerPage]);


  useEffect(() => {
    const filtered = data.filter((row) => {
      const matchesPhone = row.driverPhoneNumber.includes(search);
      
     
      const rowDate = new Date(row.rideDateTime).toISOString().slice(0, 10);
      let matchesDate = true;
      
      if (startDate && endDate) {
        matchesDate = rowDate >= startDate && rowDate <= endDate;
      } else if (startDate) {
        matchesDate = rowDate >= startDate;
      } else if (endDate) {
        matchesDate = rowDate <= endDate;
      }
      
      return matchesPhone && matchesDate;
    });
    
    setFilteredData(filtered);
  }, [search, startDate, endDate, data]);

  const clearDateFilters = () => {
    setStartDate("");
    setEndDate("");
  };


  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };


  const handleDownload = () => {
    if (filteredData.length === 0) {
      alert("No data available for download based on your filters.");
      return;
    }

    try {
      const printWindow = window.open('', '_blank');
      
      let dateRangeText = "All Dates";
      if (startDate && endDate) {
        dateRangeText = `${formatDateForDisplay(startDate)} to ${formatDateForDisplay(endDate)}`;
      } else if (startDate) {
        dateRangeText = `From ${formatDateForDisplay(startDate)}`;
      } else if (endDate) {
        dateRangeText = `Until ${formatDateForDisplay(endDate)}`;
      }
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Ride History Report</title>
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
                color: #2980b9;
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
              }
              th {
                background-color: #f8f9fa;
                font-weight: bold;
                color: #333;
              }
              tr:nth-child(even) {
                background-color: #f9f9f9;
              }
              .total-row {
                font-weight: bold;
                background-color: #e8f4fc;
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
              <h1>Ride History Report</h1>
              <div class="filters">
                <div>Date Range: ${dateRangeText}</div>
                <div>Generated on: ${new Date().toLocaleString()}</div>
              </div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Passenger Name</th>
                  <th>Driver Name</th>
                  <th>Phone Number</th>
                  <th>Initial Location</th>
                  <th>Destination</th>
                  <th>Ride Date & Time</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                ${filteredData.map(row => `
                  <tr>
                    <td>${row.passengerName}</td>
                    <td>${row.driverName}</td>
                    <td>${row.driverPhoneNumber}</td>
                    <td>${row.initialLocation}</td>
                    <td>${row.destination}</td>
                    <td>${formatDateTimeForPDF(row.rideDateTime)}</td>
                    <td>${row.price.toFixed(2)} ETB</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td colspan="6" style="text-align: right;">Total:</td>
                  <td>${filteredData.reduce((sum, row) => sum + row.price, 0).toFixed(2)} ETB</td>
                </tr>
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
      
      let fileName = "ride_history_report";
      if (startDate && endDate) {
        fileName += `_${startDate}_to_${endDate}`;
      } else if (startDate) {
        fileName += `_from_${startDate}`;
      } else if (endDate) {
        fileName += `_until_${endDate}`;
      }
      
      printWindow.onload = function() {
        try {
          printWindow.print();
        } catch (e) {
          console.error("Print error:", e);
          alert("PDF generation failed. The report has been opened in a new window. You can use your browser's Print function and select 'Save as PDF'.");
        }
      };
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report. Please try again.");
    }
  };


  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return (
      date.toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }) +
      " " +
      date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase()
    );
  };


  const formatDateForDisplay = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };


  const formatDateTimeForPDF = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return (
      date.toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }) +
      " " +
      date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase()
    );
  };

  if (loading) {
    return <div className="loading">Loading history data...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="history-page">
      <div className="history-header">
        <h1>History</h1>
        <div className="controls-container">
          <div className="search-controls">
            <input
              type="search"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            <div className="date-range-container">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="date-input"
                placeholder="From"
              />
              <span className="date-separator">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="date-input"
                placeholder="To"
              />
              {(startDate || endDate) && (
                <button 
                  onClick={clearDateFilters}
                  className="clear-date-btn"
                  title="Clear date filters"
                >
                  ×
                </button>
              )}
            </div>
            <button onClick={handleDownload} className="download-btn">
              Download
            </button>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="history-table">
          <thead>
            <tr>
              <th>Passenger Name</th>
              <th>Driver Name</th>
              <th>Driver's Phone Number</th>
              <th>Initial Location</th>
              <th>Destination</th>
              <th>Ride Date & Time</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((row) => (
                <tr key={row.id}>
                  <td>{row.passengerName}</td>
                  <td>{row.driverName}</td>
                  <td>{row.driverPhoneNumber}</td>
                  <td>{row.initialLocation}</td>
                  <td>{row.destination}</td>
                  <td>{formatDateTime(row.rideDateTime)}</td>
                  <td>{row.price.toFixed(2)} ETB</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-data">
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
  <div className="pagination-controls">
          <button 
            onClick={goToPrevPage} 
            disabled={currentPage === 1}
            className="pagination-btn"
            title="Previous page"
          >
            <FaChevronLeft />
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button 
            onClick={goToNextPage} 
            disabled={currentPage === totalPages}
            className="pagination-btn"
            title="Next page"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
}

