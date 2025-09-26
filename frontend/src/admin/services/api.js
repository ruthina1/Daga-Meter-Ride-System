// login
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});
// Add token automatically if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken"); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const login = async (credentials) => {
  try {
    const res = await api.post("/admin/login", credentials);

    const data = res.data; // axios auto-parses JSON

    return {
      success: true,
      token: data.token,
      user: data.admin,
    };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message,
    };
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
    const response = await api.get(`/admin/usermanagement?page=${page}`);
    return response.data; // { users, totalUsers }
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch users");
  }
};

// Search user by phone
export const searchUsers = async (phone) => {
  try {
    const response = await api.get(`/admin/searchUser?phone=${encodeURIComponent(phone)}`);
    return response.data; // { success, user }
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Search failed" };
  }
};

// Edit user (update name)
export const updateUser = async (phone, name, page = 1) => {
  try {
    const response = await api.put(`/usermanagement/edit?page=${page}`, { phone, name });
    return response.data; // { success, users }
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Failed to edit user" };
  }
};

// Delete user
export const deleteUser = async (phone, page = 1) => {
  try {
    const response = await api.delete(`/usermanagement/${phone}?page=${page}`);
    return response.data; // { success, users }
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Failed to delete user" };
  }
};

// Register new user
export const registerUser = async (userData) => {
  try {
    const response = await api.post("/admin/usermanagement/register", userData);
    return response.data; // { success, user }
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Failed to register user" };
  }
};

