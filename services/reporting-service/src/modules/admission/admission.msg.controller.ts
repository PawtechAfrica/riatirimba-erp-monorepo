import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { Channel, Message } from 'amqplib';
import type { ApplicantObj } from './@types';
import { AdmissionService } from './admission.service';

@Controller()
export class AdmissionMsgController {
    constructor(private readonly admissionService: AdmissionService) {}

    @EventPattern('applicant_created')
    async applicantCreated(
        @Payload() data: string, // applicant ID as a string
        @Ctx() context: RmqContext,
    ) {
        // get the messages and what not
        const channel = context.getChannelRef() as Channel;
        const originalMsg = context.getMessage() as Message;

        try {
            // Fetch applicant from applicant service
            await this.admissionService.createApplicantRecord(data);
            channel.ack(originalMsg);
        } catch (e) {
            console.log('\tError creating applicant record:\n\t', e);
            channel.nack(originalMsg, false, false);
        }
    }
    @EventPattern('applicant_updated')
    async applicantUpdated(
        @Payload() data: ApplicantObj, // applicant ID as a string
        @Ctx() context: RmqContext,
    ) {
        // get the messages and what not
        const channel = context.getChannelRef() as Channel;
        const originalMsg = context.getMessage() as Message;

        try {
            // Fetch applicant from applicant service
            await this.admissionService.updateApplicantRecord(data);
            channel.ack(originalMsg);
        } catch (e) {
            console.log('\tError updating applicant record:\n', e);
            channel.nack(originalMsg, false, false);
        }
    }
}
