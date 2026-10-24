import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdmissionModule } from './modules/admission/admission.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncModule } from './common/sync/sync.module';
import { PrintModule } from './common/print/print.module';
import { MailModule } from './modules/mail/mail.module';

@Module({
    imports: [
        SyncModule,
        AdmissionModule,
        PrintModule,
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        // src/app.module.ts
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                type: 'postgres',
                host: config.get<string>('REPORTING_DB_HOST'),
                port: config.get<number>('REPORTING_DB_PORT'),
                username: config.get<string>('REPORTING_DB_USER'),
                password: config.get<string>('REPORTING_DB_PASSWORD'),
                database: config.get<string>('REPORTING_DB_NAME'),
                entities: [__dirname + '/**/*.entity{.ts,.js}'],
                synchronize: false, // Only for development!
                // This is a key nuance:
                // It tells TypeORM to look through all your folders for files ending in .entity.ts
                autoLoadEntities: true,
            }),
        }),
        AdmissionModule,
        MailModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
