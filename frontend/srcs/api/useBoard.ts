import axiosInstance from "@/srcs/api/apiManager";
import { useCallback, useState } from "react";

export const useBoard = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const getReturnList = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await axiosInstance.get("/admin/returns/request/all");

        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getReturnListbyGroup = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await axiosInstance.get("admin/returns/request/grouped-by-status");
            // 

        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getReturnById = useCallback(async (returning_id: string) => {
        setLoading(true);
        setError(null);

        try {
            const res = await axiosInstance.get(`admin/returns/request/details/${returning_id}`,);


        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const addReturnerInformation = useCallback(async (returning_id: string, returner_info: string, phone: string) => {
        setLoading(true);
        setError(null);

        try {

            const res = await axiosInstance.patch(`/admin/returns/${returning_id}/update-returner`);
            // 

        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const completedReturn = useCallback(async (returnId: string, formData: FormData) => {
        setLoading(true);
        setError(null);

        try {
            // 
            const res = await axiosInstance.patch(
                `/admin/returns/request/${returnId}/update-info`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            // 
            return res;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const addPermission = useCallback(async (email: string, role: string) => {
        setLoading(true);
        setError(null);

        try {
            const body = {
                email: email,
                role: role,
            }
            const res = await axiosInstance.patch("/admin/users/grant-access", body);
            let result = true;
            if (res.data == "User not found or role unchanged." || "Invalid request body.") {
                result = false;
            }
            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);



    return {
        loading,
        error,
        getReturnList,
        addPermission,
        getReturnListbyGroup,
        getReturnById,
        addReturnerInformation,
        completedReturn
    };
};