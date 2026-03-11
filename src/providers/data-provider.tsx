import type { DataProvider } from "@refinedev/core";
import axios from "axios";
import type { AxiosInstance } from "axios";
import type { AxiosRequestConfig } from "axios";

const toSnakeCase = (str: string) => {
    if (str === "UUID") return "uuid";
    if (str === "ID") return "id";
    
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`).replace(/^_/, "");
};

const normalizeKeys = function <T>(obj: T): T {
    if (Array.isArray(obj)) {
        return obj.map((item) => normalizeKeys(item)) as T;
    }
    if (obj !== null && typeof obj === "object") {
        const normalized = Object.keys(obj as Record<string, unknown>).reduce((acc, key) => {
            const snakeKey = toSnakeCase(key);
            acc[snakeKey] = normalizeKeys((obj as Record<string, unknown>)[key]);
            return acc;
        }, {} as Record<string, unknown>);
        return normalized as T;
    }
    return obj;
};

const getAuthConfig = (config: AxiosRequestConfig = {}): AxiosRequestConfig => {
    const token = localStorage.getItem("admin_access_token");
    if (!token) {
        return config;
    }
    return {
        ...config,
        headers: {
            ...(config.headers ?? {}),
            Authorization: `Bearer ${token}`,
        },
    };
};

const normalizeApiUrl = (apiUrl: string) => apiUrl.trim().replace(/\/+$/, "");

const buildResourceUrl = (apiUrl: string, path: string) => {
    const normalizedPath = path.replace(/^\/+/, "");
    if (!apiUrl) {
        return `/${normalizedPath}`;
    }
    return `${apiUrl}/${normalizedPath}`;
};

export const dataProvider = (
    apiUrl: string,
    httpClient: AxiosInstance = axios,
): DataProvider => ({
    getList: async ({ resource, pagination }) => {
        const normalizedApiUrl = normalizeApiUrl(apiUrl);
        const url = buildResourceUrl(normalizedApiUrl, resource);

        const { currentPage = 1, pageSize = 10 } = pagination ?? {};

        const query: Record<string, number> = {
            page: currentPage,
            limit: pageSize,
        };

        try {
            const { data, headers } = await httpClient.get(url, getAuthConfig({ params: query }));
            
            if (data === null) {
                return {
                    data: [],
                    total: 0,
                };
            }

            const total = headers["x-total-count"];

            return {
                data: normalizeKeys(data),
                total: total ? parseInt(total, 10) : (Array.isArray(data) ? data.length : 0),
            };
        } catch (error) {
            if (resource.includes("usage")) {
                return { data: [], total: 0 };
            }
            throw error;
        }
    },

    getOne: async ({ resource, id }) => {
        const normalizedApiUrl = normalizeApiUrl(apiUrl);
        const url = buildResourceUrl(normalizedApiUrl, `${resource}/${id}`);
        const { data } = await httpClient.get(url, getAuthConfig());

        return {
            data: normalizeKeys(data),
        };
    },

    update: async ({ resource, id, variables }) => {
        const normalizedApiUrl = normalizeApiUrl(apiUrl);
        const url = buildResourceUrl(normalizedApiUrl, `${resource}/${id}`);
        const { data } = await httpClient.put(url, variables, getAuthConfig());

        return {
            data: normalizeKeys(data),
        };
    },
    
    create: async ({ resource, variables }) => {
        const normalizedApiUrl = normalizeApiUrl(apiUrl);
        const url = buildResourceUrl(normalizedApiUrl, resource);
        const { data } = await httpClient.post(url, variables, getAuthConfig());
        return {
            data: normalizeKeys(data),
        };
    },

    deleteOne: async ({ resource, id }) => {
        const normalizedApiUrl = normalizeApiUrl(apiUrl);
        const url = buildResourceUrl(normalizedApiUrl, `${resource}/${id}`);
        const { data } = await httpClient.delete(url, getAuthConfig());
        return {
            data: normalizeKeys(data),
        };
    },

    getApiUrl: () => normalizeApiUrl(apiUrl),

    custom: async ({ url, method, payload, query, headers }) => {
        const normalizedApiUrl = normalizeApiUrl(apiUrl);
        let requestUrl = `${url}`;
        if (!url.startsWith("http")) {
             requestUrl = buildResourceUrl(normalizedApiUrl, url);
        }

        const config = getAuthConfig({
            headers: headers ?? {},
            params: query,
        });

        let axiosResponse;
        switch (method) {
            case "put":
                axiosResponse = await httpClient.put(requestUrl, payload, config);
                break;
            case "post":
                axiosResponse = await httpClient.post(requestUrl, payload, config);
                break;
            case "patch":
                axiosResponse = await httpClient.patch(requestUrl, payload, config);
                break;
            case "delete":
                axiosResponse = await httpClient.delete(requestUrl, config);
                break;
            default:
                axiosResponse = await httpClient.get(requestUrl, config);
                break;
        }

        const { data } = axiosResponse;

        return {
            data: normalizeKeys(data),
        };
    },
});
