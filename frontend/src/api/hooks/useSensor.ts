import axiosInstance from "@/src/api/apiManager";
import { useCallback, useState } from "react";
import axios from "axios"; // Import axios to check for AxiosError

export interface SensorDataCard extends SensorDataBackend {
    board_uuid: string;
}

export interface BackendSensorLogData {
  id: number;
  board_id: string;
  temperature: number;
  ec: number;
  ph: number;
  created_at: string;
}

export interface SensorDataBackend {
    id: number;
    sensor_type: string;
    sensor_threshold_max: number;
    sensor_threshold_min: number;
    board_id: number;
}

export const useSensor = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);
    const [sensorData, setSensorData] = useState<SensorDataBackend[] | null>(null);
    const [sensorGraphData, setSensorGraphData] = useState<BackendSensorLogData[] | null>(null);


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
                setSensorGraphData(res.data.data);
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
        sensorData,
        sensorGraphData,
        getSensorBasicInformation,
        getSensorGraphLog,
        setBoardThreshold,
    };
};