import { QueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

export type AppError = Error & {
  code?: string;         
  status?: number;       
  details?: unknown;     
};

export const qc = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
    },
    mutations: {
      retry: 0,
      onError: (error: unknown) => {
        const e = error as AppError;
        Toast.show({
          type: "error",
          text1: "Action failed",
          text2: e?.message ?? "Something went wrong.",
        });
      },
    },
  },
});
