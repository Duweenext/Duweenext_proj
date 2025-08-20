import axiosInstance from "@/src/api/apiManager";
import { useCallback, useState } from "react";

import axios from 'axios';

const fetchBoardData = async (boardId: string) => {
  try {
    // Make the GET request to your local API endpoint
    const response = await axios.get(`https://ac32bf3430ad.ngrok-free.app/v1/board/${boardId}`);
    
    console.log('Board data fetched successfully:', response.data);
    return response.data; // Return the data from the response

  } catch (error) {
    console.error('Error fetching board data:', error);
    
    // More detailed error handling for Axios errors
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
      }
    }
    // Re-throw the error if you want the calling function to handle it
    throw error;
  }
};

// --- Example of how to call it ---
// fetchBoardData('F4650B4A8AC4');

export const useBoard = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const verifyBoardInformation = useCallback(async (boardId: string) => {
        setLoading(true);
        setError(null);

        try {
            fetchBoardData("F4650B4A8AC4");
            // const res = await axiosInstance.get("v1/board/F4650B4A8AC4");
            // console.log("Response from verifyBoardInformation:", res);
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