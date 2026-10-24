// src/config/mailer.config.ts
import { MailerOptions } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/adapters/ejs.adapter';
import { ConfigService } from '@nestjs/config';

export const mailerConfig = (configService: ConfigService): MailerOptions => ({
    transport: {
        host: configService.get<string>('SMTP_HOST'),
        port: configService.get<number>('SMTP_PORT'),
        secure: !!configService.get<boolean>('SMTP_SECURE'), // true for 465, false for other ports
        auth: {
            user: configService.get<string>('SMTP_USER'),
            pass: configService.get<string>('SMTP_PASS'),
        },
        // Production settings
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        rateDelta: 1000,
        rateLimit: 5,
    },
    defaults: {
        from: `"${configService.get<string>('Riatirimba TVC')}" <${configService.get<string>('MAIL_FROM_ADDRESS')}>`,
    },
    template: {
        dir: process.cwd() + '/src/modules/email/templates',
        adapter: new EjsAdapter(),
        options: {
            strict: true,
        },
    },
});
