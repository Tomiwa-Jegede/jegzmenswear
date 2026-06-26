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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAdminRoute = window.location.pathname.startsWith("/admin");
      if (isAdminRoute && window.location.pathname !== "/admin/login") {
        localStorage.removeItem("onfleek_admin_token");
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
