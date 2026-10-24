import useAuthStore from "@/stores/useAuthStore.ts";
import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { notifications } from "@mantine/notifications";
import { FormError } from "@/libs/types/app.types.ts";
import useGlobalNotification from "@/stores/useGlobalNotification.ts";
import { timeDifference } from "@/libs/utils.ts";
import { showErr } from "@/utils/notification.util.tsx";

const IS_DEV = window.location.href.includes("localhost");
const BASE_URL = IS_DEV ? "http://localhost" : "https://api.riatirimbatvc.ac.ke";

// const BASE_URL = IS_DEV ? "http://api.riatirimbatvc.ac.ke" : "http://api.riatirimbatvc.ac.ke";

export function packAuthHeader(config: InternalAxiosRequestConfig) {
    const token = useAuthStore.getState().accessToken;
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
        headers: {
            Accept: "application/json",
        },
        withCredentials: true
    });


    instance.interceptors.request.use(packAuthHeader);
    instance.interceptors.response.use(config => config, async function (err: AxiosError) {
        // clear any previous notifications
        useGlobalNotification.getState().clearMessage()
        // serialize error blobs
        if (err.response && err.response.data && err.response.data instanceof Blob)
            err.response['data'] = JSON.parse(await err.response.data.text())
        // handle 401
        if (err.response?.status == 401) {// log
            const data = err.response?.data as unknown as Record<string, string>
            if ('error' in (data as Record<string, string>) && data.error === "Expired session") {
                const lastModified = useAuthStore.getState().modified
                // just log out the user if the session has been inactive for more than 30 minutes
                if (lastModified && timeDifference(lastModified) < 30)
                    return useAuthStore.getState().refresh()
            }
            return await useAuthStore.getState().logout()
                .then(() => notifications.show(showErr(err)))
                .catch(() => {
                })
        }
        if (err.response?.statusText === "Forbidden") {
            useGlobalNotification
                .getState()
                .setMessage("You do not have permission to access this resource.", 5000)
            // notifications.show({title: "Unauthorized", message: "You do not have permission to access this resource."})
        }
        if (err.response && err.response.data && typeof err.response.data == 'object' && 'validations' in err.response.data && Array.isArray(err.response.data.validations)) {
            return Promise.reject(new FormError(err, err.response.data.validations))
        }
        if (err.response && err.response.status == 502) {
            return Promise.reject(new Error("Server is down. Please wait for at least 5 minutes and try again. If it persists please contact support"))
        }
        return Promise.reject(err)
    })
    return instance;
}

// todo: add ports for each api in production
const apis = IS_DEV ?
    {
        admission: createApi("/api/v1", 5000),
        academic: createApi("/api", 5001),
        trainees: createApi("/api/v1", 5002),
        auth: createApi("/", 4005),
        files: createApi("/api", 5003),
        reporting: createApi("/api/v1", 5004),
        voucher: createApi("/api/vouchers", 5006),
        fees: createApi("/api", 5007),
    } :
    {
        admission: createApi("/admission/api/v1", 5000),
        academic: createApi("/academics/api", 5001),
        trainees: createApi("/students_api/api/v1", 5002),
        auth: createApi("/auth_api"),
        files: createApi("/filegate_api/api",),
        reporting: createApi("/reporting_api/api/v1", 5004),
        voucher: createApi("/voucher_api/api/vouchers", 7000),
        fees: createApi("/fees_api/api", 5007),
    }

export default apis

