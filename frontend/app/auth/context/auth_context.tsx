// contexts/auth-context.tsx
import Storage from "@/app/utlis/storage";
import React, { createContext, useState, useEffect, useContext } from "react";

type AuthContextType = {
    isAuthenticated: boolean;
    login: (token: string) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkToken = async () => {
            const token = await Storage.getItem('auth-key');
            setIsAuthenticated(!!token);
        };
        checkToken();
    }, []);

    const login = async (token: string) => {
        await Storage.setItem('auth-key', token);
        setIsAuthenticated(true);
    };

    const logout = async () => {
        await Storage.deleteItem('auth-key');
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};
