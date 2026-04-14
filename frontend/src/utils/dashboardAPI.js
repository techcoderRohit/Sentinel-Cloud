import API from "./api";

// ========================
// DASHBOARD DATA ROUTING
// Centralized API calls for all dashboard-related data
// ========================

// --------- STATS / OVERVIEW ---------

// Fetch dashboard stats (Total Devices, Data Points, Active Devices)
export const getDashboardStats = async () => {
  const response = await API.get("/iot/dashboard-stats");
  return response.data;
};

// --------- DEVICE MONITORING ---------

// Fetch all devices with their latest sensor data (for Live Streaming table)
export const getMonitorAll = async () => {
  const response = await API.get("/iot/monitor-all");
  return response.data;
};

// Fetch latest sensor data for a specific device/apiKey
export const getLatestSensorData = async (apiKeyId) => {
  const response = await API.get(`/iot/latest/${apiKeyId}`);
  return response.data;
};

// Fetch sensor data history for charts (last 50 records)
export const getSensorHistory = async (apiKeyId) => {
  const response = await API.get(`/iot/history/${apiKeyId}`);
  return response.data;
};

// Fetch usage stats for a specific API Key
export const getKeyStats = async (keyId) => {
  const response = await API.get(`/iot/stats/${keyId}`);
  return response.data;
};

// --------- DASHBOARD LAYOUT (Widget Save/Load) ---------

// Save widget layout to DB
export const saveDashboardLayout = async (widgets) => {
  const response = await API.post("/dashboard/save-layout", { widgets });
  return response.data;
};

// Load saved widget layout from DB
export const getDashboardLayout = async () => {
  const response = await API.get("/dashboard/get-layout");
  return response.data;
};

// --------- API KEY MANAGEMENT ---------

// Fetch all API Keys for the logged-in user
export const getApiKeys = async () => {
  const response = await API.get("/apikeys");
  return response.data;
};

// Generate a new API Key
export const createApiKey = async (name) => {
  const response = await API.post("/apikeys/generate", { name });
  return response.data;
};

// Delete an API Key
export const deleteApiKey = async (keyId) => {
  const response = await API.delete(`/apikeys/${keyId}`);
  return response.data;
};



// --------- DEVICE CRUD ---------

// Fetch all devices for the logged-in user
export const getDevices = async () => {
  const response = await API.get("/devices");
  return response.data;
};

// Add a new device
export const addDevice = async (deviceData) => {
  const response = await API.post("/devices", deviceData);
  return response.data;
};

// Delete a device
export const deleteDevice = async (deviceId) => {
  const response = await API.delete(`/devices/${deviceId}`);
  return response.data;
};
