import axiosInstance from "@/src/api/apiManager";
import { useCallback, useState } from "react";
import axios from "axios"; // Import axios to check for AxiosError

export const useBoard = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const verifyBoardInformation = useCallback(async (boardId: string) => {
        setLoading(true);
        setError(null);
        try {
            console.log("Verifying Board ID with API:", boardId);
            const res = await axiosInstance.get(`/v1/board/${boardId}`);
            return res.data; // Board exists, return its data
        } catch (err) {
            // Check if the error is an Axios error and has a 404 status
            if (axios.isAxiosError(err) && err.response?.status === 404) {
                console.log("Board ID not found in database (404). Treating as a new board.");
                return null; // This is a valid case for a new board, not an error
            }
            // For all other errors, set the error state and re-throw
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
                return res.data;
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
        verifyBoardInformation,
        setConnectionPassword
    };
};
