import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AdmissionService } from '../../modules/admission/admission.service';

@Injectable()
export class SyncService implements OnModuleInit {
    private readonly logger = new Logger(SyncService.name);
    async onModuleInit() {
        await this.syncRecords();
    }

    constructor(private readonly admissionService: AdmissionService) {}

    async syncRecords() {
        // fetch applicants from application service
        await this.admissionService.sync().catch((err) => {
            this.logger.error(err);
        });
    }
}
