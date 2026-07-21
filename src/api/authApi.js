import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/auth`,
});

export const loginUser = (data) => API.post("/login", data);

export const registerUser = (data) => API.post("/register", data);