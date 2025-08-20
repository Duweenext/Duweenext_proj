import axios from "axios";
import { isTokenExpired } from "@/src/utils/jwtUtils";

const axiosInstance = axios.create({
  baseURL: "http://10.0.2.2:8080",
  responseType: "json",
  withCredentials: false, // CHANGED: Disable cookies, use JWT only
});

// Request interceptor to add JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    // Token will be set by AuthProvider
    
    // Debug: Log what credentials are being sent
    console.log('Request headers:', config.headers);
    console.log('With credentials:', config.withCredentials);
    
    // In web browser, you can check cookies like this:
    if (typeof document !== 'undefined') {
      console.log('Browser cookies:', document.cookie);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle JWT errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.log('JWT token invalid or expired');
      // Token is invalid - AuthProvider will handle logout
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
