import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { CustomException } from '../../common/lib/exceptions/custom.exception';

@Catch(HttpException)
export class AppExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();

        const message =
            exception instanceof CustomException
                ? exception.message
                : 'Internal server error';
        response.set({});
        response.status(status).json({
            statusCode: status,
            error: message,
        });
    }
}
