import { Injectable, Logger } from '@nestjs/common';
import { type ISendMailOptions, MailerService } from '@nestjs-modules/mailer';

export interface iSendOptions extends ISendMailOptions {
    template: 'admission.welcome' | 'fee.reminder';
}

@Injectable()
export class MailService {
    constructor(private readonly mailerService: MailerService) {}

    async send(payload: ISendMailOptions) {
        // todo: consider better error handling
        await this.mailerService.sendMail(payload).catch((err) => {
            Logger.error(err);
        });
    }
}
