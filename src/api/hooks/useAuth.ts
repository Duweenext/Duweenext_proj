import { useMutation } from "@tanstack/react-query";
import {axiosMainInstance} from "@/src/api/apiManager";

export interface LoginCredential {
  Email: string;
  Password: string;
}

export interface RegisterCredential {
  Email: string;
  Password: string;
  UserName: string;
}

export function useAuthentication() {
  // login mutation
  const loginMutation = useMutation({
    mutationFn: async (credential: LoginCredential) => {
      const res = await axiosMainInstance.post(`/visit/login`, credential);
      return res.data;
    },
  });

  // register mutation
  const registerMutation = useMutation({
    mutationFn: async (credential: RegisterCredential) => {
      const res = await axiosMainInstance.post(`/visit/register`, credential);
      return res.data;
    },
  });

  return {
    login: loginMutation.mutateAsync,
    loginLoading: loginMutation.isPending,
    loginError: loginMutation.error,

    register: registerMutation.mutateAsync,
    registerLoading: registerMutation.isPending,
    registerError: registerMutation.error,
  };
}
