import axios, {AxiosError, type AxiosInstance, type InternalAxiosRequestConfig} from "axios";
import useAuthStore from "@/stores/useAuthStore.ts";
import {FormError} from "@/libs/types.ts";


const IS_DEV = window.location.href.includes("localhost") || window.location.href.startsWith("10");
const BASE_URL = IS_DEV
    ? "http://localhost"
    // : "http://10.81.103.59"
    : "https://api.riatirimbatvc.ac.ke";


// const BASE_URL = IS_DEV ? "http://api.riatirimbatvc.ac.ke" : "http://api.riatirimbatvc.ac.ke";

export function packAuthHeader(config: InternalAxiosRequestConfig) {
    const token = useAuthStore.getState().kcpeIndexNumber;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}

/**
 * Create a configured Axios instance.
 *
 * @param devPort - Port number used only in development
 * @param path - Optional path after the base URL
 */
function createApi(path = "", devPort?: number): AxiosInstance {
    const baseURL = IS_DEV
        ? `${BASE_URL}:${devPort ?? ""}${path}`
        : `${BASE_URL}${path}`;

    const instance = axios.create({
        baseURL,
        // timeout: 5000,
        headers: {
            Accept: "application/json",
        },
    });

    instance.interceptors.request.use(packAuthHeader);
    instance.interceptors.response.use(config => config, (err) => {
        if (err instanceof AxiosError && 'validations' in err.response?.data && Array.isArray(err.response?.data.validations)) {
            const formError = new FormError(err.response?.data.error ?? "", err.response?.data.validations)
            return Promise.reject(formError)
        }
        return Promise.reject(err)
    })
    return instance;
}

const apis = IS_DEV ?
    {
        admission: createApi("/api/v1", 5000),
        academic: createApi("/api", 5001),
        students: createApi("/api/v1", 5002),
        auth: createApi("/", 4000),
        files: createApi("/api", 6000),
    } :
    {
        admission: createApi("/admission/api/v1", 5000),
        academic: createApi("/academics/api", 5001),
        students: createApi("/students_api/api/v1", 5002),
        auth: createApi("/auth_api"),
        files: createApi("/filegate_api/api",),
    }

export default apis
