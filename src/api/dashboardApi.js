import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/dashboard`;

// Common query parameters
const buildParams = (
  startDate,
  endDate,
  model = "ALL"
) => ({
  startDate,
  endDate,
  model,
});

// ======================================
// Dashboard Summary
// ======================================
export const getDashboardSummary = (
  startDate,
  endDate,
  model = "ALL"
) => {
  return axios.get(`${API}/summary`, {
    params: buildParams(startDate, endDate, model),
  });
};

// ======================================
// Daily Usage Chart
// ======================================
export const getDailyUsage = (
  startDate,
  endDate,
  model = "ALL"
) => {
  return axios.get(`${API}/daily`, {
    params: buildParams(startDate, endDate, model),
  });
};

// ======================================
// Request History
// ======================================
export const getHistory = (
  startDate,
  endDate,
  model = "ALL"
) => {
  return axios.get(`${API}/history`, {
    params: buildParams(startDate, endDate, model),
  });
};

// ======================================
// Available Models
// ======================================
export const getModels = (
  startDate,
  endDate
) => {
  return axios.get(`${API}/models`, {
    params: {
      startDate,
      endDate,
    },
  });
};

// ======================================
// Dashboard Details
// ======================================
export const getDetails = (
  type,
  startDate,
  endDate,
  model = "ALL"
) => {
  return axios.get(`${API}/details`, {
    params: {
      type,
      ...buildParams(startDate, endDate, model),
    },
  });
};