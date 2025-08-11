// contexts/auth-context.tsx
import { useStorageState } from "@/src/utlis/storage";
import React, { createContext, useContext, type PropsWithChildren } from "react";

type AuthContextType = {
    login: (token: string) => Promise<void>;
    logout: () => Promise<void>;
    session?: string | null;
    isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: PropsWithChildren) => {
    const [[isLoading, session], setSession] = useStorageState('session');

    const login = async (token: string) => {
        setSession(token);
    };

    const logout = async () => {
        setSession(null);
    };

    return (
        <AuthContext.Provider
            value={{
                login: login,
                logout: logout,
                session: session,
                isLoading: isLoading,
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
