import axios, { AxiosInstance } from "axios";
import { getItem } from '@/src/storage/useSecureStore';

function withAuth(instance: AxiosInstance) {
  instance.interceptors.request.use(async (config) => {
    try {
      const token = await getItem("session");
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch (e) {
      console.error("Error getting auth token:", e);
    }
    return config;
  });
  return instance;
}

export const axiosMainInstance = withAuth(
  axios.create({
    baseURL: "https://duckweed.shiroha.biz",
    responseType: "json",
    timeout: 10_000,
    headers: { "Content-Type": "application/json" },
  })
);

export const axiosImageProInstance = withAuth(
  axios.create({
    baseURL: "https://imgprosduckweed.shiroha.biz",
    responseType: "json",
    timeout: 20_000, // often longer for images; adjust as you like
    headers: { "Content-Type": "application/json" },
  })
);
