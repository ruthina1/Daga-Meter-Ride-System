// login
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

// Add token automatically if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken"); // use same key as AdminDashboard
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const login = async (credentials) => {
  try {
    const response = await api.post("/admin/login", credentials);

    return {
      success: true,
      token: response.data.token,
      user: response.data.admin, // backend sends dashboard data along with admin info
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Server error. Please try again.",
    };
  }
};






























// Also update the signIn function to return the same consistent structure
export const signIn = async (credentials) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (credentials.username === 'admin' && credentials.password === 'password') {
      return {
        success: true,
        data: {
          token: 'mock-jwt-token',
          user: { name: 'Admin User' },
          dashboardData: {
            totals: {
              earning: 589909,    // Same values as getDashboardData
              passenger: 89900,   // Same values as getDashboardData
              driver: 500,        // Same values as getDashboardData
              cars: 120           // Same values as getDashboardData
            },
            earningsData: {
              labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              data: [1200, 1900, 1500, 2100, 1800, 2500, 2200]
            },
            summary: {
              passengers: 3740,   // Same values as getDashboardData
              drivers: 1680       // Same values as getDashboardData
            }
          }
        }
      };
    } else {
      return {
        success: false,
        message: 'Invalid username or password'
      };
    }
  } catch (error) {
    return {
      success: false,
      message: 'Network error. Please try again.'
    };
  }
};



// get all users for user management
// src/services/api.js
export const getUsers = async (page = 1) => {
  try {
    const token = localStorage.getItem("authToken");
    const response = await axios.get(`http://localhost:5000/api/userManagement?page=${page}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data; // { users: [...] }
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch users");
  }
};

export const searchUsers = async (searchTerm) => {
  try {
    const token = localStorage.getItem("authToken");
    const response = await axios.get(`http://localhost:5000/api/userManagement?search=${searchTerm}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data; // { users: [...] }
  } catch (error) {
    throw new Error(error.response?.data?.message || "Search failed");
  }
};


// Add token automatically if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken"); // same key as login
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Existing functions like login, getUsers, etc.

// Fetch users by date range
export const getUsersByDate = async (startDate, endDate) => {
  try {
    const token = localStorage.getItem("authToken");
    const response = await api.get(`/userManagement?start=${startDate}&end=${endDate}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { success: true, data: response.data.users };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Failed to fetch users by date." };
  }
};

// Download users
export const downloadUsers = async () => {
  try {
    const token = localStorage.getItem("authToken");
    const response = await api.get("/userManagement/download", {
      responseType: "blob",
      headers: { Authorization: `Bearer ${token}` }
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "users.xlsx"); // or .csv depending on backend
    document.body.appendChild(link);
    link.click();
    link.remove();

    return { success: true };
  } catch (error) {
    console.error("Download failed:", error);
    return { success: false, message: "Failed to download users." };
  }
};







// Update user
export const updateUser = async (token, userId, userData) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock implementation
    console.log('Updating user:', userId, userData);
    
    return { success: true, message: 'User updated successfully' };

    /* Actual API implementation:
    const response = await fetch(`http://your-backend/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    return await response.json();
    */
  } catch (error) {
    return { success: false, message: 'Failed to update user' };
  }
};

// Delete user
export const deleteUser = async (token, userId, phoneNumber) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock implementation
    console.log('Deleting user:', userId, 'Phone:', phoneNumber);
    
    return { success: true, message: 'User deleted successfully' };

    /* Actual API implementation:
    const response = await fetch(`http://your-backend/api/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phoneNumber })
    });
    return await response.json();
    */
  } catch (error) {
    return { success: false, message: 'Failed to delete user' };
  }
};

// Search users
// Update the searchUsers function in your api.js



// Generate consistent mock data for drivers
const generateMockDrivers = () => {
  return Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    fullName: `Driver ${i + 1}`,
    phoneNumber: `+2519${String(90000000 + i).padStart(8, '0')}`,
    plateNumber: `AA${String(i + 1).padStart(3, '0')}BB`,
    registrationDate: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString(),
    license: `https://example.com/licenses/license-${i + 1}.jpg`,
    isActive: Math.random() > 0.3
  }));
};

// Get drivers with pagination





// src/services/api.js

