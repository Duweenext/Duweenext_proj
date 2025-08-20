import {useStorageState}  from "@/src/storage/useSecureStore";
import React, { createContext, useContext, useEffect, type PropsWithChildren } from "react";
import { useRouter, useSegments } from "expo-router";
import { isTokenExpired, getUserFromToken, willTokenExpireSoon, getTokenInfo } from "@/src/utils/jwtUtils";
import axiosInstance from "@/src/api/apiManager";

type User = {
    id: string;
    email: string;
    name: string;
    // Add other user properties as needed
};

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: PropsWithChildren) => {
    const [[isLoading, session], setSession] = useStorageState('session');
    const [[isUserLoading, user], setUser] = useStorageState('user');
    const router = useRouter();
    const segments = useSegments();

    const login = async (email: string, password: string) => {
        try {
            // Call your Go backend login endpoint
            const response = await axiosInstance.post('/visit/login', {
                email,
                password
            });

            const { token, user: userData } = response.data;

            // Validate JWT token before storing
            if (isTokenExpired(token)) {
                throw new Error('Token is expired');
            }
            
            setSession(token);
            
            // Store user data from backend response
            if (userData) {
                const userToStore = {
                    id: userData.id.toString(),
                    email: userData.email,
                    name: userData.username
                };
                setUser(JSON.stringify(userToStore));
            }
            
            console.log('JWT login successful, token stored');
        } catch (error: any) {
            console.error('Login failed:', error);
            throw new Error(error.response?.data?.error || error.message || 'Login failed');
        }
    };

    const logout = async () => {
        setSession(null);
        setUser(null);
    };

    // Check if session exists and is not expired
    const isAuthenticated = !!session && !isTokenExpired(session);
    const isFullyLoaded = !isLoading && !isUserLoading;
    
    // Set up axios interceptor to include JWT token
    useEffect(() => {
        if (session && !isTokenExpired(session)) {
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${session}`;
        } else {
            delete axiosInstance.defaults.headers.common['Authorization'];
        }
    }, [session]);
    
    // Auto-logout on token expiration
    useEffect(() => {
        if (session && isTokenExpired(session)) {
            console.log('JWT token expired, logging out');
            logout();
        }
    }, [session]);
    
    // Optional: Check for token expiration periodically
    useEffect(() => {
        if (!session) return;
        
        const interval = setInterval(() => {
            if (willTokenExpireSoon(session, 5)) {
                console.log('JWT token will expire soon');
                // You could trigger a refresh here if you implement refresh tokens
            }
        }, 60000); // Check every minute
        
        return () => clearInterval(interval);
    }, [session]);

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

    // Debug function to check token info
    const getTokenInfoDebug = () => {
        if (!session) return { error: 'No token available' };
        return getTokenInfo(session);
    };

    return (
        <AuthContext.Provider
            value={{
                user: parsedUser,
                token: session,
                login,
                logout,
                isLoading: isFullyLoaded ? false : true,
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