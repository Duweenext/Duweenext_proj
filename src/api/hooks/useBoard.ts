import { axiosMainInstance } from "@/src/api/apiManager";
import { useCallback, useEffect, useState } from "react";
import axios from "axios"; // Import axios to check for AxiosError
import { BoardConnectionStatus, BoardRelationship } from "@/src/interfaces/board";
import { eventBus } from "@/src/event/eventBus";
import { useAuth } from "@/src/auth/context/auth_context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { qc } from "../query";

export type BoardRegistrationData = {
    board_id: string;
    user_id: number;
    con_method: string;
    con_password: string;
    board_name?: string;
};

const boardKeys = {
    all: ['boards'] as const,
    user: (userId?: number) => [...boardKeys.all, 'user', userId] as const,
    info: (boardId: string) => [...boardKeys.all, 'info', boardId] as const,
};

type UseBoardReturn = {
    // data
    boards: BoardRelationship[] | undefined;
    loading: boolean;
    frequencyLoading: boolean;
    error: unknown;

    // queries / helpers
    verifyBoardInformation: (boardId: string) => Promise<any | null>;
    refetchBoards: () => Promise<void>;

    // mutations
    createBoardRelationship: (payload: BoardRegistrationData) => Promise<any>;
    setBoardFrequency: (boardId: string, boardFrequency: number) => Promise<any>;
    setBoardConnection: (relationship_id: number, status: BoardConnectionStatus) => Promise<any>;
    editBoardName: (boardId: string, boardName: string) => Promise<any>;
    deleteBoard: (relationship_id: number) => Promise<any>;
    verifyConnectionPassword: (boardId: string, connectionPassword: string) => Promise<any | null>;
};

export function useBoard(): UseBoardReturn {
    const { user } = useAuth();
    const userId = user?.id;

    // 1) List boards for current user
    const {
        data: boards,
        isFetching: loading,
        error,
        refetch,
    } = useQuery({
        queryKey: boardKeys.user(userId),
        enabled: !!userId,
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        queryFn: async () => {
            if (!userId) return [] as BoardRelationship[];
            const res = await axiosMainInstance.get(`/v1/relationships/user/${userId}`);
            return res.data.data as BoardRelationship[];
        },
        select: (data) =>
            [...data].sort((a, b) => (a.board_status === 'active' ? -1 : 1)),
    });

    // 2) Verify single board — returns null on 404
    const verifyBoardInformation = (boardId: string) =>
        qc.fetchQuery({
            queryKey: boardKeys.info(boardId),
            staleTime: 0,
            retry: false,
            queryFn: async () => {
                try {
                    const res = await axiosMainInstance.get(`/v1/board/${boardId}`);
                    return res.data;
                } catch (err) {
                    if (axios.isAxiosError(err) && err.response?.status === 404) return null;
                    throw err;
                }
            },

        });

    // 3) Create relationship
    const createBoardRelationshipMut = useMutation({
        mutationFn: async (payload: BoardRegistrationData) => {
            const res = await axiosMainInstance.post('/v1/board-relationships', payload);
            return res.data.data;
        },
        onSuccess: () => {
            if (userId) {
                qc.invalidateQueries({
                    queryKey: boardKeys.user(userId),
                    refetchType: 'active', // default; use 'all' if you want background ones too
                });
            }
            Toast.show({
                type: 'success',
                text1: 'Board added !!',
                text2: 'New Board Added successfully.',
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
                type: 'error',
                text1: 'Add failed',
                text2: 'Board already exists in you application',
            });
        },
    });

    // 4) Update frequency
    const setBoardFrequencyMut = useMutation({
        mutationFn: async ({ boardId, boardFrequency }: { boardId: string; boardFrequency: number }) => {
            const res = await axiosMainInstance.put(`/v1/board/frequency/${boardId}`, {
                sensor_frequency: boardFrequency,
            });
            return res.data.data;
        },
        onSuccess: () => {
            if (userId) qc.invalidateQueries({ queryKey: boardKeys.user(userId) });
            Toast.show({
                type: 'success',
                text1: 'Frequency Updated !!',
                text2: 'Frequency has been updated successfully.',
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

    // 5) Update connection
    const setBoardConnectionMut = useMutation({
        mutationFn: async ({ relationship_id, status }: { relationship_id: number; status: BoardConnectionStatus }) => {
            const res = await axiosMainInstance.put(`/v1/board-relationships/${relationship_id}`, {
                con_status: status,
            });
            return res.data.data;
        },
        onSuccess: () => {
            if (userId) qc.invalidateQueries({ queryKey: boardKeys.user(userId) });
        },
    });

    const editBoardName = useMutation({
        mutationFn: async ({ boardName, boardId }: { boardName: string, boardId: string }) => {
            const res = await axiosMainInstance.put(`/v1/board/name/${boardId}`, {
                board_name: boardName,
            });
            return res.data.data;
        },
        onSuccess: () => {
            if (userId) qc.invalidateQueries({ queryKey: boardKeys.user(userId) });
            Toast.show({
                type: 'success',
                text1: 'Board Name Updated',
                text2: 'The board name has been updated successfully.',
            });
        },
    });

    const deleteBoard = useMutation({
        mutationFn: async (relationship_id: number) => {
            const res = await axiosMainInstance.delete(`/v1/board-relationships/delete/${relationship_id}`);
            return res.data.data;
        },
        onSuccess: () => {
            if (userId) qc.invalidateQueries({ queryKey: boardKeys.user(userId) });
            Toast.show({
                type: 'success',
                text1: 'Board Deleted',
                text2: 'The board has been removed from your account.',
            });
        },
        onError: (error: any) => {
            Toast.show({
                type: 'error',
                text1: 'Delete failed',
                text2: error.message ?? 'Something went wrong.',
            });
        },
    });

    const verifyConnectionPassword = useMutation({
        mutationFn: async ({ boardId, connectionPassword }: { boardId: string, connectionPassword: string }) => {
            try {
                const res = await axiosMainInstance.post(`v1/board-relationships/verify/${boardId}`, {
                    con_password: connectionPassword,
                });
                return res.data;
            } catch (err) {
                if (axios.isAxiosError(err) && err.response?.status === 404) return null;
                throw err;
            }
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
                type: 'error',
                text1: 'Verification failed',
                text2: message,
            });
        },
    });

    useEffect(() => {
        // no-op placeholder; keep or delete
    }, []);

    return {
        boards,
        loading,
        frequencyLoading: setBoardFrequencyMut.isPending,
        error,

        verifyBoardInformation,

        refetchBoards: async () => {
            if (userId) await refetch();
        },

        createBoardRelationship: (payload: BoardRegistrationData) =>
            createBoardRelationshipMut.mutateAsync(payload),

        setBoardFrequency: (boardId: string, boardFrequency: number) =>
            setBoardFrequencyMut.mutateAsync({ boardId, boardFrequency }),

        verifyConnectionPassword: (boardId: string, connectionPassword: string) =>
            verifyConnectionPassword.mutateAsync({ boardId, connectionPassword }),

        setBoardConnection: (relationship_id: number, status: BoardConnectionStatus) =>
            setBoardConnectionMut.mutateAsync({ relationship_id, status }),

        editBoardName: (boardId: string, boardName: string) =>
            editBoardName.mutateAsync({ boardId, boardName }),

        deleteBoard: (relationship_id: number) =>
            deleteBoard.mutateAsync(relationship_id),
    };
}