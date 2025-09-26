import axios from 'axios';

const API_BASE = "http://localhost:5000/staff";

// Fetch dashboard stats
export const getDashboardStats = async () => {
  try {
    const response = await axios.get(`${API_BASE}/dashboard`);
    return response.data; // { totalRevenue, activeDrivers, totalPassengers, dailyRevenue }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return { totalRevenue: 0, activeDrivers: 0, totalPassengers: 0, dailyRevenue: 0 };
  }
};

// Fetch recent rides
export const getRecentRides = async () => {
  try {
    const response = await axios.get(`${API_BASE}/recent-rides`);
    // Expected format: [{ passenger, pickup, destination, time, status }, ...]
    return response.data || [];
  } catch (error) {
    console.error("Error fetching recent rides:", error);
    return [];
  }
};

// Create user and get token
export const createUser = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE}/create-user`, userData);
    return response.data; // { success: true, token: "..." }
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, message: "Failed to create user" };
  }
};
