import axiosInstance from "@/src/api/apiManager";
import { useCallback, useEffect, useState } from "react";
import axios from "axios"; // Import axios to check for AxiosError
import { BoardConnectionStatus, BoardRelationship } from "@/src/interfaces/board";
import { eventBus } from "@/src/event/eventBus";
import { useAuth } from "@/src/auth/context/auth_context";

export type BoardRegistrationData = {
    board_id: string;
    user_id: number;
    con_method: string;
    con_password: string;
    board_name?: string;
};

export const useBoard = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);
    const {user} = useAuth();

    const [boards, setBoards] = useState<BoardRelationship[]>([]);

    const verifyBoardInformation = useCallback(async (boardId: string) => {
        setLoading(true);
        setError(null);
        try {
            console.log("Verifying Board ID with API:", boardId);
            const res = await axiosInstance.get(`/v1/board/${boardId}`);
            return res.data;
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 404) {
                console.log("Board ID not found in database (404). Treating as a new board.");
                return null;
            }
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const createBoardRelationship = useCallback(
        async (data: BoardRegistrationData) => {
            setLoading(true);
            setError(null);
            try {
                console.log("Creating board relationship with data:", data);
                const res = await axiosInstance.post('/v1/board-relationships', data);

                eventBus.emit('board-added', {
                    action: 'success',
                    data: data
                });

                return res.data.data;

            } catch (err) {
                console.error("Failed to create board relationship:", err);

                let errorMessage = "An unknown error occurred.";
                if (axios.isAxiosError(err) && err.response?.data?.message) {
                    errorMessage = err.response.data.message;
                }

                eventBus.emit('board-added', {
                    action: 'error',
                    data: data
                });

                setError(new Error(errorMessage));
                throw new Error(errorMessage);

            } finally {
                setLoading(false);
            }
        },
        []
    );

    const getAllBoardByUserId = useCallback(
        async (userId: number) => {
            setLoading(true);
            setError(null);
            try {
                const res = await axiosInstance.get(`/v1/relationships/user/${userId}`);
                console.log("Fetched boards for user:", res.data.data);
                setBoards(res.data.data);
            } catch (err) {
                setError(err);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const setBoardFrequency = useCallback(
        async (boardFrequency : number, boardId : string) => {
            setLoading(true);
            setError(null);
            try {
                const res = await axiosInstance.put(`/v1/board/frequency/${boardId}`, {
                    sensor_frequency : boardFrequency
                });

                eventBus.emit('board-frequency-updated', {
                    action: 'success',
                    boardId
                });

                return res.data.data;

            } catch (err) {
                console.error("Failed to create board relationship:", err);

                let errorMessage = "An unknown error occurred.";
                if (axios.isAxiosError(err) && err.response?.data?.message) {
                    errorMessage = err.response.data.message;
                }

                eventBus.emit('board-frequency-updated', {
                    action: 'error',
                    boardId
                });

                setError(new Error(errorMessage));
                throw new Error(errorMessage);

            } finally {
                setLoading(false);
            }
        },
        []
    )

    const setBoardConnection = useCallback(
        async ( relationship_id: number, connection_status: BoardConnectionStatus) => {
            setLoading(true);
            setError(null);
            try {
                const res = await axiosInstance.put(`/v1/board-relationships/${relationship_id}`, {
                    con_status: connection_status
                });

                eventBus.emit('board-connection-updated', {
                    action: 'success',
                    relationshipId: relationship_id
                });

                return res.data.data;

            } catch (err) {
                console.error("Failed to create board relationship:", err);

                let errorMessage = "An unknown error occurred.";
                if (axios.isAxiosError(err) && err.response?.data?.message) {
                    errorMessage = err.response.data.message;
                }

                eventBus.emit('board-connection-updated', {
                    action: 'error',
                    relationshipId: relationship_id
                });

                setError(new Error(errorMessage));
                throw new Error(errorMessage);

            } finally {
                setLoading(false);
            }
        },
        []
    )

    useEffect(() => {
        const unsubscribeAll = eventBus.subscribeMultiple(
            ['board-frequency-updated', 'board-connection-updated', 'board-added', 'board-deleted'],
            (eventType, data) => {
                switch (eventType) {
                    case 'board-added':
                    case 'board-deleted':
                    case 'board-connection-updated':
                        if (user?.id) {
                            getAllBoardByUserId(user.id);
                        }
                        break;
                    case 'board-frequency-updated':
                        if (data?.action === 'success') {
                            console.log(`useBoard: ${eventType} succeeded`);
                        } else if (data?.action === 'error') {
                            console.log(`useBoard: ${eventType} failed`);
                        }
                        break;
                }
            }
        );

        return () => {
            unsubscribeAll();
        };
    }, []);

    return {
        loading,
        error,
        boards,
        verifyBoardInformation,
        createBoardRelationship,
        getAllBoardByUserId,
        setBoardFrequency,
        setBoardConnection
    };
};