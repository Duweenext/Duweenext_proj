import axios from "axios";

// const BEARER_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NTU5MzI3ODMsInVzZXJfaWQiOjExfQ.GJfjabrIzmdnzt4jTXBSIRgx138l-iXBBXLxJ8fKZfo";

const axiosInstance = axios.create({
  baseURL: "http://127.0.0.1:8080",
  responseType: "json",
  withCredentials: true,
});

export default axiosInstance;