import axios, { AxiosInstance, AxiosResponse } from "axios";
import { AppError } from "../utils/bootstrappers";

export abstract class ExternalServiceBase<T> {
    protected url: string;
    protected api: AxiosInstance;

    protected constructor(
        private readonly devUrl: string,
        private readonly prodUrl: string,
    ) {
        if (process.env.NODE_ENV === "development") {
            this.url = `${devUrl}`;
        } else {
            this.url = `${prodUrl}`;
        }
        this.api = axios.create({
            baseURL: this.url,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    /**
     * @description Generic GET request
     * @param url - endpoint path
     */
    protected async get<R = T>(url: string): Promise<R> {
        try {
            const result = (await this.api.get(url)) as AxiosResponse<R>;
            return result.data;
        } catch (error: any) {
            throw new AppError(error?.message || `Failed to fetch from ${url}`, error?.response?.status || 500);
        }
    }

    /**
     * @description Generic POST request
     */
    protected async post<R = T>(url: string, body: unknown): Promise<R> {
        try {
            const result = (await this.api.post(url, body)) as AxiosResponse<R>;
            return result.data;
        } catch (error: any) {
            throw new AppError(error?.message || `Failed to post to ${url}`, error?.response?.status || 500);
        }
    }
}
