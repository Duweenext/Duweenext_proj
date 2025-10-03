import { useStorageState } from "@/src/storage/useSecureStore";
import React, { createContext, useContext, useEffect, useMemo, useRef, type PropsWithChildren } from "react";
import { useRouter, useSegments } from "expo-router";
import { jwtDecode } from "jwt-decode";
import { useTranslation } from "react-i18next";
import { useLang } from "@/src/api/local/_languageConfig";

type JwtPayload = { exp?: number; iat?: number; sub?: string;[k: string]: any };

type User = {
    id: number;
    accType: "local" | "google";
    lang: string;
};

type AuthContextType = {
    login: (token: string, user?: User) => Promise<void>;
    logout: () => Promise<void>;
    session?: string | null;
    user?: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
};
const ISS = "duweenext";
const AUD = "duweenext-app";

function isTokenExpired(token: string, skewSeconds = 30): boolean {
    try {
        const decoded = jwtDecode<JwtPayload>(token);
        if (!decoded.exp) return true;
        const now = Math.floor(Date.now() / 1000);
        return decoded.exp <= now + skewSeconds;
    } catch {
        return true;
    }
}

function msUntilExpiry(token: string, earlyMs = 5_000): number | null {
    try {
        const { exp } = jwtDecode<JwtPayload>(token);
        if (!exp) return null;
        const ms = exp * 1000 - Date.now() - earlyMs;
        return ms > 0 ? ms : 0;
    } catch {
        return null;
    }
}

function getUserFromToken(token: string): User | null {
    try {
        const p = jwtDecode<JwtPayload>(token);

        if (p.typ !== "access") return null;
        if (p.iss && p.iss !== ISS) return null;
        if (p.aud && p.aud !== AUD) return null;
        if (!p.exp) return null;

        const raw = p.sub ?? p.user_id;
        if (raw == null) return null;

        const idNum =
            typeof raw === "number"
                ? raw
                : typeof raw === "string"
                    ? Number.parseInt(raw, 10)
                    : NaN;

        if (!Number.isFinite(idNum) || idNum <= 0) return null;
        ;
        const lang = typeof p.lang === "string" ? p.lang : "en";

        return {
            id: idNum,
            accType: p.accType === "google" ? "google" : "local",
            lang,
        };
    } catch {
        return null;
    }
}


const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: PropsWithChildren) => {
    const [[isLoading, session], setSession] = useStorageState('session');
    const [[isUserLoading, user], setUser] = useStorageState('user');
    const router = useRouter();
    const segments = useSegments();
    const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { i18n } = useTranslation();

    const login = async (token: string) => {
        if (isTokenExpired(token)) throw new Error("Token already expired");
        const derived = getUserFromToken(token);
        setSession(token);
        await setUser(JSON.stringify(derived));
        scheduleAutoLogout(token);

        const initialLang = derived?.lang ?? "en";
        useLang.getState().setLang(initialLang as "en" | "th");

        i18n.changeLanguage(initialLang);
    };

    const logout = async () => {
        clearLogoutTimer();
        setSession(null);
        setUser(null);
    };

    const validSession = useMemo(() => {
        if (!session) return null;
        return isTokenExpired(session) ? null : session;
    }, [session]);

    const clearLogoutTimer = () => {
        if (logoutTimerRef.current) {
            clearTimeout(logoutTimerRef.current);
            logoutTimerRef.current = null;
        }
    };

    const scheduleAutoLogout = (token: string) => {
        clearLogoutTimer();
        const ms = msUntilExpiry(token, 5_000);
        if (ms == null) return;
        if (ms === 0) {
            logout();
            return;
        }
        logoutTimerRef.current = setTimeout(() => {
            logout();
        }, ms);
    };

    const isAuthenticated = !!validSession;
    const isFullyLoaded = !isLoading && !isUserLoading;

    const parsedUser = user ? JSON.parse(user) : null;


    useEffect(() => {
        if (!isFullyLoaded) return;

        if (parsedUser?.lang) {
            i18n.changeLanguage(parsedUser.lang);
        } else {
            i18n.changeLanguage("en");
        }
    }, [isFullyLoaded]);

    useEffect(() => {
        if (!isFullyLoaded) return;
        if (!session) return;

        if (isTokenExpired(session)) {
            setSession(null);
            clearLogoutTimer();
        } else {
            scheduleAutoLogout(session);
        }
    }, [isFullyLoaded]);

    useEffect(() => {
        if (!isFullyLoaded) return;
        clearLogoutTimer();
        if (validSession) scheduleAutoLogout(validSession);
        return clearLogoutTimer;
    }, [validSession, isFullyLoaded]);

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