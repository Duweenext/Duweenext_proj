import axiosInstance from "@/src/api/apiManager";
import { useCallback, useState } from "react";

export const useBoard = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const verifyBoardInformation = useCallback(async (boardId : number) => {
        setLoading(true);
        setError(null);

        try {
            // const res = await axiosInstance.get("");
            console.log(boardId);
            await new Promise((resolve) => setTimeout(resolve, 5000));
            return true;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const forPatching = useCallback(async (returning_id: string, returner_info: string, phone: string) => {
        setLoading(true);
        setError(null);

        try {

            // const res = await axiosInstance.patch(`/admin/returns/${returning_id}/update-returner`);
            // 

        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const forPatchingwithForm = useCallback(async (returnId: string, formData: FormData) => {
        setLoading(true);
        setError(null);

        try {
            // 
            // const res = await axiosInstance.patch(
            //     `/admin/returns/request/${returnId}/update-info`,
            //     formData,
            //     { headers: { 'Content-Type': 'multipart/form-data' } }
            // );
            // 
            // return res;
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
        forPatching,
        forPatchingwithForm,
        verifyBoardInformation
    };
};