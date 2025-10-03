import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosMainInstance } from "@/src/api/apiManager";
import Toast from "react-native-toast-message";
import axios from "axios";
import { qc } from "../query";

export interface LoginCredential {
  Email: string;
  Password: string;
  DeviceToken: string | null;
  Platform?: string;
}

export interface RegisterCredential {
  Email: string;
  Password: string;
  UserName: string;
  DeviceToken?: string | null;
  Platform?: string;
}

export interface VerifyCredentialResponse {
  message: string;
  sent_to: string;
  verification_id: string;
  challenge_token: string;
}

export interface VerifyCredentialRequest {
  verification_id: string;
  code: string;
  email?: string;
}

export type DeleteGoogleResponse = {
  verification_id: string;
  challenge_token: string;
};


export interface GoogleLoginCredential {
  id_token: string;
  device_token: string | null;
  platform: string;
}

export interface GoogleLoginResponse {
  message: string;
  token: string;
}


export function useAuthentication() {

  const { data: verificationResponse } = useQuery<
    VerifyCredentialResponse | undefined
  >({
    queryKey: ["verificationResponse"],
    enabled: false,
    queryFn: async () =>
      qc.getQueryData<VerifyCredentialResponse>(["verificationResponse"]),
    initialData: () =>
      qc.getQueryData<VerifyCredentialResponse>(["verificationResponse"]),
  });

  const loginMutation = useMutation({
    mutationFn: async (credential: LoginCredential) => {
      const res = await axiosMainInstance.post(`/visit/login`, credential);
      return res.data;
    },
    onError: (error: any) => {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const apiMsg = (error.response?.data as any)?.message;

        const msg = apiMsg || error.message || "Something went wrong.";

        Toast.show({
          type: "error",
          text1: "Verification failed",
          text2: msg,
        });
        throw new Error(msg);
      }
      throw new Error("Something went wrong.");
    },
  });

  const registerMutation = useMutation<VerifyCredentialResponse, Error, RegisterCredential>({
    mutationFn: async (credential: RegisterCredential) => {
      const res = await axiosMainInstance.post(`/visit/register`, credential);
      return res.data as VerifyCredentialResponse;
    },
    onSuccess: (data) => {
      qc.setQueryData(["verificationResponse"], data);
    },
    onError: (error: any) => {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const apiMsg = (error.response?.data as any)?.message;

        const msg = apiMsg || error.message || "Something went wrong.";

        Toast.show({
          type: "error",
          text1: "Verification failed",
          text2: msg,
        });
        throw new Error(msg);
      }
      throw new Error("Something went wrong.");
    },
  });

  const verifyOtpCode = useMutation({
    mutationFn: async (data: { verification_id: string; code: string }) => {
      const res = await axiosMainInstance.post(`/visit/verify-email`, data);
      return res.data;
    },
    onSuccess: () => {
      qc.removeQueries({ queryKey: ["verificationResponse"] });
    },
    retry: (count, error: any) => {
      console.log('Retry attempt:', count, 'due to error:', error);
      const status = error.response?.status ?? 0;
      if (status >= 400 && status < 500) return false;
      return count < 2;
    },
    onError: (error: any) => {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const apiMsg = (error.response?.data as any)?.message;

        const msg =
          status === 401 ? "Invalid verification code."
            : status === 429 ? "Verification code expired. Please request a new one."
              : apiMsg || error.message || "Something went wrong.";

        Toast.show({
          type: "error",
          text1: "Verification failed",
          text2: msg,
        });
        throw new Error(msg);
      }
      throw new Error("Something went wrong.");
    },
  });

  const resendOtpCode = useMutation<VerifyCredentialResponse, Error, string>({
    mutationFn: async (email: string) => {
      const res = await axiosMainInstance.post(`/visit/resend-otp-email`, { email });
      return res.data as VerifyCredentialResponse;
    },
    onSuccess: (data) => {
      qc.setQueryData(["verificationResponse"], data);
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Resend failed',
        text2: error.message ?? 'Something went wrong.',
      });
      throw error;
    },
  });

  const googleLoginMutation = useMutation<
    GoogleLoginResponse,
    Error,
    GoogleLoginCredential
  >({
    mutationFn: async (credential: GoogleLoginCredential) => {
      const res = await axiosMainInstance.post(`/visit/google-login`, credential);
      return res.data as GoogleLoginResponse;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["userProfile"] });

      Toast.show({
        type: "success",
        text1: "Login successful",
      });
    },
    onError: (error: any) => {
      if (axios.isAxiosError(error)) {
        const apiMsg = (error.response?.data as any)?.error || error.message;
        Toast.show({
          type: "error",
          text1: "Google login failed",
          text2: apiMsg,
        });
        throw new Error(apiMsg);
      }
      throw new Error("Something went wrong.");
    },
  });


  return {
    login: loginMutation.mutateAsync,
    loginLoading: loginMutation.isPending,
    loginError: loginMutation.error,

    register: registerMutation.mutateAsync,
    registerLoading: registerMutation.isPending,
    registerError: registerMutation.error,

    verifyEmail: verifyOtpCode.mutateAsync,
    verifyEmailLoading: verifyOtpCode.isPending,
    verifyEmailError: verifyOtpCode.error,

    resendVerificationEmail: resendOtpCode.mutateAsync,
    resendEmailLoading: resendOtpCode.isPending,
    resendEmailError: resendOtpCode.error,

    verificationResponse,
    googleLogin: googleLoginMutation.mutateAsync,
    googleLoginLoading: googleLoginMutation.isPending,
    googleLoginError: googleLoginMutation.error,
  };
}
