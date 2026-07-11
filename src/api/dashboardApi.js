import axios from "axios";

const API = "http://localhost:5000/api/dashboard";

// Dashboard Summary
export const getDashboardSummary = (
  startDate,
  endDate,
  model = "ALL"
) => {
  return axios.get(`${API}/summary`, {
    params: {
      startDate,
      endDate,
      model,
    },
  });
};

// Daily Usage Chart
export const getDailyUsage = () => {
  return axios.get(`${API}/daily`);
};

// Request History
export const getHistory = () => {
  return axios.get(`${API}/history`);
};

// Dynamic Models (based on selected date range)
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

// Dashboard Card Details
export const getDetails = (
  type,
  startDate,
  endDate,
  model = "ALL"
) => {
  return axios.get(`${API}/details`, {
    params: {
      type,
      startDate,
      endDate,
      model,
    },
  });
};