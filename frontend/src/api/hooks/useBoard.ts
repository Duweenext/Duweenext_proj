import axiosInstance from "@/src/api/apiManager";
import { useCallback, useState } from "react";
import axios from "axios"; // Import axios to check for AxiosError
import { BoardRelationship } from "@/src/interfaces/board";

export interface SensorDataCard extends SensorDataBackend {
    board_uuid: string;
}

export interface SensorDataBackend {
    id: number;
    sensor_type: string;
    sensor_threshold_max: number;
    sensor_threshold_min: number;
    board_id: number;
}

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
    const [sensorData, setSensorData] = useState<SensorDataBackend[] | null>(null);

    const [boards, setBoards] = useState<BoardRelationship[]>([]);

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
                // console.log("Creating board relationship with data:", data);
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

    const getAllBoardByUserId = useCallback(
        async (userId: number) => {
            setLoading(true);
            setError(null);
            try {
                const res = await axiosInstance.get(`/v1/relationships/user/${userId}`);
                setBoards(res.data.data);
            } catch (err) {
                setError(err);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const getSensorBasicInformation = useCallback(
        async (boardId: string) => {
            setLoading(true);
            setError(null);
            try {
                const res = await axiosInstance.get(`/v1/sensors/board/${boardId}`);
                console.log(res.data.data);
                setSensorData(res.data.data);
            } catch (err) {
                setError(err);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const getSensorGraphLog = useCallback(
        async (boardId: string, sensor_type: string, days: number) => {
            setLoading(true);
            setError(null);
            try {
                const res = await axiosInstance.get(`/v1/sensor/${sensor_type}/${boardId}/${days}`);
                console.log(res.data.data);
                return res.data.data;
            } catch (err) {
                setError(err);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const setBoardFrequency = useCallback(
        async (boardFrequency : number, boardId : string) => {
            setLoading(true);
            setError(null);
            try {
                const res = await axiosInstance.put(`/v1/board/frequency/${boardId}`, {
                    sensor_frequency : boardFrequency
                });

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
    )

    const setBoardThreshold = useCallback(
        async (type: string, max: number, min: number, boardId: string) => {
            setLoading(true);
            setError(null);
            try {
                const res = await axiosInstance.put(`/v1/sensor/thresholds/${boardId}`, {
                    sensor_type: type,
                    sensor_threshold_min: min,
                    sensor_threshold_max: max
                });

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
    )

    return {
        loading,
        error,
        boards,
        sensorData,
        verifyBoardInformation,
        createBoardRelationship,
        getAllBoardByUserId,
        getSensorBasicInformation,
        getSensorGraphLog,
        setBoardFrequency,
        setBoardThreshold
    };
};
