import axios from "axios";

// Dynamically determine API URL
let API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  // If no env var, try to auto-detect
  const hostname = window.location.hostname;
  const port = 5000; // Backend port
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Local development
    API_BASE_URL = `http://${hostname}:${port}`;
  } else {
    // Production/Kubernetes - use current hostname with backend port
    API_BASE_URL = `http://${hostname}:${port}`;
  }
}

console.log("🔗 API URL:", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
