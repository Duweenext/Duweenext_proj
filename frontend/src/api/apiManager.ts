// import axios from "axios";

// const axiosInstance = axios.create({
//   baseURL: "https://ac32bf3430ad.ngrok-free.app",
//   responseType: "json",
//   withCredentials: true,
// });

// export default axiosInstance;
import axios from "axios";

const BEARER_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NTU5MzI3ODMsInVzZXJfaWQiOjExfQ.GJfjabrIzmdnzt4jTXBSIRgx138l-iXBBXLxJ8fKZfo";

const axiosInstance = axios.create({
  baseURL: "https://554b0aac3a28.ngrok-free.app",
  responseType: "json",
  headers: {
    "ngrok-skip-browser-warning": "true",
    
    "Authorization": `Bearer ${BEARER_TOKEN}`,
  },
});

export default axiosInstance;