import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { axiosImageProInstance } from "@/src/api/apiManager";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { nanoid } from 'nanoid/non-secure';

export type PondDiagnoseResponse = {
    health_status: "Healthy" | "At Risk" | "Unhealthy" | string;
    description_and_recommendation: string;
    detected_classes: string[];
};

export type PondDiagnoseHistory = PondDiagnoseResponse & {
    _id: string;       // local unique id
    _ts: number;       // optional timestamp
    image_uri?: string; // optional URL to the uploaded image
};

export type UploadableImage =
    | { uri: string; name?: string; type?: string } // React Native
    | File
    | Blob;

const HISTORY_KEY = "pond_health_history_v1"; // storage key
const HISTORY_MAX = 50; // optional cap to avoid unbounded growth

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

    // Blob on web
    fd.append(fieldName, file, `upload-${Date.now()}.jpg`);
    return fd;
}

function getPreviewUri(file: UploadableImage): string | undefined {
  // RN: use the asset uri
  if (typeof file === "object" && "uri" in file) return file.uri;
  // Web: make an object URL when available
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
    const [history_result, setHistoryResult] = useState<PondDiagnoseHistory[]>([]);

    // Load history once on mount
    useEffect(() => {
        (async () => {
            try {
                const raw = await AsyncStorage.getItem(HISTORY_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw) as PondDiagnoseHistory[];
                    setHistoryResult(Array.isArray(parsed) ? parsed : []);
                }
            } catch (e) {
                console.warn("Failed to load pond history:", e);
            }
        })();
    }, []);

    // Small helper to persist state
    const persistHistory = async (next: PondDiagnoseHistory[]) => {
        setHistoryResult(next);
        try {
            await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
        } catch (e) {
            console.warn("Failed to persist pond history:", e);
        }
    };

    // Mutation
    const diagnoseMut = useMutation<PondDiagnoseResponse, Error, UploadableImage>({
        mutationFn: async (file) => {
            const form = buildFormData(file);
            const res = await axiosImageProInstance.post("/diagnose/", form, {
                headers: { "Content-Type": "multipart/form-data" },
                timeout: 60_000,
            });
            return res.data as PondDiagnoseResponse;
        },
        onSuccess: (data, file) => {
            // toast
            Toast.show({
                type: "success",
                text1: "Pond health analysis completed!",
                text2: `Status: ${data.health_status}`,
                position: "top",
            });

            // add to history (prepend newest first, cap length)
            const enriched: PondDiagnoseHistory = {
                ...data,
                _id: nanoid(),       
                _ts: Date.now(),
                image_uri: getPreviewUri(file), 
            };

            const next = [enriched, ...history_result].slice(0, HISTORY_MAX);
            void persistHistory(next);
        },
        onError: (err) => {
            Toast.show({
                type: "error",
                text1: "Analysis failed",
                text2: err.message ?? "Please try again.",
                position: "top",
            });
        },
    });

    // Utilities
    const clearHistory = async () => {
        await persistHistory([]);
    };

    const removeHistoryAt = async (id: string) => {
        const next = history_result.filter(item => item._id !== id);
        await persistHistory(next);
    };

    return {
        diagnose: diagnoseMut.mutateAsync,
        diagnosing: diagnoseMut.isPending,
        diagnoseError: diagnoseMut.error,
        diagnoseResult: diagnoseMut.data,
        history_result,
        clearHistory,
        removeHistoryAt,

        resetDiagnose: diagnoseMut.reset,
    };
}
