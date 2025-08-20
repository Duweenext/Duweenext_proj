import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080",
  responseType: "json",
  withCredentials: true,
});

export default axiosInstance;
