// useSensor.ts
import {axiosMainInstance} from "@/src/api/apiManager";
import axios from "axios";
import { useCallback } from "react";
import {
    useIsFetching,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import type {
    BackendSensorLogData,
    SensorCurrentData,
    SensorDataBackend,
} from "@/src/interfaces/sensor";
import Toast from "react-native-toast-message";

const sensorKeys = {
    all: ["sensor"] as const,
    basic: (boardId: string) => ["sensor", "basic", boardId] as const,
    current: (boardId: string) => ["sensor", "current", boardId] as const,
    graph: (boardId: string, scale: string, duration: number, end: string) =>
        ["sensor", "graph", boardId, scale, duration, end] as const,
    graphMerged: (boardId: string, scale: string) =>
        ["sensor", "graph-merged", boardId, scale] as const,
};

type UseSensorReturn = {
    sensorData: SensorDataBackend[] | undefined;
    sensorDataLoading: boolean;
    sensorDataError: unknown;

    currentSensorData: SensorCurrentData | undefined;
    currentLoading: boolean;

    mergedGraph: BackendSensorLogData[] | undefined;
    isFetchingGraph: boolean;

    getSensorBasicInformation: () => Promise<SensorDataBackend[]>;
    getSensorGraphLog: (endISO: string, scale?: string, duration?: number) => Promise<BackendSensorLogData[]>;
    measureCurrent: () => Promise<SensorCurrentData>;

    setBoardThreshold: (type: string, max: number, min: number) => Promise<any>;
    clearMergedGraph: (scale?: string) => void;
};

export function useSensor(boardId: string, graphScale: string = "day"): UseSensorReturn {
    const qc = useQueryClient();

    const getSensorBasicInformation = useCallback(async () => {
        return qc.fetchQuery({
            queryKey: sensorKeys.basic(boardId),
            staleTime: 60_000,
            queryFn: async (): Promise<SensorDataBackend[]> => {
                const res = await axiosMainInstance.get(`/v1/sensors/board/${boardId}`);
                return res.data.data as SensorDataBackend[];
            },
        });
    }, [qc, boardId]);

    const {
        data: sensorData,
        isFetching: sensorDataLoading,
        error: sensorDataError,
    } = useQuery({
        queryKey: sensorKeys.basic(boardId),
        enabled: false,
        queryFn: async () => [] as SensorDataBackend[],
    });

    const getSensorGraphLog = useCallback(
        async (endISO: string, scale: string = graphScale, duration: number = 24) => {
            const slice = await qc.fetchQuery({
                queryKey: sensorKeys.graph(boardId, scale, duration, endISO),
                staleTime: 0,
                queryFn: async (): Promise<BackendSensorLogData[]> => {
                    const res = await axiosMainInstance.get(`/v1/sensors/${boardId}/sensor-logs/agg`, {
                        params: { scale, lookback: duration, end: endISO, tz: "Asia/Bangkok" },
                    });
                    return res.data.data as BackendSensorLogData[];
                },
            });

            const mergeKey = sensorKeys.graphMerged(boardId, scale);
            qc.setQueryData<BackendSensorLogData[]>(mergeKey, (prev) => {
                const base = prev ?? [];
                const map = new Map<string, BackendSensorLogData>();
                const stamp = (x: any) => String(x.created_at ?? x.timestamp ?? "");

                for (const it of base) {
                    const k = stamp(it);
                    if (k) map.set(k, it);
                }
                for (const it of slice) {
                    const k = stamp(it);
                    if (k) map.set(k, it);
                }

                return Array.from(map.values()).sort((a, b) => {
                    const ta = new Date((a as any).created_at ?? (a as any).timestamp ?? 0).getTime();
                    const tb = new Date((b as any).created_at ?? (b as any).timestamp ?? 0).getTime();
                    return ta - tb;
                });
            });

            return slice;
        },
        [qc, boardId, graphScale]
    );

    const { data: mergedGraph } = useQuery({
        queryKey: sensorKeys.graphMerged(boardId, graphScale),
        enabled: false,
        queryFn: async () => [] as BackendSensorLogData[],
    });

    const isFetchingGraph =
        useIsFetching({
            predicate: (q) => {
                const k = q.queryKey;
                return Array.isArray(k) &&
                    k[0] === "sensor" &&
                    k[1] === "graph" &&
                    k[2] === boardId &&
                    k[3] === graphScale;
            },
        }) > 0;

    const measureCurrent = useCallback(async () => {
        return qc.fetchQuery({
            queryKey: sensorKeys.current(boardId),
            staleTime: 0,
            queryFn: async (): Promise<SensorCurrentData> => {
                const res = await axiosMainInstance.post(`/v1/board/measure/${boardId}`);
                return res.data.data as SensorCurrentData;
            },
        });
    }, [qc, boardId]);

    const { data: currentSensorData, isFetching: currentLoading } = useQuery({
        queryKey: sensorKeys.current(boardId),
        enabled: false,
        queryFn: async () => undefined as unknown as SensorCurrentData,
    });

    const setBoardThresholdMut = useMutation({
        mutationFn: async ({ type, max, min }: { type: string; max: number; min: number }) => {
            try {
                const res = await axiosMainInstance.put(`/v1/sensor/thresholds/${boardId}`, {
                    sensor_type: type,
                    sensor_threshold_min: min,
                    sensor_threshold_max: max,
                });
                return res.data.data;
            } catch (err) {
                const msg =
                    (axios.isAxiosError(err) && err.response?.data?.message) ||
                    (err as any)?.message ||
                    "Unknown error";
                throw new Error(msg);
            }
        },
        onSuccess: () => {
            Toast.show({
                type: 'success',
                text1: 'Threshold updated',
                text2: 'Your changes have been saved.',
            });
        },
        onError: (error: any) => {
            Toast.show({
                type: 'error',
                text1: 'Update failed',
                text2: error.message ?? 'Something went wrong.',
            });
        },
    });

    const setBoardThreshold = useCallback(
        async (type: string, max: number, min: number) =>
            setBoardThresholdMut.mutateAsync({ type, max, min }),
        [setBoardThresholdMut]
    );

    const clearMergedGraph = useCallback(
        (scale: string = graphScale) => {
            qc.removeQueries({ queryKey: sensorKeys.graphMerged(boardId, scale) });
        },
        [qc, boardId, graphScale]
    );

    return {
        sensorData,
        sensorDataLoading,
        sensorDataError,

        currentSensorData,
        currentLoading,

        mergedGraph,
        isFetchingGraph,

        getSensorBasicInformation,
        getSensorGraphLog,
        measureCurrent,

        setBoardThreshold,
        clearMergedGraph,
    };
}
