import axios, { AxiosError } from "axios";
import ApiAxios from "../api/apiManager";
import * as SecureStore from "expo-secure-store";
import { setStorageItemAsync } from "@/srcs/utlis/storage";

interface Data {
  username: string;
  email: string;
  password: string;
}

export const user_login = async (data: Data) => {
  try {
    const response = await ApiAxios.post("/v1/login", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log(response.data);

    const token = response.data.token;
    if (token) {
      return { success: true, data: response.data };
    }
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      console.error("Axios error:", error.response.data);
      return error.response.data;
    }

    console.error("Unknown error:", error);
    return { message: "An unknown error occurred." };
  }
};

export const user_register = async (data: Data) => {
  try {
    const response = await ApiAxios.post("/v1/register", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log(response.data);

    const token = response.data.token;
    if (token) {
      return { success: true, data: response.data };
    }
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      console.error("Axios error:", error.response.data);
      return error.response.data;
    }

    console.error("Unknown error:", error);
    return { message: "An unknown error occurred." };
  }
};
