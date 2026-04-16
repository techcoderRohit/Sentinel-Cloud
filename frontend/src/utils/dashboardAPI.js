// import API from "./api";

// // ========================
// // DASHBOARD DATA ROUTING
// // Centralized API calls for all dashboard-related data
// // ========================

// // --------- STATS / OVERVIEW ---------

// // Fetch dashboard stats (Total Devices, Data Points, Active Devices)
// export const getDashboardStats = async () => {
//   const response = await API.get("/iot/dashboard-stats");
//   return response.data;
// };

// // --------- DEVICE MONITORING ---------

// // Fetch all devices with their latest sensor data (for Live Streaming table)
// export const getMonitorAll = async () => {
//   const response = await API.get("/iot/monitor-all");
//   return response.data;
// };

// // Fetch latest sensor data for a specific device/apiKey
// export const getLatestSensorData = async (apiKeyId) => {
//   const response = await API.get(`/iot/latest/${apiKeyId}`);
//   return response.data;
// };

// // Fetch sensor data history for charts (last 50 records)
// export const getSensorHistory = async (apiKeyId) => {
//   const response = await API.get(`/iot/history/${apiKeyId}`);
//   return response.data;
// };

// // Fetch usage stats for a specific API Key
// export const getKeyStats = async (keyId) => {
//   const response = await API.get(`/iot/stats/${keyId}`);
//   return response.data;
// };

// // --------- DASHBOARD LAYOUT (Widget Save/Load) ---------

// // Save widget layout to DB
// export const saveDashboardLayout = async (widgets) => {
//   const response = await API.post("/dashboard/save-layout", { widgets });
//   return response.data;
// };

// // Load saved widget layout from DB
// export const getDashboardLayout = async () => {
//   const response = await API.get("/dashboard/get-layout");
//   return response.data;
// };

// // --------- API KEY MANAGEMENT ---------

// // Fetch all API Keys for the logged-in user
// export const getApiKeys = async () => {
//   const response = await API.get("/apikeys");
//   return response.data;
// };

// // Generate a new API Key
// export const createApiKey = async (name) => {
//   const response = await API.post("/apikeys/generate", { name });
//   return response.data;
// };

// // Delete an API Key
// export const deleteApiKey = async (keyId) => {
//   const response = await API.delete(`/apikeys/${keyId}`);
//   return response.data;
// };



// // --------- DEVICE CRUD ---------

// // Fetch all devices for the logged-in user
// export const getDevices = async () => {
//   const response = await API.get("/devices");
//   return response.data;
// };

// // Add a new device
// export const addDevice = async (deviceData) => {
//   const response = await API.post("/devices", deviceData);
//   return response.data;
// };

// // Delete a device
// export const deleteDevice = async (deviceId) => {
//   const response = await API.delete(`/devices/${deviceId}`);
//   return response.data;
// };


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

// --------- AI ANOMALY DETECTION (AI Lite) ---------

// Trigger AI analysis on a device's sensor data
export const triggerAIAnalysis = async (apiKeyId) => {
  const response = await API.post(`/ai/analyze/${apiKeyId}`);
  return response.data;
};

// Get past AI analysis reports for a device
export const getAIReports = async (apiKeyId) => {
  const response = await API.get(`/ai/reports/${apiKeyId}`);
  return response.data;
};

// Delete an AI analysis report
export const deleteAIReport = async (reportId) => {
  const response = await API.delete(`/ai/reports/${reportId}`);
  return response.data;
};

// --------- NOTIFICATIONS & ALERTS ---------

// Mark a single notification as read
export const markNotificationRead = async (notifId) => {
  const response = await API.put(`/notifications/read/${notifId}`);
  return response.data;
};

// Mark all notifications as read
export const markAllNotificationsRead = async () => {
  const response = await API.put('/notifications/read-all');
  return response.data;
};

// Delete a notification
export const deleteNotification = async (notifId) => {
  const response = await API.delete(`/notifications/${notifId}`);
  return response.data;
};

// Get unread notification count
export const getUnreadCount = async () => {
  const response = await API.get('/notifications/unread-count');
  return response.data;
};

// --------- OTA MANAGER ---------

// Deploy code to a device via OTA
export const deployOTA = async (data) => {
  const response = await API.post('/ota/deploy', data);
  return response.data;
};

// Get OTA deployment history for a specific device
export const getOTAHistory = async (apiKey) => {
  const response = await API.get(`/ota/history/${apiKey}`);
  return response.data;
};

// Get all OTA deployment history for the user
export const getAllOTAHistory = async () => {
  const response = await API.get('/ota/history');
  return response.data;
};

// Get built-in MicroPython code templates
export const getOTATemplates = async () => {
  const response = await API.get('/ota/templates');
  return response.data;
};

// Delete an OTA deployment record
export const deleteOTARecord = async (id) => {
  const response = await API.delete(`/ota/${id}`);
  return response.data;
};
