import {useStorageState}  from "@/src/storage/useSecureStore";
import React, { createContext, useContext, useEffect, type PropsWithChildren } from "react";
import { useRouter, useSegments } from "expo-router";

type User = {
    id: number;
    email: string;
    name: string;
};

type AuthContextType = {
    login: (token: string, user?: User) => Promise<void>;
    logout: () => Promise<void>;
    session?: string | null;
    user?: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: PropsWithChildren) => {
    const [[isLoading, session], setSession] = useStorageState('session');
    const [[isUserLoading, user], setUser] = useStorageState('user');
    const router = useRouter();
    const segments = useSegments();

    const login = async (token: string, userData?: User) => {
        setSession(token);
        if (userData) {
            setUser(JSON.stringify(userData));
        }
    };

    const logout = async () => {
        setSession(null);
        setUser(null);
    };

    const isAuthenticated = !!session;
    const isFullyLoaded = !isLoading && !isUserLoading;

    useEffect(() => {
        if (!isFullyLoaded) return;

        const inAuthGroup = segments[0] === '(auth)';
        const isRootRoute = segments.length <= 1 && segments[0] !== '(auth)' && segments[0] !== '(tabs)';
        
        if (!isAuthenticated && !inAuthGroup) {
            router.replace('/(auth)/welcome');
        } else if (isAuthenticated && (inAuthGroup || isRootRoute)) {
            router.replace('/(tabs)');
        }
    }, [isAuthenticated, segments, isFullyLoaded]);

    const parsedUser = user ? JSON.parse(user) : null;

    return (
        <AuthContext.Provider
            value={{
                login,
                logout,
                session,
                user: parsedUser,
                isLoading: isFullyLoaded ? false : true,
                isAuthenticated,
            }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};