// Download users (Excel/PDF)
export const downloadUsers = async () => {
  try {
    const response = await api.get("/usermanagement/download", { responseType: "blob" });
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
export const getUsersByDate = async (startDate, endDate) => {
  try {
    const response = await api.get(`/report/userReport?startDate=${startDate}&endDate=${endDate}`);
    return response.data; // { success, data }
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch users by date");
  }
};
// ==================  DRIVER MANAGEMENT ==================
// Get drivers with pagination
export const getDrivers = async (page = 1) => {
  try {
    const res = await api.get(`/admin/driverManagement?page=${page}`); // ✅ include /admin if mounted under /api/admin
    return {
      success: true,
      data: {
        drivers: res.data.drivers,
        totalCount: res.data.totalDrivers,
      },
    };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Failed to fetch drivers" };
  }
};

// Search driver by phone

// frontend api.js
export const searchDrivers = async (phone) => {
  try {
    const res = await api.get(`/admin/searchDriver?phone=${encodeURIComponent(phone)}`);
    return res.data; // { success, driver }
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Search failed" };
  }
};


// Update driver info
export const updateDriver = async (name, phone, plate_no, page = 1) => {
  try {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("phone", phone);
    formData.append("plate_no", plate_no);
    const res = await api.put(`/admin/editDriver?page=${page}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
    return res.data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Update failed" };
  }
};

// Delete driver
export const deleteDriver = async (phone, page = 1) => {
  try {
    const res = await api.delete(`/admin/driverManagement/${phone}?page=${page}`); // ✅ include /admin
    return res.data; // { success, drivers }
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Delete failed" };
  }
};

// Register a new driver

export const registerDriver = async (formData) => {
  try {
    console.log("Sending registration request to /admin/addDriver");
    
    const res = await api.post("/admin/addDriver", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log("Registration response:", res.data);
    return res.data;

  } catch (error) {
    console.error("Registration error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    return {
      success: false,
      message: error.response?.data?.message || error.response?.data || "Registration failed. Check console for details.",
    };
  }
};
// Get drivers by date
export const getDriversByDate = async (startDate, endDate) => {
  try {
    const response = await api.get(`/report/driverReport?startDate=${startDate}&endDate=${endDate}`);
    return response.data; // { success, data }
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch users by date");
  }
};



// ================== STAFF MANAGEMENT ==================


// Get paginated staff
export const getStaff = async (page = 1) => {
  try {
    const res = await api.get(`/admin/staffManagement?page=${page}`);
    return {
      success: true,
      data: {
        staff: res.data.staff,
        totalCount: res.data.totalStaff,
      },
    };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || "Failed to fetch staff" };
  }
};

// Search staff by phone
export const searchStaff = async (phone) => {
  try {
    const res = await api.get(`/admin/searchStaff?phone=${encodeURIComponent(phone)}`);
    return res.data; // { success, driver }
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Search failed" };
  }
};


// Update staff
export const updateStaff = async (staffPhone, updateData, page = 1) => {
  try {
    const res = await api.put(`/staffManagement/edit?page=${page}`, {
      name: updateData.fullName,
      phone: staffPhone,
    });
    return res.data; // { success, staff }
  } catch (err) {
    return { success: false, message: err.response?.data?.message || "Update failed" };
  }
};

// Delete staff
export const deleteStaff = async (staffPhone, page = 1) => {
  try {
    const res = await api.delete(`/staffManagement/${staffPhone}?page=${page}`);
    return res.data; // { success, staff }
  } catch (err) {
    return { success: false, message: err.response?.data?.message || "Delete failed" };
  }
};

// Register new staff
export const registerStaff = async (formData) => {
  try {
    console.log("Sending registration request to /admin/addStaff");
    
    const res = await api.post("/admin/addStaff", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log("Registration response:", res.data);
    return res.data;

  } catch (error) {
    console.error("Registration error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    return {
      success: false,
      message: error.response?.data?.message || error.response?.data || "Registration failed. Check console for details.",
    };
  }
};

// Get staff by date range

export const getStaffByDate = async (startDate, endDate) => {
  try {
    const response = await api.get(`/report/staffReport?startDate=${startDate}&endDate=${endDate}`);
    return response.data; // { success, data }
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch users by date");
  }
};

// Download staff (Excel/PDF)
export const getStaffReport = async () => {
  try {
    const res = await api.get("/staffManagement/download", { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "staff.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();

    return { success: true };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || "Failed to download staff." };
  }
};






// ================== TRIP MANAGEMENT ==================

// Get paginated trips
export const getTrips = async (page = 1) => {
  try {
    const res = await api.get(`/admin/rideManagement?page=${page}`);
    return {
      success: true,
      data: {
        trips: res.data.ride,
        totalRide: res.data.totalRide,
      },
    };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || "Failed to fetch staff" };
  }
};

// Search trips by phone
export const searchTrips = async (phone) => {
  try {
    const res = await api.get(`/admin/searchRide?phone=${encodeURIComponent(phone)}`);
    return res.data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Search failed" };
  }
};


// Get trip report by date range
export const getTripsByDate = async (startDate, endDate) => {
  try {
    const response = await api.get(`/report/tripReport?startDate=${startDate}&endDate=${endDate}`);
    return response.data; // { success, data }
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch users by date");
  }
};







// car management here
// Get paginated cars
export const getCars = async (page = 1, limit = 6) => {
  try {
    const res = await api.get(`/admin/carManagement?page=${page}&limit=${limit}`);
    return res.data.success
      ? {
          success: true,
          data: {
            cars: res.data.cars,
            totalCount: res.data.totalCars,
            pageCount: res.data.pageCount,
          },
        }
      : { success: false, message: "Failed to fetch cars" };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

// Search car by plate_no
export const searchCar = async (plate_no) => {
  try {
    const res = await api.get(`/admin/searchCar?plate_no=${encodeURIComponent(plate_no)}`);
    return res.data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Search failed" };
  }
};

// Update car
export const updateCar = async (carId, editData) => {
  try {
    const { carName, carType } = editData;
    const res = await api.patch(`/editCar`, { model: carName, car_type: carType, plate_no: carId });
    return res.data.success ? { success: true, data: res.data.cars } : { success: false, message: "Failed to update car" };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

// Delete car
export const deleteCar = async (carId) => {
  try {
    const res = await api.delete(`/deleteCar`, { data: { plate_no: carId } });
    return res.data.success ? { success: true } : { success: false, message: res.data.message };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

// Register car
export const registerCar = async (formData) => {
  try {
    console.log("Sending registration request to /admin/addCar");
    
    const res = await api.post("/admin/addCar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log("Registration response:", res.data);
    return res.data;

  } catch (error) {
    console.error("Registration error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    return {
      success: false,
      message: error.response?.data?.message || error.response?.data || "Registration failed. Check console for details.",
    };
  }
};



// Get trip report by date range
export const getCarsByDate = async (startDate, endDate) => {
  try {
    const response = await api.get(`/report/carReport?startDate=${startDate}&endDate=${endDate}`);
    return response.data; // { success, data }
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch users by date");
  }
};


