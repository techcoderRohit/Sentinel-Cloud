import API from "./api";

// ========================
// ADMIN DASHBOARD API
// Centralized API calls for admin panel
// ========================

// --------- DASHBOARD STATS ---------

export const getAdminStats = async () => {
  const response = await API.get("/admin/stats");
  return response.data;
};

// --------- USER MANAGEMENT ---------

export const getAllUsers = async (params = {}) => {
  const response = await API.get("/admin/users", { params });
  return response.data;
};

export const getUserById = async (id) => {
  const response = await API.get(`/admin/users/${id}`);
  return response.data;
};

export const blockUser = async (id) => {
  const response = await API.put(`/admin/users/${id}/block`);
  return response.data;
};

export const deleteUserAdmin = async (id) => {
  const response = await API.delete(`/admin/users/${id}`);
  return response.data;
};

// --------- DEVICE MANAGEMENT ---------

export const getAllDevicesAdmin = async (params = {}) => {
  const response = await API.get("/admin/devices", { params });
  return response.data;
};

export const deleteDeviceAdmin = async (id) => {
  const response = await API.delete(`/admin/devices/${id}`);
  return response.data;
};

// --------- ACTIVITY & SYSTEM ---------

export const getActivityLog = async () => {
  const response = await API.get("/admin/activity");
  return response.data;
};

export const getSystemHealth = async () => {
  const response = await API.get("/admin/system-health");
  return response.data;
};
