import { useCallback } from "react";
import { axiosMainInstance } from "../apiManager";
import { useMutation, useQuery } from "@tanstack/react-query";
import { qc } from "../query";

export type Notification = {
    id: number;
    message: string;
    messageType: string;
    boardId: string;
    userId: number;
    title: string;
    archived: boolean;

    groupId: number;
    note?: string;
    resolved: boolean;
    resolvedBy?: string;

    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
};

export type NotificationSetting = {
    notification_alert: boolean;
    notification_sound: boolean;
};

export const notificationKeys = {
    all: ['notifications'] as const,
    notificationSetting: ["user", "notification-setting"] as const,
};

type UseNotificationReturn = {
    notifications: Notification[] | undefined;
    notificationsLoading: boolean;
    notificationsError: unknown;

    notificationSetting: NotificationSetting | undefined;
    notificationSettingLoading: boolean;
    notificationSettingError: unknown;

    getNotifications: () => Promise<Notification[]>;
    archiveNotification: (id: number) => Promise<void>;
    resolveNotification: (id: number, note: string, groupId: number) => Promise<void>;
    deleteNotification: (id: number) => Promise<void>;
    updateNotificationSetting: (settings: { notificationAlert: boolean; notificationSound: boolean }) => Promise<void>;
};

export function useNotification(): UseNotificationReturn {
    const {
        data: notificationSetting,
        isLoading: notificationSettingLoading,
        error: notificationSettingError,
    } = useQuery({
        queryKey: notificationKeys.notificationSetting,
        queryFn: async (): Promise<NotificationSetting> => {
            const res = await axiosMainInstance.get("/v1/get-noti-setting");
            return res.data?.data ?? res.data;
        },
        staleTime: 60_000,
    });

    const { data, isLoading, error } = useQuery({
        queryKey: notificationKeys.all,
        queryFn: async (): Promise<Notification[]> => {
            const res = await axiosMainInstance.get('/v1/notifications');
            console.log('Fetched notifications:', res.data);
            return (res.data?.data ?? res.data ?? []) as Notification[];
        },
        staleTime: 60_000,
    });

    const getNotifications = useCallback(async () => {
        return qc.fetchQuery({
            queryKey: notificationKeys.all,
            staleTime: 60_000,
            queryFn: async (): Promise<Notification[]> => {
                const res = await axiosMainInstance.get('/v1/notifications');
                console.log('Fetched notifications:', res.data);
                return res.data.data as Notification[];
            },
        });
    }, [qc]);

    const archiveMutation = useMutation({
        mutationFn: async (id: number) => {
            await axiosMainInstance.post("/v1/archive", { notificationId: id, archived: true });
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
    });

    const resolveMutation = useMutation({
        mutationFn: async ({ id, note, groupId }: { id: number; note: string; groupId: number }) => {
            await axiosMainInstance.post("/v1/resolve", { notificationId: id, note: note, groupId: groupId });
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await axiosMainInstance.delete("/v1/noti-delete", { data: { notificationId: id } });
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
    });

    const updateSettingMutation = useMutation({
        mutationFn: async (settings: { notificationAlert: boolean; notificationSound: boolean }) => {
            await axiosMainInstance.patch("/v1/update-noti-setting", settings);
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
    });

    return {
        notifications: data,
        notificationsLoading: isLoading,
        notificationsError: error,
        notificationSetting: notificationSetting,
        notificationSettingLoading,
        notificationSettingError,

        getNotifications,
        archiveNotification: async (id: number) => archiveMutation.mutateAsync(id),
        resolveNotification: async (id: number, note: string, groupId: number) => resolveMutation.mutateAsync({ id, note, groupId }),
        deleteNotification: async (id: number) => deleteMutation.mutateAsync(id),
        updateNotificationSetting: async (settings: { notificationAlert: boolean; notificationSound: boolean }) =>
            updateSettingMutation.mutateAsync(settings),

    };
}