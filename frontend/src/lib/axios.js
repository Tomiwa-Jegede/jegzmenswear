import axios from "axios";
import getSessionId from "./session";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  config.headers["x-session-id"] = getSessionId();
  const adminToken = localStorage.getItem("onfleek_admin_token");
  if (adminToken) {
    config.headers["Authorization"] = `Bearer ${adminToken}`;
  }
  return config;
});

export default api;
