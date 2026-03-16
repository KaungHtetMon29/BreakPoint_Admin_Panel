import type { AuthProvider } from "@refinedev/core";
import axios from "axios";
import type { AxiosError } from "axios";

const API_URL = String(import.meta.env.VITE_API_URL ?? "/api").trim().replace(/\/+$/, "");
const TOKEN_KEY = "admin_access_token";
const IDENTITY_KEY = "admin_identity_cache";
export const ADMIN_AUTH_STATE_EVENT = "admin-auth-state-changed";

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

type AdminTokenPayload = {
    uuid?: string;
    name?: string;
    email?: string;
    role?: string;
    level?: string;
    exp?: number;
};

const notifyAuthStateChanged = () => {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(ADMIN_AUTH_STATE_EVENT));
    }
};

const parseTokenPayload = (token: string): AdminTokenPayload | null => {
    try {
        const payloadSegment = token.split(".")[1];
        if (!payloadSegment) {
            return null;
        }
        const normalized = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
        const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
        const decoded = atob(padded);
        return JSON.parse(decoded) as AdminTokenPayload;
    } catch {
        return null;
    }
};

const clearAuthState = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(IDENTITY_KEY);
    notifyAuthStateChanged();
};

const getStoredToken = () => localStorage.getItem(TOKEN_KEY);

const buildAuthHeaders = (token: string) => ({
    Authorization: `Bearer ${token}`,
});

const isTokenExpired = (exp?: number) => {
    if (!exp) {
        return true;
    }
    const nowSeconds = Math.floor(Date.now() / 1000);
    return exp <= nowSeconds;
};

const isValidAdminToken = (token: string) => {
    const payload = parseTokenPayload(token);
    if (!payload) {
        return false;
    }
    if (String(payload.role ?? "").toLowerCase() !== "admin") {
        return false;
    }
    if (isTokenExpired(payload.exp)) {
        return false;
    }
    return true;
};

const parseStoredIdentity = () => {
    const cached = localStorage.getItem(IDENTITY_KEY);
    if (!cached) {
        return null;
    }
    try {
        const parsed = JSON.parse(cached) as AdminIdentity;
        if (!parsed.id || !parsed.email) {
            return null;
        }
        return parsed;
    } catch {
        return null;
    }
};

const storeIdentity = (identity: AdminIdentity) => {
    localStorage.setItem(IDENTITY_KEY, JSON.stringify(identity));
    notifyAuthStateChanged();
};

const fetchAdminIdentity = async (token: string): Promise<AdminIdentity | null> => {
    const response = await axios.get(buildApiUrl("/admin/profile"), {
        headers: buildAuthHeaders(token),
    });
    const payload = response?.data as Record<string, unknown> | undefined;
    if (!payload) {
        return null;
    }
    const identity: AdminIdentity = {
        id: String(payload.uuid ?? ""),
        name: String(payload.username ?? payload.name ?? "Admin"),
        email: String(payload.email ?? ""),
        level: String(payload.level ?? "admin"),
    };
    if (!identity.id || !identity.email) {
        return null;
    }
    storeIdentity(identity);
    return identity;
};

export const authProvider: AuthProvider = {
    login: async ({ email, password }) => {
        try {
            const response = await axios.post(buildApiUrl("/admin/auth/login"), { email, password });
            const token = response?.data?.token;
            if (!token || !isValidAdminToken(token)) {
                return {
                    success: false,
                    error: {
                        message: "Login failed",
                        name: "Invalid credentials",
                    },
                };
            }
            localStorage.setItem(TOKEN_KEY, token);
            notifyAuthStateChanged();
            const identity = await fetchAdminIdentity(token);
            if (!identity) {
                clearAuthState();
                return {
                    success: false,
                    error: {
                        message: "Login failed",
                        name: "Unauthorized",
                    },
                };
            }
            return {
                success: true,
                redirectTo: "/dashboard",
            };
        } catch {
            clearAuthState();
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
        const token = getStoredToken();
        if (token) {
            await axios.post(
                buildApiUrl("/admin/auth/logout"),
                {},
                {
                    headers: buildAuthHeaders(token),
                },
            ).catch(() => null);
        }
        clearAuthState();
        return {
            success: true,
            redirectTo: "/login",
        };
    },
    check: async () => {
        const token = getStoredToken();
        if (!token || !isValidAdminToken(token)) {
            clearAuthState();
            return {
                authenticated: false,
                redirectTo: "/login",
                logout: true,
            };
        }
        try {
            const identity = await fetchAdminIdentity(token);
            if (!identity) {
                clearAuthState();
                return {
                    authenticated: false,
                    redirectTo: "/login",
                    logout: true,
                };
            }
        } catch {
            clearAuthState();
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
    getPermissions: async () => {
        const identity = parseStoredIdentity();
        return identity?.level ?? null;
    },
    getIdentity: async () => {
        const token = getStoredToken();
        if (!token || !isValidAdminToken(token)) {
            clearAuthState();
            return null;
        }
        const identity = parseStoredIdentity();
        if (identity) {
            return identity;
        }
        try {
            return await fetchAdminIdentity(token);
        } catch {
            clearAuthState();
            return null;
        }
    },
    onError: async (error) => {
        const axiosError = error as AxiosError | undefined;
        const statusCode = axiosError?.response?.status;
        if (statusCode === 401 || statusCode === 403) {
            clearAuthState();
            return {
                logout: true,
                redirectTo: "/login",
                error: {
                    message: "Authorization error",
                    name: "Unauthorized",
                },
            };
        }
        return {
            error: {
                message: "Authorization error",
                name: "Unauthorized",
            },
        };
    },
};
