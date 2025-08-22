import {useStorageState}  from "@/src/storage/useSecureStore";
import React, { createContext, useContext, useEffect, type PropsWithChildren } from "react";
import { useRouter, useSegments } from "expo-router";

type User = {
    id: number;
    email: string;
    name: string;
    // Add other user properties as needed
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

    // Route protection logic
    // useEffect(() => {
    //     if (!isFullyLoaded) return;

    //     const inAuthGroup = segments[0] === '(auth)';
    //     const inTabsGroup = segments[0] === '(tabs)';
    //     const inScreensGroup = segments[0] === '(screens)';
        
    //     // Define public routes that don't require authentication
    //     const isPublicRoute = inAuthGroup || segments.length <= 0; // Root route and auth routes

    //     if (!isAuthenticated && !isPublicRoute) {
    //         // User is not authenticated and trying to access protected route
    //         console.log('Redirecting to login - not authenticated');
    //         router.replace('/(auth)/login');
    //     } else if (isAuthenticated && inAuthGroup) {
    //         // User is authenticated but on auth screen
    //         console.log('Redirecting to tabs - already authenticated');
    //         router.replace('/(tabs)');
    //     }
    // }, [isAuthenticated, segments, isFullyLoaded]);

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