// here is accepting drivers table
export const getDrivers = async (page = 1, limit = 10) => {
  try {
    const token = localStorage.getItem("authToken");
    const response = await api.get(`/driverManagement?page=${page}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Failed to fetch drivers." };
  }
};



// Search drivers
export const searchDrivers = async (token, searchTerm) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const mockDrivers = generateMockDrivers();
    
    const filteredDrivers = mockDrivers.filter(driver => {
      const searchLower = searchTerm.toLowerCase();
      const nameMatch = driver.fullName.toLowerCase().includes(searchLower);
      const phoneMatch = driver.phoneNumber.includes(searchTerm);
      const plateMatch = driver.plateNumber.toLowerCase().includes(searchLower);
      
      return nameMatch || phoneMatch || plateMatch;
    });
    
    return {
      success: true,
      data: filteredDrivers
    };
  } catch (error) {
    return { success: false, message: 'Failed to search drivers' };
  }
};

// Get drivers by date range
export const getDriversByDate = async (token, startDate, endDate) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const mockDrivers = generateMockDrivers();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const filteredDrivers = mockDrivers.filter(driver => {
      const regDate = new Date(driver.registrationDate);
      return regDate >= start && regDate <= end;
    });
    
    return {
      success: true,
      data: filteredDrivers
    };
  } catch (error) {
    return { success: false, message: 'Failed to filter drivers by date' };
  }
};

// Update driver
export const updateDriver = async (token, driverId, driverData) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log('Updating driver:', driverId, driverData);
    return { success: true, message: 'Driver updated successfully' };
  } catch (error) {
    return { success: false, message: 'Failed to update driver' };
  }
};

// Delete driver
export const deleteDriver = async (token, driverId, phoneNumber) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log('Deleting driver:', driverId, 'Phone:', phoneNumber);
    return { success: true, message: 'Driver deleted successfully' };
  } catch (error) {
    return { success: false, message: 'Failed to delete driver' };
  }
};

// Register new driver
export const registerDriver = async (token, driverData) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Validate password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(driverData.password)) {
      return { 
        success: false, 
        message: 'Password must be at least 6 characters with 1 uppercase, 1 lowercase, and 1 number' 
      };
    }
    
    console.log('Registering new driver:', driverData);
    return { success: true, message: 'Driver registered successfully' };
  } catch (error) {
    return { success: false, message: 'Failed to register driver' };
  }
};



;



// here is the staff

const API_URL = "http://localhost:5000/api"; // <-- add this line

export const getStaff = async (token, page = 1, limit = 6) => {
  try {
    const res = await fetch(`${API_URL}/staffManagement?page=${page}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    // normalize response so front-end always receives totalStaff
    if (page === 1) {
      return {
        success: true,
        data: {
          staff: data.staff,
          totalCount: data.totalStaff,
        },
      };
    } else {
      return {
        success: true,
        data: {
          staff: data.staff,
          totalCount: null, // totalCount is already known from first page
        },
      };
    }
  } catch (err) {
    console.error(err);
    return { success: false, message: err.message };
  }
};

// Search staff by name or phone
export const searchStaff = async (token, query) => {
  try {
    const res = await fetch(`${API_URL}/staffManagement/search?q=${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

// Get staff by registration date range
export const getStaffByDate = async (token, startDate, endDate) => {
  try {
    const res = await fetch(`${API_URL}/staffManagement?start=${startDate}&end=${endDate}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

// Update staff
export const updateStaff = async (token, staffId, updateData) => {
  try {
    const formData = new FormData();
    for (let key in updateData) formData.append(key, updateData[key]);
    const res = await fetch(`${API_URL}/staffManagement/${staffId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    const data = await res.json();
    return data;
  } catch (err) {
    return { success: false, message: err.message };
  }
};

// Delete staff
export const deleteStaff = async (token, staffId) => {
  try {
    const res = await fetch(`${API_URL}/staffManagement/${staffId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return data;
  } catch (err) {
    return { success: false, message: err.message };
  }
};

// Register new staff
export const registerStaff = async (token, staffData) => {
  try {
    const formData = new FormData();
    for (let key in staffData) formData.append(key, staffData[key]);
    const res = await fetch(`${API_URL}/staffManagement`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    return data;
  } catch (err) {
    return { success: false, message: err.message };
  }
};




// Trip management here
export const getTrips = async (page = 1) => {
  try {
    const response = await fetch(`/api/rideManagement?page=${page}`, {
      headers: {
        'Content-Type': 'application/json',
        // Include auth token if needed
        // 'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });
    const data = await response.json();
    // Backend returns { ride, totalRide } on page 1, else { ride }
    return {
      trips: data.ride || [],
      totalCount: data.totalRide || (data.ride ? data.ride.length : 0)
    };
  } catch (error) {
    console.error("Error fetching trips:", error);
    return { trips: [], totalCount: 0 };
  }
};

// Search trips (make sure backend has a /rideManagement/search endpoint)
export const searchTrips = async (query) => {
  try {
    const response = await fetch(`/api/rideManagement/search?q=${query}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    return { trips: data.ride || [] };
  } catch (error) {
    console.error("Error searching trips:", error);
    return { trips: [] };
  }
};

// Filter trips by date (assuming backend supports start & end query)
export const getTripsByDate = async (start, end) => {
  try {
    const response = await fetch(`/api/rideManagement?start=${start}&end=${end}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    return { trips: data.ride || [] };
  } catch (error) {
    console.error("Error fetching trips by date:", error);
    return { trips: [] };
  }
};

// Download trips (backend should return CSV/Excel)
export const downloadTrips = async () => {
  try {
    const response = await fetch('/api/rideManagement/download', {
      headers: { 'Content-Type': 'application/json' },
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trips.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (error) {
    console.error("Error downloading trips:", error);
  }
};
