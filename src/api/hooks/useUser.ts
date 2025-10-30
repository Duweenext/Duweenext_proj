import { useQuery, useQueryClient, useIsFetching, useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { axiosMainInstance } from "../apiManager";
import { qc } from "../query";
import Toast from "react-native-toast-message";
import axios from "axios";
import { DeleteGoogleResponse, VerifyCredentialRequest, VerifyCredentialResponse } from "./useAuth";
import { VerificationResponse } from "@/src/flows/_deletelocal";
import { t } from "i18next";

export type ChangeForgotPasswordInput = {
    email: string
    newPassword: string
    /** Optional: if your requireChallenge middleware expects a header/token */
    challenge?: string
}

export type ChangeForgotPasswordResponse = {
    message: string // "Password reset successfully"
}

type UserData = {
    user_id: number;
    email: string;
    user_name: string;
    is_deleted: boolean;
    phone_number?: string;
    permanent_deletion_at?: string;
};

export type NotificationSetting = {
    notificationAlert: boolean;
    notificationSound: boolean;
};

const userKeys = {
    all: ["user"] as const,
    byId: (id: number | string) => ["user", "by-id", String(id)] as const,
    current: ["user", "current"] as const,
    language: ["user", "language"] as const,
};

type UseUserReturn = {
    userData: UserData | undefined;
    userDataLoading: boolean;
    userDataError: unknown;

    changeUsername: (username: string, id?: number) => Promise<{ message: string; }>;
    isChangingUsername: boolean;
    changeUsernameError: unknown;

    getProfile: () => Promise<UserData>;
    clearUserCache: () => void;

    verifyPassword: (password: string) => Promise<boolean>;
    isVerifyingPassword: boolean;
    verifyPasswordError: unknown;

    sendOtpOldEmail: () => Promise<VerifyCredentialResponse>;
    verifyOldOtpCode: (data: VerifyCredentialRequest) => Promise<any>;
    sendOtpNewEmail: (email: string, challenge: string) => Promise<VerifyCredentialResponse>;
    verifyNewOtpCode: (
        p: VerifyCredentialRequest,
        challenge: string
    ) => Promise<{ message: string; token: string }>;

    resetPassword: (oldPassword: string, newPassword: string) => Promise<VerifyCredentialResponse>;
    sendOtpForgotPassword: (email: string) => Promise<VerifyCredentialResponse>;
    sendOTPForgotPasswordPending: boolean;
    verifyForgotPasswordOtpCode: (data: VerifyCredentialRequest) => Promise<{ message: string, token: string }>;
    verifyForgotPasswordOtpPending: boolean;
    resetForgotPassword: (data: ChangeForgotPasswordInput) => Promise<ChangeForgotPasswordResponse>;
    resetForgotPasswordPending: boolean;
    userLanguage?: { message: string; language: string };
    userLanguageLoading: boolean;
    userLanguageError: unknown;
    refetchUserLanguage: () => Promise<any>;

    sendOTPDeleteAccount: () => Promise<VerifyCredentialResponse>;
    verifyOTPDeleteAccount: (data: VerifyCredentialRequest) => Promise<any>;

    sendOTPDeleteAccountGoogle: (idToken: string) => Promise<VerifyCredentialResponse>;
    recoverUser: () => Promise<{ message: string }>;

    updateLocale: (locale: string) => Promise<void>;
    updateNotificationSettingMutation: (settings: NotificationSetting) => Promise<void>;
 
    sendOTPEmailVerification: (email: string) => Promise<VerificationResponse>;
    verifyOTPEmailVerification: (data: VerifyCredentialRequest, challenge: string) => Promise<any>;
    verificationResponse?: VerifyCredentialResponse;
};
const key = ["verificationResponse"] as const;

export function useUser(onLoggedOut?: () => Promise<void> | void): UseUserReturn {

    const [verificationResponse, setVerificationResponse] = useState<VerifyCredentialResponse | undefined>();

    const {
        data: userLanguage,
        isLoading: userLanguageLoading,
        error: userLanguageError,
        refetch: refetchUserLanguage,
    } = useQuery({
        queryKey: ["user", "language"],
        queryFn: async (): Promise<{ message: string; language: string }> => {
            const res = await axiosMainInstance.get(`/v1/user/language`);
            return res.data as { message: string; language: string };
        },
        staleTime: 60_000,
        refetchOnMount: "always",
        refetchOnWindowFocus: false,
    });

    const getProfile = useCallback(async () => {
        return qc.fetchQuery({
            queryKey: userKeys.current,
            staleTime: 60_000,
            queryFn: async (): Promise<UserData> => {
                const res = await axiosMainInstance.get(`/v1/user/profile`);
                // console.log('Fetched user profile:', res.data);
                return res.data as UserData;
            },
        });
    }, [qc]);

    const clearUserCache = useCallback(() => {
        qc.removeQueries({ queryKey: userKeys.current });
    }, [qc]);

    const { data: userData, error: userDataError, isLoading: userDataLoading } = useQuery({
        queryKey: userKeys.current,
        queryFn: async (): Promise<UserData> => {
            const res = await axiosMainInstance.get('/v1/user/profile');
            return res.data as UserData;
        },
        staleTime: 60_000,
        refetchOnMount: 'always',
        refetchOnWindowFocus: false,
    });

    type Ctx = { previous?: UserData };

    const changeUsernameMut = useMutation<{ message: string }, unknown, { username: string }, Ctx>({
        mutationFn: async ({ username }) => {

            const res = await axiosMainInstance.patch(`/v1/users/username`, { user_name: username });
            return res.data as { message: string };
        },
        onMutate: async ({ username }) => {
            await qc.cancelQueries({ queryKey: userKeys.current });
            const previous = qc.getQueryData<UserData>(userKeys.current);
            qc.setQueryData<UserData | undefined>(userKeys.current, (old) =>
                old ? { ...old, user_name: username } : old
            );
            return { previous };
        },
        onError: (err, _vars, ctx) => {
            if (ctx?.previous) qc.setQueryData(userKeys.current, ctx.previous);
           Toast.show({
                type: "errorToast",
                text1: t("toast.updateFailedTitle"), // --- TRANSLATED ---
                text2: (err as any)?.message ?? t("toast.usernameUpdateFailedText"), // --- TRANSLATED ---
            });
        },
        onSuccess: (data) => {
            Toast.show({ type: "successToast", text1: data?.message ?? t("toast.usernameUpdateSuccess") });
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: userKeys.current, exact: true });
        },
    });

    const verifyPasswordMut = useMutation<boolean, unknown, string>({
        mutationKey: ["user", "verify-password"],
        mutationFn: async (password: string) => {
            const res = await axiosMainInstance.post(`/v1/verify-password`, { password });
            const data = res.data;
            return typeof data === "boolean" ? data : !!data?.valid;
        },
        onError: (error: any) => {
            let message = 'Something went wrong.';
            if (axios.isAxiosError(error)) {
                const apiMsg = error.response?.data?.data || error.response?.data?.message;
                if (apiMsg) {
                    message = apiMsg;
                } else if (error.message) {
                    message = error.message;
                }
            }

            Toast.show({
                type: "errorToast",
                text1: t('toast.verifyPasswordFailedTitle'), // --- TRANSLATED ---
                text2: message,
            });
        },
    });

    const sendOtpOldEmailMut = useMutation<VerifyCredentialResponse>({
        mutationFn: async () => {
            const res = await axiosMainInstance.post("/v1/otp-old-email");
            return res.data as VerifyCredentialResponse;
        },
        onError: (error: any) => {
            let message = 'Something went wrong.';
            if (axios.isAxiosError(error)) {
                const apiMsg = error.response?.data?.data || error.response?.data?.message;
                if (apiMsg) {
                    message = apiMsg;
                } else if (error.message) {
                    message = error.message;
                }
            }

            Toast.show({
                type: "errorToast",
                text1: t('toast.sendOtpFailedTitle'), // --- TRANSLATED ---
                text2: message,
            });
        },
    });

    const sendOtpNewEmailMut = useMutation<VerifyCredentialResponse, unknown, { email: string; challenge: string }>({
        mutationFn: async ({ email, challenge }) => {
            const res = await axiosMainInstance.post("/challenge/otp-new-email", { email }, { headers: { "X-Challenge": challenge } });
            return res.data as VerifyCredentialResponse;
        },
        onError: (error: any) => {
            let message = 'Something went wrong.';
            if (axios.isAxiosError(error)) {
                const apiMsg = error.response?.data?.data || error.response?.data?.message;
                if (apiMsg) {
                    message = apiMsg;
                } else if (error.message) {
                    message = error.message;
                }
            }

            Toast.show({
                type: "errorToast",
                text1: t('toast.sendOtpFailedTitle'), // --- TRANSLATED ---
                text2: message,
            });
        },
    });

    const verifyNewOtpCodeMut = useMutation<
        { message: string; token: string },
        unknown,
        { payload: VerifyCredentialRequest; challenge: string }
    >({
        mutationFn: async ({ payload, challenge }) => {
            const res = await axiosMainInstance.post(`/challenge/verify-new-email`, payload, {
                headers: { "X-Challenge": challenge },
            });
            return res.data as { message: string; token: string };
        },
        retry: (count, error: any) => {
            const status = axios.isAxiosError(error) ? error.response?.status ?? 0 : 0;
            if (status >= 400 && status < 500) return false;
            return count < 2;
        },
        onSuccess: async () => {
            qc.invalidateQueries({ queryKey: userKeys.current });
        },
        onError: (error: any) => {
            const status = axios.isAxiosError(error) ? error.response?.status : undefined;
            const apiMsg = axios.isAxiosError(error) ? (error.response?.data as any)?.message : undefined;
            const msg =
                status === 401
                    ? "Invalid verification code."
                    : status === 429
                        ? "Verification code expired. Please request a new one."
                        : apiMsg || (axios.isAxiosError(error) ? error.message : "Something went wrong.");
            Toast.show({ type: "errorToast", text1: t("toast.verificationFailedTitle"), text2: msg });
        },
    })

    const verifyOldOtpCode = useMutation({
        mutationFn: async (data: VerifyCredentialRequest) => {
            const res = await axiosMainInstance.post(`/v1/verify-old-email`, data);
            return res.data;
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
                    type: "errorToast",
                    text1: t("toast.verificationFailedTitle"), 
                    text2: msg,
                });
                throw new Error(msg);
            }
            throw new Error("Something went wrong.");
        },
    });

    const resetPasswordMut = useMutation<VerifyCredentialResponse, unknown, { oldPassword: string; newPassword: string }>({
        mutationFn: async ({ oldPassword, newPassword }) => {
            const res = await axiosMainInstance.patch("/v1/users/change-password", { old_password: oldPassword, new_password: newPassword });
            return res.data as VerifyCredentialResponse;
        },
        onSuccess: (data) => {
            Toast.show({
                type: 'successToast',
                text1: t('toast.passwordChangeSuccessTitle'), // --- TRANSLATED ---
                props: { lottieSource: require('@/assets/animations/Success.json') }
            });
        },
        onError: (error: any) => {
            let message = 'Something went wrong.';
            if (axios.isAxiosError(error)) {
                const apiMsg = error.response?.data?.data || error.response?.data?.message;
                if (apiMsg) {
                    message = apiMsg;
                } else if (error.message) {
                    message = error.message;
                }
            }

            Toast.show({
                type: "errorToast",
                text1: t('toast.passwordResetFailedTitle'), // --- TRANSLATED ---
                text2: message,
            });
        },
    });

    const sendOtpForgotPasswordMut = useMutation<VerifyCredentialResponse, unknown, { email: string }>({
        mutationFn: async ({ email }) => {
            const res = await axiosMainInstance.post("/visit/otp-forgot-password", { email });
            return res.data as VerifyCredentialResponse;
        },
        onError: (error: any) => {
            let message = 'Something went wrong.';
            if (axios.isAxiosError(error)) {
                const apiMsg = error.response?.data?.data || error.response?.data?.message;
                if (apiMsg) {
                    message = apiMsg;
                } else if (error.message) {
                    message = error.message;
                }
            }

            Toast.show({
                type: "errorToast",
                text1: t('toast.sendOtpFailedTitle'), // --- TRANSLATED ---
                text2: message,
            });
        },
    });

    const verifyForgotPasswordOtpCode = useMutation<{ message: string, token: string }, unknown, VerifyCredentialRequest>({
        mutationFn: async (data: VerifyCredentialRequest) => {
            const res = await axiosMainInstance.post(`/visit/verify-otp-forgot-password`, data);
            return res.data as { message: string, token: string };
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
                    type: "errorToast",
                    text1: t("toast.verificationFailedTitle"), // --- TRANSLATED ---
                    text2: msg,
                });
                throw new Error(msg);
            }
            throw new Error("Something went wrong.");
        }
    });

    const resetForgotPasswordMut = useMutation<
        ChangeForgotPasswordResponse,
        unknown,
        ChangeForgotPasswordInput
    >({
        mutationKey: ['user', 'forgot-reset'],
        mutationFn: async ({ email, newPassword, challenge }) => {
            console.log('Resetting password for email:', challenge);
            const res = await axiosMainInstance.post(
                '/public/challenge/reset-password',
                { email, password: newPassword },
                { headers: { "X-Challenge": challenge }, }
            )
            return res.data as ChangeForgotPasswordResponse
        },
        onSuccess: async () => {
            Toast.show({ type: 'successToast', text1: t('toast.passwordResetSuccessTitle') }); // --- TRANSLATED ---
            if (onLoggedOut) await onLoggedOut()
        },
         onError: (error: any) => { // --- ADDED onError ---
            let message = t('errors.unknownError');
            if (axios.isAxiosError(error)) {
                const apiMsg = error.response?.data?.data || error.response?.data?.message;
                if (apiMsg) message = apiMsg;
                else if (error.message) message = error.message;
            }
            Toast.show({
                type: "errorToast",
                text1: t('toast.passwordResetFailedTitle'),
                text2: message,
            });
        }
    })

    const sendOtpDeleteAccountMut = useMutation<VerifyCredentialResponse, unknown>({
        mutationFn: async () => {
            const res = await axiosMainInstance.post("/v1/otp-delete-account");
            return res.data as VerifyCredentialResponse;
        },
        onError: (error: any) => {
            let message = 'Something went wrong.';
            if (axios.isAxiosError(error)) {
                const apiMsg = error.response?.data?.data || error.response?.data?.message;
                if (apiMsg) {
                    message = apiMsg;
                } else if (error.message) {
                    message = error.message;
                }
            }

            Toast.show({
                type: "errorToast",
                text1: t('toast.sendOtpFailedTitle'), // --- TRANSLATED ---
                text2: message,
            });
        },
    });

    const verifyOTPDeleteAccount = useMutation<{ message: string, token: string }, unknown, VerifyCredentialRequest>({
        mutationFn: async (data: VerifyCredentialRequest) => {
            const res = await axiosMainInstance.post(`/v1/verify-otp-delete-account`, data);
            return res.data as { message: string, token: string };
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
                    type: "errorToast",
                    text1: t("toast.verificationFailedTitle"), // --- TRANSLATED ---
                    text2: msg,
                });
                throw new Error(msg);
            }
            throw new Error("Something went wrong.");
        }
    });

    const deleteGoogleAccountRequest = useMutation({
        mutationFn: async (idToken: string): Promise<VerifyCredentialResponse> => {
            const res = await axiosMainInstance.post("/v1/delete-google-request", {
                id_token: idToken,
            });
            return res.data as VerifyCredentialResponse;
        },
        onError: (error: any) => { // --- ADDED onError ---
             let message = t('errors.unknownError');
            if (axios.isAxiosError(error)) {
                const apiMsg = error.response?.data?.data || error.response?.data?.message;
                if (apiMsg) message = apiMsg;
                else if (error.message) message = error.message;
            }
             Toast.show({
                type: "errorToast",
                text1: t('toast.actionFailedTitle'), // Or a more specific title
                text2: message,
            });
        }
    });

    const recoverUserMutation = useMutation({
        mutationFn: async () => {
            const res = await axiosMainInstance.post('/v1/recover-user');
            return res.data;
        },
        onSuccess: (data) => { // --- ADDED onSuccess ---
            Toast.show({ type: "successToast", text1: data?.message ?? "Account recovery initiated" }); // Example message
             qc.invalidateQueries({ queryKey: userKeys.current }); // Refresh user data
        },
         onError: (error: any) => { // --- ADDED onError ---
             let message = t('errors.unknownError');
            if (axios.isAxiosError(error)) {
                const apiMsg = error.response?.data?.data || error.response?.data?.message;
                if (apiMsg) message = apiMsg;
                else if (error.message) message = error.message;
            }
             Toast.show({
                type: "errorToast",
                text1: t('toast.actionFailedTitle'), // Or "Recovery Failed"
                text2: message,
            });
        }
    });

    const updateLocaleMutation = useMutation({
        mutationFn: async (locale: string) => {
            await axiosMainInstance.patch("/v1/user/language", {language: locale });
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['user'] }); // Invalidate user queries including language
            // Optional: Show success toast
            // Toast.show({ type: "successToast", text1: t('toast.languageUpdated') });
        },
        onError: (error: any) => { // --- ADDED onError ---
            let message = t('errors.unknownError');
            if (axios.isAxiosError(error)) {
                const apiMsg = error.response?.data?.data || error.response?.data?.message;
                if (apiMsg) message = apiMsg;
                else if (error.message) message = error.message;
            }
             Toast.show({
                type: "errorToast",
                text1: t('toast.updateFailedTitle'), // Or "Language update failed"
                text2: message,
            });
        }
    });

    const updateNotificationSettingMutation = useMutation({
        mutationFn: async (settings: NotificationSetting) => {
            await axiosMainInstance.patch("/v1/update-noti-setting", settings);
        },
        onSuccess: () => {
            // refetch user data if needed
            qc.invalidateQueries({ queryKey: ["user"] });
        },
    });

    const sendOTPEmailVerification = useMutation<VerificationResponse, unknown, string>({
        mutationFn: async (email: string) => {
            const res = await axiosMainInstance.post("/visit/sent-otp-email", { email });
            return res.data as VerificationResponse;
        },
        onSuccess: (data) => {
            setVerificationResponse(data);
        },
        onError: (error: any) => {
            let message = 'Something went wrong.';
            if (axios.isAxiosError(error)) {
                const apiMsg = error.response?.data?.data || error.response?.data?.message;
                if (apiMsg) {
                    message = apiMsg;
                } else if (error.message) {
                    message = error.message;
                }
            }

            Toast.show({
                type: "errorToast",
                text1: t('toast.sendOtpFailedTitle'), // --- TRANSLATED ---
                text2: message,
            });
        },
    });

    const verifyOTPEmailVerification = useMutation<any, unknown, { payload: VerifyCredentialRequest; challenge: string }>({
        mutationFn: async ({ payload, challenge }) => {
            console.log('Verifying email with challenge:', challenge);
            const res = await axiosMainInstance.post(`/public/challenge/verify-otp-email`, payload, {
                headers: { "X-Challenge": challenge },
            });
            return res.data;
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
                    type: "errorToast",
                    text1: t("toast.verificationFailedTitle"), // --- TRANSLATED ---
                    text2: msg,
                });
                throw new Error(msg);
            }
            throw new Error("Something went wrong.");
        }
    });

    return {
        userData,
        userDataLoading,
        userDataError,
        getProfile,
        clearUserCache,
        verificationResponse: verificationResponse,

        changeUsername: (username: string) => changeUsernameMut.mutateAsync({ username }),
        isChangingUsername: changeUsernameMut.isPending,
        changeUsernameError: changeUsernameMut.error,

        verifyPassword: (password: string) => verifyPasswordMut.mutateAsync(password),
        isVerifyingPassword: verifyPasswordMut.isPending,
        verifyPasswordError: verifyPasswordMut.error,

        sendOtpOldEmail: () => sendOtpOldEmailMut.mutateAsync(),
        verifyOldOtpCode: (data: VerifyCredentialRequest) => verifyOldOtpCode.mutateAsync(data),
        sendOtpNewEmail: (email: string, challenge: string) => sendOtpNewEmailMut.mutateAsync({ email, challenge }),
        verifyNewOtpCode: (data: VerifyCredentialRequest, challenge: string) => verifyNewOtpCodeMut.mutateAsync({
            payload: {
                verification_id: data.verification_id,
                code: data.code,
                email: data.email
            },
            challenge: challenge
        }),

        resetPassword: (oldPassword: string, newPassword: string) => resetPasswordMut.mutateAsync({ oldPassword, newPassword }),
        sendOtpForgotPassword: (email: string) => sendOtpForgotPasswordMut.mutateAsync({ email }),
        sendOTPForgotPasswordPending: sendOtpForgotPasswordMut.isPending,
        verifyForgotPasswordOtpCode: (data: VerifyCredentialRequest) => verifyForgotPasswordOtpCode.mutateAsync(data),
        verifyForgotPasswordOtpPending: verifyForgotPasswordOtpCode.isPending,
        resetForgotPassword: (data: ChangeForgotPasswordInput) => resetForgotPasswordMut.mutateAsync(data),
        resetForgotPasswordPending: resetForgotPasswordMut.isPending,

        userLanguage,
        userLanguageLoading,
        userLanguageError,
        refetchUserLanguage,
        sendOTPDeleteAccount: sendOtpDeleteAccountMut.mutateAsync,
        verifyOTPDeleteAccount: verifyOTPDeleteAccount.mutateAsync,
        sendOTPDeleteAccountGoogle: (idToken: string) => deleteGoogleAccountRequest.mutateAsync(idToken),
        recoverUser: () => recoverUserMutation.mutateAsync(),

        updateLocale: (locale: string) => updateLocaleMutation.mutateAsync(locale),
        updateNotificationSettingMutation: (settings: NotificationSetting) => updateNotificationSettingMutation.mutateAsync(settings),
        sendOTPEmailVerification: (email: string) => sendOTPEmailVerification.mutateAsync(email),
        verifyOTPEmailVerification: (data: VerifyCredentialRequest, challenge: string) => verifyOTPEmailVerification.mutateAsync({ payload: data, challenge }),
    };
}
