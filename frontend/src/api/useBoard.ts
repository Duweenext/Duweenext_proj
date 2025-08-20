import axiosInstance from "@/src/api/apiManager";
import { useCallback, useState } from "react";

export const useBoard = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const verifyBoardInformation = useCallback(async (boardId: string) => {
        setLoading(true);
        setError(null);

        try {
            const res = await axiosInstance.get("/v1/board/F4650B4A8AC41");
            console.log(res.data);
            // await new Promise((resolve) => setTimeout(resolve, 5000));
            return res.data;
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

    const setConnectionPassword = useCallback(
        async (values: { connectionPassword: string, selectedBoardId: string }) => {
            setLoading(true);
            setError(null);
            if (!values.selectedBoardId) return;

            try {

                const res = await axiosInstance.post(`/admin/boards/${values.selectedBoardId}/set-connection-password`, {
                    connectionPassword: values.connectionPassword
                });
            } catch (err) {
                setError(err);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    return {
        loading,
        error,
        forPatching,
        forPatchingwithForm,
        verifyBoardInformation,
        setConnectionPassword
    };
};