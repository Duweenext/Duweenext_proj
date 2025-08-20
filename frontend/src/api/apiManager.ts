// import axios from "axios";

// const axiosInstance = axios.create({
//   baseURL: "https://ac32bf3430ad.ngrok-free.app",
//   responseType: "json",
//   withCredentials: true,
// });

// export default axiosInstance;
import axios from "axios";

const BEARER_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NTU3ODIwMDAsInVzZXJfaWQiOjl9.POII-0mkc7fof7LXVi6luoyLXnHsHLtiLsgrXjnUZzU";

const axiosInstance = axios.create({
  baseURL: "https://3017d4a7d28e.ngrok-free.app",
  responseType: "json",
  headers: {
    "ngrok-skip-browser-warning": "true",
    
    "Authorization": `Bearer ${BEARER_TOKEN}`,
  },
});

export default axiosInstance;