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
export const getDrivers = async (token, page = 1, limit = 6) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockDrivers = generateMockDrivers();
    const startIndex = (page - 1) * limit;
    const paginatedDrivers = mockDrivers.slice(startIndex, startIndex + limit);
    
    return {
      success: true,
      data: {
        drivers: paginatedDrivers,
        totalCount: mockDrivers.length
      }
    };
  } catch (error) {
    return { success: false, message: 'Failed to fetch drivers' };
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





// Staff API functions
const generateMockStaff = () => {
  return Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    fullName: `Staff ${i + 1}`,
    phoneNumber: `+2519${String(90000000 + i).padStart(8, '0')}`,
    registrationDate: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString(),
    idImage: `https://example.com/id-images/staff-${i + 1}.jpg`,
    isActive: Math.random() > 0.2
  }));
};

// Get staff with pagination
export const getStaff = async (token, page = 1, limit = 6) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockStaff = generateMockStaff();
    const startIndex = (page - 1) * limit;
    const paginatedStaff = mockStaff.slice(startIndex, startIndex + limit);
    
    return {
      success: true,
      data: {
        staff: paginatedStaff,
        totalCount: mockStaff.length
      }
    };
  } catch (error) {
    return { success: false, message: 'Failed to fetch staff' };
  }
};

// Search staff
export const searchStaff = async (token, searchTerm) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const mockStaff = generateMockStaff();
    const filteredStaff = mockStaff.filter(staff => {
      const searchLower = searchTerm.toLowerCase();
      const nameMatch = staff.fullName.toLowerCase().includes(searchLower);
      const phoneMatch = staff.phoneNumber.includes(searchTerm);
      return nameMatch || phoneMatch;
    });
    
    return {
      success: true,
      data: filteredStaff
    };
  } catch (error) {
    return { success: false, message: 'Failed to search staff' };
  }
};

// Get staff by date range
export const getStaffByDate = async (token, startDate, endDate) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const mockStaff = generateMockStaff();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const filteredStaff = mockStaff.filter(staff => {
      const regDate = new Date(staff.registrationDate);
      return regDate >= start && regDate <= end;
    });
    
    return {
      success: true,
      data: filteredStaff
    };
  } catch (error) {
    return { success: false, message: 'Failed to filter staff by date' };
  }
};

// Update staff
export const updateStaff = async (token, staffId, staffData) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log('Updating staff:', staffId, staffData);
    return { success: true, message: 'Staff updated successfully' };
  } catch (error) {
    return { success: false, message: 'Failed to update staff' };
  }
};

// Delete staff
export const deleteStaff = async (token, staffId, phoneNumber) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log('Deleting staff:', staffId, 'Phone:', phoneNumber);
    return { success: true, message: 'Staff deleted successfully' };
  } catch (error) {
    return { success: false, message: 'Failed to delete staff' };
  }
};

// Register new staff
export const registerStaff = async (token, staffData) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Validate password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(staffData.password)) {
      return { 
        success: false, 
        message: 'Password must be at least 6 characters with 1 uppercase, 1 lowercase, and 1 number' 
      };
    }
    
    console.log('Registering new staff:', staffData);
    return { success: true, message: 'Staff registered successfully' };
  } catch (error) {
    return { success: false, message: 'Failed to register staff' };
  }
};
