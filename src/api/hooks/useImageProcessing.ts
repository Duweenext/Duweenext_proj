import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosImageProInstance, axiosMainInstance } from "@/src/api/apiManager";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { nanoid } from 'nanoid/non-secure';
import { t } from "i18next";

export type PondDiagnoseResponse = {
    health_status: "Healthy" | "At Risk" | "Unhealthy" | string;
    description_and_recommendation: string;
    detected_classes: string[];
};

export type PondDiagnoseHistory = PondDiagnoseResponse & {
    _id: number;
    _ts: number;
    image_uri?: string;
};

export type ServerPondHealth = {
    PondID: number;      
    UserID: number;
    Picture: string; 
    Result: string;  
    data: string;    
    Description: string;
};

export type UploadableImage =
    | { uri: string; name?: string; type?: string } 
    | File
    | Blob;

const HISTORY_KEY = "pond_health_history_v1"; 
const HISTORY_MAX = 50; 

function buildFormData(file: UploadableImage, fieldName = "file"): FormData {
    const fd = new FormData();
    if (typeof file === "object" && "uri" in file) {
        const name = file.name ?? `upload-${Date.now()}.jpg`;
        const type =
            file.type ??
            (name.toLowerCase().endsWith(".png")
                ? "image/png"
                : name.toLowerCase().endsWith(".webp")
                    ? "image/webp"
                    : "image/jpeg");
        // @ts-ignore RN FormData file shape
        fd.append(fieldName, { uri: file.uri, name, type });
        return fd;
    }
    if (typeof File !== "undefined" && file instanceof File) {
        fd.append(fieldName, file, file.name);
        return fd;
    }
    fd.append(fieldName, file, `upload-${Date.now()}.jpg`);
    return fd;
}

function getPreviewUri(file: UploadableImage): string | undefined {
  if (typeof file === "object" && "uri" in file) return file.uri;
  if (typeof window !== "undefined" && "URL" in window) {
    try {
      if (typeof File !== "undefined" && file instanceof File) {
        return URL.createObjectURL(file);
      }
      if (file instanceof Blob) {
        return URL.createObjectURL(file);
      }
    } catch {}
  }
  return undefined;
}

export function usePondHealths() {
    const queryClient = useQueryClient();
    const { 
        data: history_result, 
        isLoading: isHistoryLoading,
        refetch: refetchHistory,
    } = useQuery<ServerPondHealth[], Error, PondDiagnoseHistory[]>({
        queryKey: ['pondHealthHistory'],
        
        queryFn: async () => {
            const res = await axiosMainInstance.get<ServerPondHealth[]>("/v1/pondhealthByUserId");
            return res.data;
        },

        select: (data) => {
            console.log("Raw pond health history from server:", data);
            if (!Array.isArray(data)) return [];
            return data 
                .map(item => ({
                    _id: item.PondID, 
                    _ts: new Date(item.data).getTime(),
                    health_status: item.Result,
                    image_uri: item.Picture,
                    description_and_recommendation: item.Description,
                    detected_classes: (item.Result ?? '').split(","),
                }))
                .sort((a, b) => b._ts - a._ts); 
        },
    });

    const saveToBackendMut = useMutation<
        unknown,
        Error,
        { file: UploadableImage; result: PondDiagnoseResponse } 
    >({
        mutationKey: ['savePondHealthToBackend'],
        mutationFn: async ({ file, result }) => {

            const form = buildFormData(file, "image");

            form.append("result", result.health_status);
            form.append("description", result.description_and_recommendation);
            form.append("classification", result.detected_classes.join(","));

            const res = await axiosMainInstance.post("/v1/PostPondHealth", form, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            
            return res.data;
        },
        onError: (err) => {
            console.error("Failed to save result to backend:", err);
            Toast.show({
                type: "errorToast",
                text1: t("toast.syncFailedTitle"), 
                text2: t("toast.syncFailedText"), 
                position: "bottom", 
            });
        },
        onSuccess: () => {
            console.log("Pond health result saved to Go backend.");
            queryClient.invalidateQueries({ queryKey: ['pondHealthHistory'] });
        }
    });

    const diagnoseMut = useMutation<
        PondDiagnoseResponse, 
        Error,
        UploadableImage 
    >({
        mutationFn: async (file) => {
            const form = buildFormData(file);
            const res = await axiosImageProInstance.post("/diagnose/", form, {
                headers: { "Content-Type": "multipart/form-data" },
                timeout: 60_000,
            });
            return res.data as PondDiagnoseResponse;
        },
        onSuccess: (data, file) => {
            Toast.show({
                type: "successToast",
                text1: t("toast.analysisCompleteTitle"), // --- TRANSLATED ---
                text2: t("toast.analysisStatusText", { status: data.health_status }), // --- TRANSLATED ---
                position: "top",
            });

            saveToBackendMut.mutate({ file: file, result: data });
        },
        onError: (err) => {
            Toast.show({
                type: "errorToast",
                text1: t("toast.analysisFailedTitle"), // --- TRANSLATED ---
                text2: err.message ?? t("toast.analysisFailedText"), // --- TRANSLATED ---
                position: "top",
            });
        },
    });

    const clearHistory = useMutation<unknown, Error, void>({
        mutationFn: async () => {
            // --- You need to create this endpoint in your Go backend ---
            // e.g., api.Delete("/pondhealth/all", pondHealthHandler.ClearAllPondHealth)
            await axiosMainInstance.delete('/pondhealth/all');
        },
        onSuccess: () => {
            Toast.show({ type: 'info', text1: t('toast.historyCleared') });
            queryClient.invalidateQueries({ queryKey: ['pondHealthHistory'] });
        }
    });

    const removeHistoryAt = useMutation<unknown, Error, number>({
        mutationFn: async (historyId: number) => {
            if (!historyId) throw new Error("Invalid history ID");

            await axiosMainInstance.delete(`/v1/pondhealth-delete/${historyId}`);
        },
        onSuccess: () => {
            Toast.show({ type: 'info', text1: t('toast.historyItemRemoved') });

            queryClient.invalidateQueries({ queryKey: ['pondHealthHistory'] });
        },
        onError: (err) => {
            Toast.show({ type: 'errorToast', text1: t('toast.removeItemFailed') });
        }
    });

    const getHistory = () => queryClient.fetchQuery({
        queryKey: ['pondHealthHistory'],
        queryFn: async () => {
            const res = await axiosMainInstance.get('/v1/pondhealthByUserId');
            queryClient.invalidateQueries({ queryKey: ['pondHealthHistory'] });
            return res.data;
        },
    });

    return {
        diagnose: diagnoseMut.mutateAsync,
        diagnosing: diagnoseMut.isPending || saveToBackendMut.isPending,
        diagnoseError: diagnoseMut.error ?? saveToBackendMut.error,
        diagnoseResult: diagnoseMut.data,
        history_result,
        clearHistory,
        removeHistoryAt: removeHistoryAt.mutateAsync,

        resetDiagnose: () => {
            diagnoseMut.reset();
            saveToBackendMut.reset();
        },
        getHistory: getHistory,
    };
}