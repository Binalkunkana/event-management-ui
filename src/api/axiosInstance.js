import axios from "axios";
import toast from "react-hot-toast";

const axiosInstance = axios.create({
  baseURL: "https://localhost:7187/api",
});

// Request interceptor
axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (!(config.data instanceof FormData) && !config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Response interceptor for global error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    if (response) {
      const status = response.status;

      switch (status) {
        case 401:
          toast.error("Session expired. Please login again.", { id: 'unauthorized' });
          localStorage.clear();
          if (!window.location.pathname.includes('/login')) {
            window.location.href = "/login";
          }
          break;
        case 403:
          window.location.href = "/403";
          break;
        case 404:
          window.location.href = "/404";
          break;
        case 500:
          window.location.href = "/500";
          break;
        default:
          toast.error(response.data?.message || response.data?.Message || "An error occurred");
      }
    } else if (error.request) {
      toast.error("Network error. Please check your internet connection.");
    } else {
      toast.error("An unexpected error occurred.");
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
