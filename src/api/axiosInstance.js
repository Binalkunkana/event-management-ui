import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://localhost:7187/api",
  // headers: { "Content-Type": "application/json" }
});

// Optional: Add request interceptor if specific logic is needed, 
// but generally Axios handles Content-Type automatically for objects (JSON) vs FormData.
axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // If data is NOT FormData, set JSON content type if missing
  if (!(config.data instanceof FormData) && !config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

export default axiosInstance;
