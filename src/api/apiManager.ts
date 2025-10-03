import axios, { AxiosError, AxiosInstance } from "axios";
import { getItem } from '@/src/storage/useSecureStore';
import { AppError } from "./query";

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

  instance.interceptors.response.use(
    (res) => res,
    (err: AxiosError<any>) => {
      const appErr: AppError = new Error("Request failed");

      if (err.code === "ECONNABORTED") {
        appErr.message = "Network timeout, please try again.";
        appErr.code = "ECONNABORTED";
      } else if (!err.response) {
        appErr.message = "Network error, check your connection.";
        appErr.code = "NETWORK_ERROR";
      } else {
        appErr.status = err.response.status;
        appErr.code = String(err.response.status);
        appErr.details = err.response.data;

        const backendMsg =
          (err.response.data as any)?.message ||
          (err.response.data as any)?.error ||
          err.message;

        appErr.message = backendMsg || "Server error.";
      }

      return Promise.reject(appErr); 
    }
  );

  return instance;
}

export const axiosMainInstance = withAuth(
  axios.create({
    baseURL: "https://a7294ce81606.ngrok-free.app",
    responseType: "json",
    timeout: 10_000,
    headers: { "Content-Type": "application/json" },
  })
);

export const axiosImageProInstance = withAuth(
  axios.create({
    baseURL: "https://imgprosduckweed.shiroha.biz",
    responseType: "json",
    timeout: 20_000,
    headers: { "Content-Type": "application/json" },
  })
);
