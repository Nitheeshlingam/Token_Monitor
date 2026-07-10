import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api",
});

export const getDashboardSummary = (
  filter = "today",
  model = "ALL"
) =>
  API.get(
    `/dashboard/summary?filter=${filter}&model=${model}`
  );

export const getDailyUsage = () =>
    API.get("/dashboard/daily-usage");