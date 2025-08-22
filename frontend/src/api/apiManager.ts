import axios from "axios";

const BEARER_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NTU5MzI3ODMsInVzZXJfaWQiOjExfQ.GJfjabrIzmdnzt4jTXBSIRgx138l-iXBBXLxJ8fKZfo";

const axiosInstance = axios.create({
  baseURL: "https://554b0aac3a28.ngrok-free.app",
  responseType: "json",
  withCredentials: true,
});

export default axiosInstance;