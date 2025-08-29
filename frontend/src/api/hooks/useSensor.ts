import axiosInstance from "@/src/api/apiManager";
import { useCallback, useState } from "react";
import axios from "axios"; // Import axios to check for AxiosError
import { AggregatedDataPoint, BackendSensorLogData, SensorDataBackend, SensorDataResponse } from "@/src/interfaces/sensor";



export const useSensor = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);
    const [sensorData, setSensorData] = useState<SensorDataBackend[] | null>(null);
    const [sensorGraphData, setSensorGraphData] = useState<BackendSensorLogData[] | null>(null);
    const [aggregatedSensorData, setAggregatedSensorData] = useState<AggregatedDataPoint[] | null>(null);

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

    const getAggregatedSensorData = useCallback(
        async (
            sensorType: string,
            boardId: number,
            startDate: string,
            endDate: string,
            resolution: 'year' | 'month' | 'week' | 'day' | 'hour' = 'day',
            timezone: string = 'Asia/Bangkok'
        ) => {
            setLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams({
                    start_date: startDate,
                    end_date: endDate,
                    resolution,
                    timezone,
                });

                const res = await axiosInstance.get(
                    `/v1/sensor/${sensorType}/${boardId}?${params}`
                );
                
                console.log('Aggregated sensor data:', res.data);
                
                if (res.data.status === 'success') {
                    setAggregatedSensorData(res.data.data);
                    return res.data as SensorDataResponse;
                } else {
                    throw new Error(res.data.message || 'Failed to fetch sensor data');
                }
            } catch (err) {
                console.error('Error fetching aggregated sensor data:', err);
                setError(err);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const getDefaultDateRange = useCallback((resolution: string) => {
        const endDate = new Date();
        let startDate: Date;

        switch (resolution) {
            case 'year':
                startDate = new Date(endDate.getFullYear() - 10, 0, 1);
                break;
            case 'month':
                startDate = new Date(endDate.getFullYear() - 2, endDate.getMonth(), 1);
                break;
            case 'week':
                startDate = new Date(endDate.getTime() - 6 * 30 * 24 * 60 * 60 * 1000); // 6 months
                break;
            case 'day':
                startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days
                break;
            case 'hour':
                startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days
                break;
            default:
                startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        return {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
        };
    }, []);

    return {
        loading,
        error,
        sensorData,
        sensorGraphData,
        aggregatedSensorData,
        getSensorBasicInformation,
        getSensorGraphLog,
        setBoardThreshold, 
        getAggregatedSensorData,
        getDefaultDateRange,
    };
};