import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const getTodayDashboard = () => API.get("/dashboard/today");