import { axiosMainInstance } from "@/src/api/apiManager";
import { useCallback, useEffect, useState } from "react";
import axios from "axios"; // Import axios to check for AxiosError
import { Board, BoardConnectionStatus, BoardRelationship } from "@/src/interfaces/board";
import { eventBus } from "@/src/event/eventBus";
import { useAuth } from "@/src/auth/context/auth_context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { qc } from "../query";
import { t } from "i18next";

export type BoardRegistrationData = {
    board_id: string;
    user_id: number;
    con_method: string;
    con_password: string;
    board_name?: string;
    mac_address?: string;
};

const boardKeys = {
    all: ['boards'] as const,
    user: (userId?: number) => [...boardKeys.all, 'user', userId] as const,
    info: (boardId: string) => [...boardKeys.all, 'info', boardId] as const,
    members: (boardId: string) => [...boardKeys.all, 'members', boardId] as const,
};

export type MemberShip = {
    relationship_id: number;
    user_id: number;
    user_name: string;
    role: 'owner' | 'admin' | 'labor' | 'user';
    approval: 'approved' | 'pending' | 'rejected';
}

type UseBoardReturn = {
    // data
    boards: BoardRelationship[] | undefined;
    pastAddedBoardId?: BoardRelationship;
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
    getBoardMembers: (boardId: string) => Promise<MemberShip[]>;
    approveOrRejectMember: (relationship_id: number, approval: 'approved' | 'rejected') => Promise<any>;
    kickMember: (relationship_id: number) => Promise<any>;
    getPastAddedBoardId: () => Promise<BoardRelationship[] | undefined>;
    getBoards: (userId: number) => Promise<BoardRelationship[]>;
};

