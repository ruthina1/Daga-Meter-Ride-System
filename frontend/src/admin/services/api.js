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

// ================== USER MANAGEMENT ==================

// Get paginated users
export const getUsers = async (page = 1) => {
  try {
    const response = await api.get(`/users?page=${page}`);
    return response.data; // { users, totalUsers }
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch users");
  }
};

// Search user by phone
export const searchUsers = async (phone) => {
  try {
    const response = await api.post("/users/search", { phone });
    return response.data; // { success, user }
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Search failed" };
  }
};

// Edit user (update name)
export const updateUser = async (phone, name, page = 1) => {
  try {
    const response = await api.put(`/users/edit?page=${page}`, { phone, name });
    return response.data; // { success, users }
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Failed to edit user" };
  }
};

// Delete user
export const deleteUser = async (phone, page = 1) => {
  try {
    const response = await api.delete(`/users/${phone}?page=${page}`);
    return response.data; // { success, users }
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Failed to delete user" };
  }
};

// Register new user
export const registerUser = async (userData) => {
  try {
    const response = await api.post("/users/register", userData);
    return response.data; // { success, user }
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Failed to register user" };
  }
};

// Download users (Excel/PDF)
export const downloadUsers = async () => {
  try {
    const response = await api.get("/users/download", { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "users.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();

    return { success: true };
  } catch (error) {
    console.error("Download failed:", error);
    return { success: false, message: "Failed to download users." };
  }
};

// Get users by date range
export const getUsersByDate = async (startDate, endDate, page = 1) => {
  try {
    const response = await api.get(`/users/by-date?start=${startDate}&end=${endDate}&page=${page}`);
    return { success: true, data: response.data.users };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Failed to fetch users by date" };
  }
};

// ==================  DRIVER MANAGEMENT ==================

// Get drivers with pagination
export const getDrivers = async (page = 1) => {
  try {
    const res = await api.get(`/drivers?page=${page}`);
    return res.data; // { success, drivers, totalDrivers }
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Failed to fetch drivers" };
  }
};

// Search driver by phone
export const searchDrivers = async (phone, page = 1) => {
  try {
    const res = await api.post(`/drivers/search?page=${page}`, { phone });
    return res.data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Search failed" };
  }
};


// Update driver info
export const updateDriver = async (fullName, phoneNumber, plateNumber, license, page = 1) => {
  try {
    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('phoneNumber', phoneNumber);
    formData.append('plateNumber', plateNumber);
    if (license instanceof File) formData.append('license', license);

    const res = await api.put(`/drivers?page=${page}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data; // { success, drivers }
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || "Update failed" 
    };
  }
};



// Delete driver
export const deleteDriver = async (phone, page = 1) => {
  try {
    const res = await api.delete(`/drivers/${phone}?page=${page}`);
    return res.data; // { success, drivers }
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Delete failed" };
  }
};

// 🚖 Register a new driver
export const registerDriver = async (fullName, phoneNumber, plateNumber, license) => {
  try {
    const res = await api.post("/drivers", {
      fullName,
      phoneNumber,
      plateNumber,
      license,
    });
    return res.data; // { success, driver }
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || "Registration failed" 
    };
  }
};

export const getDriversByDate = async (startDate, endDate) => {
  try {
    const res = await api.get(`/drivers/by-date?start=${startDate}&end=${endDate}`);
    return res.data; // { success, drivers }
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || "Failed to fetch drivers by date" 
    };
  }
};


// here is the staff

const API_URL = "http://localhost:5000/api";

// Get staff (paginated)
export const getStaff = async (token, page = 1, limit = 6) => {
  try {
    const res = await fetch(`${API_URL}/staffManagement?page=${page}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    if (!res.ok) return { success: false, message: data.message };

    return {
      success: true,
      data: {
        staff: data.staff,
        totalCount: data.totalStaff,
      },
    };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

// Search staff (by phone)
export const searchStaff = async (token, phone) => {
  try {
    const res = await fetch(`${API_URL}/searchStaff`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, message: data.message };

    return { success: true, data };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

// Update staff
export const updateStaff = async (token, staffPhone, updateData) => {
  try {
    const res = await fetch(`${API_URL}/editStaff?page=1`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: updateData.fullName,
        phone: staffPhone,
      }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, message: data.message };

    return data;
  } catch (err) {
    return { success: false, message: err.message };
  }
};

// Delete staff
export const deleteStaff = async (token, staffPhone) => {
  try {
    const res = await fetch(`${API_URL}/deleteStaff`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone: staffPhone }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, message: data.message };

    return data;
  } catch (err) {
    return { success: false, message: err.message };
  }
};

// Register new staff
export const registerStaff = async (token, staffData) => {
  try {
    const formData = new FormData();
    formData.append("name", staffData.fullName);
    formData.append("phone", staffData.phoneNumber);
    formData.append("password", staffData.password);
    if (staffData.idImage) formData.append("residential_id", staffData.idImage);

    const res = await fetch(`${API_URL}/addStaff`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) return { success: false, message: data.message };

    return data;
  } catch (err) {
    return { success: false, message: err.message };
  }
};

// Get staff by date (stub - backend not implemented)
export const getStaffByDate = async (token, startDate, endDate) => {
  try {
    // You don’t have backend support, so just return empty array
    return { success: true, data: [] };
  } catch (err) {
    return { success: false, message: err.message };
  }
};


export const getStaffReport = async (startDate, endDate) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`/api/staffReport?startDate=${startDate}&endDate=${endDate}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
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

// earning here
export const getEarnings = async (range = "7days") => {
  try {
    const res = await api.get(`/admin/earnings?range=${range}`);
    
    return res.data; 
  } catch (err) {
    return { success: false, message: err.response?.data?.message || "Failed to fetch earnings" };
  }
};
