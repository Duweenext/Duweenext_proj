import axios from "axios";
import { getItem } from '@/src/storage/useSecureStore';

const axiosInstance = axios.create({
  baseURL: "http://127.0.0.1:8080",
  responseType: "json",
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    try {

      const token = await getItem('session');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;