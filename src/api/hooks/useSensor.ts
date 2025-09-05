import axiosInstance from "@/src/api/apiManager";
import { useCallback, useState } from "react";
import axios from "axios"; // Import axios to check for AxiosError
import { AggregatedDataPoint, BackendSensorLogData, SensorCurrentData, SensorDataBackend, SensorDataResponse } from "@/src/interfaces/sensor";


export const useSensor = () => {
    const [loading, setLoading] = useState(false);
    const [currentLoading, setCurrentLoading] = useState(false);
    const [error, setError] = useState<any>(null);
    const [sensorData, setSensorData] = useState<SensorDataBackend[] | null>(null);
    const [currentSensorData, setCurrentSensorData] = useState<SensorCurrentData | null>(null);
    const [sensorGraphData, setSensorGraphData] = useState<BackendSensorLogData[] | null>(null);
    const [aggregatedSensorData, setAggregatedSensorData] = useState<AggregatedDataPoint[] | null>(null);

    const getSensorBasicInformation = useCallback(
        async (boardId: string) => {
            setLoading(true);
            setError(null);
            try {
                const res = await axiosInstance.get(`/v1/sensors/board/${boardId}`);
                // console.log(res.data.data);
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
        async (boardId: string, target_date: string, scale: string, duration: number) => {
            setLoading(true);
            setError(null);
            try {
                console.log(target_date, scale, duration);
                const res = await axiosInstance.get(`/v1/sensors/${boardId}/sensor-logs/agg`, {
                    params: { scale: scale, lookback: duration, end: target_date, tz: 'Asia/Bangkok' },
                });
                setSensorGraphData(prevData => {
                    if (!prevData) {
                        setSensorGraphData(res.data.data);
                        return res.data.data;
                    };

                    const dataMap = new Map();

                    // console.log("previous data : ", prevData)

                    prevData.forEach(item => {
                        const key = item.created_at;
                        dataMap.set(key, item);
                    });

                    res.data.data.forEach((item: BackendSensorLogData) => {
                        const key = item.created_at;
                        dataMap.set(key, item);
                    });

                    const mergedData = Array.from(dataMap.values()).sort((a, b) => {
                        const timeA = new Date(a.created_at || a.timestamp || 0).getTime();
                        const timeB = new Date(b.created_at || b.timestamp || 0).getTime();
                        return timeA - timeB;
                    });
                    // console.log("Merge data : ", mergedData)

                    console.log(`📊 Merged data: ${prevData.length} + ${res.data.data.length} = ${mergedData.length} total`);
                    return mergedData;
                });

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

    const measureCurrent =  useCallback(async (boardId: string) => {
        setCurrentLoading(true);
        setError(null);
        try {
            const res = await axiosInstance.post(`/v1/board/measure/${boardId}`);
            console.log("Measured current sensor data:", res.data.data);
            setCurrentSensorData(res.data.data);
            return res.data.data;
        } catch (error) {
            console.error("Failed to measure current:", error);
            throw error;
        } finally {
            setCurrentLoading(false);
        }
    }, []);

    return {
        loading,
        currentLoading,
        error,
        sensorData,
        sensorGraphData,
        aggregatedSensorData,
        currentSensorData,
        getSensorBasicInformation,
        getSensorGraphLog,
        setBoardThreshold,
        measureCurrent
    };
};