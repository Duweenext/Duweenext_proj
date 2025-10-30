// useSensor.ts
import { axiosMainInstance } from "@/src/api/apiManager";
import axios from "axios";
import { useCallback, useMemo, useState } from "react";
import {
    useIsFetching,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import type {
    BackendSensorLogData,
    BackendSensorLogPayload,
    SensorCurrentData,
    SensorDataBackend,
} from "@/src/interfaces/sensor";
import Toast from "react-native-toast-message";

const sensorKeys = {
    all: ["sensor"] as const,
    basic: (boardId: string) => ["sensor", "basic", boardId] as const,
    current: (boardId: string) => ["sensor", "current", boardId] as const,
};

type UseSensorReturn = {
    sensorData: SensorDataBackend[] | undefined;
    sensorDataLoading: boolean;
    sensorDataError: unknown;

    currentSensorData: SensorCurrentData | undefined;
    currentLoading: boolean;
    currentInitialLoading?: boolean;

    getSensorBasicInformation: () => Promise<SensorDataBackend[]>;
    measureCurrent: () => Promise<SensorCurrentData>;

    setBoardThreshold: (type: string, max: number, min: number) => Promise<any>;
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
        refetch: refetchSensorData,
    } = useQuery({
        queryKey: sensorKeys.basic(boardId),
        queryFn: async (): Promise<SensorDataBackend[]> => {
            const res = await axiosMainInstance.get(`/v1/sensors/board/${boardId}`);
            return res.data.data as SensorDataBackend[];
        },
        enabled: !!boardId,
        staleTime: 60_000,
        select: (data) => data,          
        structuralSharing: true,
    });

    const measureMutation = useMutation({
        mutationFn: async () => {
            const res = await axiosMainInstance.post(`/v1/board/measure/${boardId}`);
            console.log("Measurement result:", res.data.data);
            return res.data.data as SensorCurrentData;
        },
        onSuccess: (data) => {
            qc.setQueryData(sensorKeys.current(boardId), data);
            Toast.show({ type: "successToast", text1: t("toast.measurementComplete") });
        },
        onError: (error: any) => {
             Toast.show({
                type: "errorToast",
                text1: t('toast.actionFailedTitle'), // Or a more specific title
                text2: error.message ?? t('errors.unknownError'),
            });
        },
    });

    const measureCurrent = useCallback(() => {
        return measureMutation.mutateAsync();
    }, [measureMutation]);

    const { data: currentSensorData, isFetching: currentInitialLoading } = useQuery({
        queryKey: sensorKeys.current(boardId),
        queryFn: async (): Promise<SensorCurrentData> => {
            const res = await axiosMainInstance.post(`/v1/board/measure/${boardId}`);
            return res.data.data;
        },
        enabled: !!boardId,
        staleTime: Infinity,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        retry: false,
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
                type: 'successToast',
                text1: t('toast.thresholdUpdateTitle'), // --- TRANSLATED ---
                text2: t('toast.thresholdUpdateText'), // --- TRANSLATED ---
            });
            qc.invalidateQueries({ queryKey: sensorKeys.basic(boardId) });
        },
        onError: (error: any) => {
           Toast.show({
                type: "errorToast",
                text1: t('toast.updateFailedTitle'), // --- TRANSLATED ---
                text2: error.message ?? t('errors.unknownError'), // --- TRANSLATED ---
            });
        },
    });

    const setBoardThreshold = useCallback(
        async (type: string, max: number, min: number) =>
            setBoardThresholdMut.mutateAsync({ type, max, min }),
        [setBoardThresholdMut]
    );

    return {
        sensorData,
        sensorDataLoading,
        sensorDataError,

        currentSensorData,
        currentLoading: measureMutation.isPending,

        getSensorBasicInformation,
        measureCurrent,
        setBoardThreshold,
    };
}

import { create } from 'zustand';
import { t } from "i18next";

interface SensorExpandState {
  expandedSensors: Record<string, boolean>;
  toggleSensor: (id: string) => void;
  collapseAll: () => void;
}

export const useSensorExpandStore = create<SensorExpandState>((set) => ({
  expandedSensors: {},
  toggleSensor: (id) =>
    set((state) => ({
      expandedSensors: {
        ...state.expandedSensors,
        [id]: !state.expandedSensors[id],
      },
    })),
  collapseAll: () => set({ expandedSensors: {} }),
}));

