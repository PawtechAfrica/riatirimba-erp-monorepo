// src/external-services/BaseService.ts
import axios, { AxiosInstance, AxiosResponse } from "axios";
import { AppError } from "../utils/AppErrorClasses";

export abstract class BaseServiceClient {
	private api: AxiosInstance;

	protected constructor(protected readonly baseURL: string) {
		this.api = axios.create({ baseURL });
	}

	/**
	 * @description Generic GET request
	 * @param url - endpoint path
	 */
	protected async get<R>(url: string): Promise<R> {
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
	protected async post<R>(url: string, body: unknown): Promise<R> {
		try {
			const result = await this.api.post<R>(url, body);
			return result.data;
		} catch (error: any) {
			throw new AppError(error?.message || `Failed to post to ${url}`, error?.response?.status || 500);
		}
	}

	// 🔹 you can add put(), delete() similarly
}
