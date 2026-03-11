import type { AuthProvider } from "@refinedev/core";
import axios from "axios";

const API_URL = String(import.meta.env.VITE_API_URL ?? "/api").trim().replace(/\/+$/, "");
const TOKEN_KEY = "admin_access_token";

const buildApiUrl = (path: string) => {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${API_URL}${normalizedPath}`;
};

type AdminIdentity = {
    id: string;
    name: string;
    email: string;
    level: string;
};

const parseTokenPayload = (token: string): Record<string, unknown> | null => {
    try {
        const payloadSegment = token.split(".")[1];
        if (!payloadSegment) {
            return null;
        }
        const normalized = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
        const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
        const decoded = atob(padded);
        return JSON.parse(decoded) as Record<string, unknown>;
    } catch {
        return null;
    }
};

export const authProvider: AuthProvider = {
    login: async ({ email, password }) => {
        try {
            const response = await axios.post(buildApiUrl("/admin/auth/login"), { email, password });
            const token = response?.data?.token;
            if (!token) {
                return {
                    success: false,
                    error: {
                        message: "Login failed",
                        name: "Invalid credentials",
                    },
                };
            }
            localStorage.setItem(TOKEN_KEY, token);
            return {
                success: true,
                redirectTo: "/dashboard",
            };
        } catch {
            return {
                success: false,
                error: {
                    message: "Login failed",
                    name: "Invalid credentials",
                },
            };
        }
    },
    logout: async () => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
            await axios.post(
                buildApiUrl("/admin/auth/logout"),
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            ).catch(() => null);
        }
        localStorage.removeItem(TOKEN_KEY);
        return {
            success: true,
            redirectTo: "/login",
        };
    },
    check: async () => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) {
            return {
                authenticated: false,
                redirectTo: "/login",
                logout: true,
            };
        }
        return {
            authenticated: true,
        };
    },
    getPermissions: async () => null,
    getIdentity: async () => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) {
            return null;
        }
        const payload = parseTokenPayload(token);
        if (!payload) {
            return null;
        }
        const identity: AdminIdentity = {
            id: String(payload.uuid ?? ""),
            name: String(payload.name ?? "Admin"),
            email: String(payload.email ?? ""),
            level: String(payload.level ?? "admin"),
        };
        return identity;
    },
    onError: async () => {
        return {
            error: {
                message: "Authorization error",
                name: "Unauthorized",
            },
        };
    },
};
