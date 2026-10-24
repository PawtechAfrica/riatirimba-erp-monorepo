import { NestFactory } from '@nestjs/core';
import { RmqOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import dotenv from 'dotenv';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { AppExceptionFilter } from './libs/utils/httpCatch';

dotenv.config();

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const whitelist = ['http://localhost:3000'];
    app.enableCors({
        origin: whitelist, // Or an array: ['http://site1.com', 'http://site2.com']
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        allowedHeaders:
            'Content-Type, Accept, Authorization, Content-Disposition',
        exposedHeaders: 'Content-Disposition',
        credentials: true, // Required if you are sending cookies/sessions
    } as CorsOptions);
    app.connectMicroservice<RmqOptions>({
        transport: Transport.RMQ,
        options: {
            urls: [process.env.RABBIT_URL || 'amqp://localhost:5672'],
            queue: 'reporting_que',
            queueOptions: {
                durable: true,
                arguments: {
                    'x-dead-letter-exchange': 'reporting_dlx', // The exchange for failures
                    'x-dead-letter-routing-key': 'reporting-service-failure', // The routing key for failures
                },
            },
            noAck: false,
        },
    });

    await app.startAllMicroservices();
    app.setGlobalPrefix('api/v1');

    // Catch all HTTP exceptions
    app.useGlobalFilters(new AppExceptionFilter());
    await app.listen(process.env.PORT || 5006).then(() => {
        console.log(`🚀 Server started on port ${process.env.PORT}!`);
    });
}
bootstrap().catch((err) => {
    console.error(err);
});
