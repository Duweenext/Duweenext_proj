import axiosInstance from "@/src/api/apiManager";
import { useCallback, useState } from "react";
import axios from "axios"; // Import axios to check for AxiosError
import { WifiCreds } from "../ble/useBle.native";

export const useLogin = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const login = useCallback(async (credential: LoginCredential) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axiosInstance.post(`/visit/login`, credential);
            return res.data;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);


    return {
        login,
        loading,
        error
    };
};

export interface LoginCredential {
    username: string;
    password: string;
}