export function useBoard(): UseBoardReturn {
    const { user } = useAuth();
    const userId = user?.id;

    const {
        data: pastAddedBoardId,
        isFetching: pastAddedBoardIdLoading,
        error: pastAddedBoardIdError,
        refetch: pastAddedBoardIdRefetch,
    } = useQuery({
        queryKey: ['pastAddedBoardId'],
        enabled: !!userId,
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        queryFn: async () => {
            return new Promise<BoardRelationship | undefined>(async (resolve) => {
                const res = await axiosMainInstance.get(`/v1/past/relationships`);
                return res.data.data as BoardRelationship | undefined;
            });
        },
    });

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

    const getBoards = (userId: number) => qc.fetchQuery({
        queryKey: boardKeys.user(userId),
        staleTime: 60_000,
        queryFn: async () => {
            const res = await axiosMainInstance.get(`/v1/relationships/user/${userId}`);
            qc.invalidateQueries({ queryKey: boardKeys.user(userId) });
            return res.data.data as BoardRelationship[];
        },

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
                type: 'successToast',
                text1: t('toast.boardAddedTitle'), // --- TRANSLATED ---
                text2: t('toast.boardAddedText'), // --- TRANSLATED ---
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

            const errorText = message.includes("already exists") // Example check, adjust based on actual API response
                ? t('toast.addFailedTextBoardExists')
                : message;

            Toast.show({
                type: "errorToast",
                text1: t('toast.addFailedTitle'), // --- TRANSLATED ---
                text2: errorText,
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
                type: 'successToast',
                text1: t('toast.frequencyUpdateTitle'), // --- TRANSLATED ---
                text2: t('toast.frequencyUpdateText'), // --- TRANSLATED ---
            });
        },
        onError: (error: any) => {
            Toast.show({
                type: "errorToast",
                text1: t('toast.updateFailedTitle'), // --- TRANSLATED ---
                text2: error.message ?? t('errors.unknownError'), // --- TRANSLATED ---
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
                type: 'successToast',
                text1: t('toast.boardNameUpdateTitle'), // --- TRANSLATED ---
                text2: t('toast.boardNameUpdateText'), // --- TRANSLATED ---
            });
        },
        onError: (error: any) => { // --- ADDED onError for consistency ---
            Toast.show({
                type: "errorToast",
                text1: t('toast.updateFailedTitle'),
                text2: error.message ?? t('errors.unknownError'),
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
                type: 'successToast',
                text1: t('toast.boardDeleteTitle'), // --- TRANSLATED ---
                text2: t('toast.boardDeleteText'), // --- TRANSLATED ---
            });
        },
        onError: (error: any) => {
            Toast.show({
                type: "errorToast",
                text1: t('toast.deleteFailedTitle'), // --- TRANSLATED ---
                text2: error.message ?? t('errors.unknownError'), // --- TRANSLATED ---
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
                type: "errorToast",
                text1: t('toast.verificationFailedTitle'), // --- TRANSLATED ---
                text2: message,
            });
        },
    });

    const getBoardMembers = useCallback(async (boardId: string) => {
        if (!boardId) return [];
        return qc.fetchQuery({
            queryKey: boardKeys.members(boardId),
            staleTime: 60_000,
            queryFn: async () => {
                const res = await axiosMainInstance.get(`/v1/board/${boardId}/members`);
                return res.data.data as {
                    relationship_id: number;
                    user_id: number;
                    user_name: string;
                    role: 'owner' | 'admin' | 'labor' | 'user';
                    approval: 'approved' | 'pending' | 'rejected';
                }[];
            },
        });
    }, [qc]);

    const approveOrRejectMember = useMutation({
        mutationFn: async ({ relationship_id, approval }: { relationship_id: number, approval: 'approved' | 'rejected' }) => {
            const res = await axiosMainInstance.put(`/v1/board-relationships/${relationship_id}/approval`, {
                approval,
            });
            return res.data.data;
        },
        onSuccess: (_data, variables) => {
            const isApproved = variables.approval === 'approved';
            Toast.show({
                type: 'successToast',
                text1: isApproved ? t('toast.memberApprovedTitle') : t('toast.memberRejectedTitle'),
                text2: isApproved ? t('toast.memberApprovedText') : t('toast.memberRejectedText'),
            });
            qc.invalidateQueries({ queryKey: boardKeys.members(variables.relationship_id.toString()) }); // Invalidate specific members query
            qc.invalidateQueries({ queryKey: boardKeys.user(userId) });
        },
        onError: (error: any) => {
            Toast.show({
                type: "errorToast",
                text1: t('toast.actionFailedTitle'), 
                text2: error.message ?? t('errors.unknownError'),
            });
        },
    });

    const kickMember = useMutation({
        mutationFn: async (relationship_id: number) => {
            const res = await axiosMainInstance.delete(`/v1/board-relationships/delete/${relationship_id}`);
            return res.data.data;
        },
        onSuccess: () => {
            Toast.show({
                type: 'successToast',
                text1: t('toast.memberRemovedTitle'), 
                text2: t('toast.memberRemovedText'), 
            });
            qc.invalidateQueries({ queryKey: boardKeys.all });
        },
        onError: (error: any) => {
            Toast.show({
                type: "errorToast",
                text1: t('toast.actionFailedTitle'), 
                text2: error.message ?? t('errors.unknownError'), // --- TRANSLATED ---
            });
        },
    });

    const getPastAddedBoardId = useCallback(async () => {
        if (!userId) return undefined;
        return qc.fetchQuery({
            queryKey: boardKeys.members(userId.toString()),
            staleTime: 60_000,
            queryFn: async () => {
                const res = await axiosMainInstance.get(`/v1/past/relationships`);
                return res.data.data as BoardRelationship[]
            },
        });
    }, [qc]);

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
        getBoardMembers,
        approveOrRejectMember: (relationship_id: number, approval: 'approved' | 'rejected') =>
            approveOrRejectMember.mutateAsync({ relationship_id, approval }),

        kickMember: (relationship_id: number) =>
            kickMember.mutateAsync(relationship_id),

        pastAddedBoardId: pastAddedBoardId,

        getPastAddedBoardId: getPastAddedBoardId,
        getBoards: getBoards,
    };
}