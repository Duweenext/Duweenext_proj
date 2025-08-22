import axiosInstance from "@/src/api/apiManager";
import { useCallback, useState } from "react";
import axios from "axios"; // Import axios to check for AxiosError

export type BoardRegistrationData = {
  board_id: string;
  user_id: number;
  con_method: string;
  con_password: string;
  board_name?: string;
};

export const useBoard = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const verifyBoardInformation = useCallback(async (boardId: string) => {
        setLoading(true);
        setError(null);
        try {
            console.log("Verifying Board ID with API:", boardId);
            const res = await axiosInstance.get(`/v1/board/${boardId}`);
            return res.data; 
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 404) {
                console.log("Board ID not found in database (404). Treating as a new board.");
                return null; 
            }
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const createBoardRelationship = useCallback(
        async (data: BoardRegistrationData) => {
            setLoading(true);
            setError(null);
            try {
                console.log("Creating board relationship with data:", data);
                const res = await axiosInstance.post('/v1/board-relationships', data);

                return res.data.data;

            } catch (err) {
                console.error("Failed to create board relationship:", err);

                let errorMessage = "An unknown error occurred.";
                if (axios.isAxiosError(err) && err.response?.data?.message) {
                    errorMessage = err.response.data.message;
                }
                
                setError(new Error(errorMessage)); 
                throw new Error(errorMessage); 
                
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
        createBoardRelationship,
    };
};
