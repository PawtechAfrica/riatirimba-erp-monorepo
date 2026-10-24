import { AxiosError, AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, Observable } from 'rxjs';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export abstract class ExternalService {
    protected readonly logger: Logger;

    protected constructor(protected readonly api: HttpService) {
        this.logger = new Logger(this.constructor.name);
    }
    async request<T>(
        method: 'get' | 'post' | 'delete' = 'get',
        url: string,
        data?: any,
        errorMessage: string = 'Something went wrong when calling url',
    ): Promise<AxiosResponse<T>> {
        return firstValueFrom(
            this.api[method](url, data).pipe(
                catchError((err: AxiosError) => {
                    this.logger.error(err.response?.data || errorMessage);
                    throw err;
                }),
            ) as Observable<AxiosResponse<T>>,
        );
    }
}
