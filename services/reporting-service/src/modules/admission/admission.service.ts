import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdmissionExtService } from 'src/common/extServices/admissionExt.service';
import { In, Repository } from 'typeorm';
import { UpdateResult } from 'typeorm/browser';
import type { ApplicantObj } from './@types';
import { ApplicantRecords } from './entities/applicants.entity';
import flattenApplicant from './utils/flattenApplicant';
import { GenApplicantsDto } from './dto/gen-applicants.dto';
import { APPLICANT_RECORD_KEYS } from './entities/admission.static';
import { PrintService } from '../../common/print/print.service';
import { CustomException } from '../../common/lib/exceptions/custom.exception';

@Injectable()
export class AdmissionService {
    private readonly logger = new Logger(AdmissionService.name);
    constructor(
        @InjectRepository(ApplicantRecords)
        private readonly repo: Repository<ApplicantRecords>,
        private readonly admissionExt: AdmissionExtService,
        private readonly printService: PrintService,
    ) {}

    async sync(): Promise<void> {
        // fetch all records and update in the db
        const allApplicants = await this.admissionExt.getAllApplicants();
        let failures = 0;
        for (const applicant of allApplicants) {
            try {
                await this.updateApplicantRecord(applicant);
            } catch (error) {
                failures += 1;
                console.log((error as unknown as Error)?.message);
            }
        }
        console.log(
            `\t♻ Admission Service sync complete: ${failures > 0 ? failures : 0}/${allApplicants.length} failure rate`,
        );
    }
    async allRecords() {
        return await this.repo.find();
    }

    async generateExcel(body: GenApplicantsDto) {
        // sync records first
        await this.sync().catch((err) => {
            // silently fail to not prevent the process
            this.logger.error(err);
        });
        // fetch applicants based on the result
        const list = await this.repo.find({
            where: {
                ...(body.idList.length > 0 ? { id: In(body.idList) } : {}),
                ...(body.filters.courses.length > 0
                    ? { course: In(body.filters.courses) }
                    : {}),
                ...(body.filters.intakes.length > 0
                    ? { intake: In(body.filters.intakes) }
                    : {}),
                ...(body.filters.approved != null
                    ? { pending: !!body.filters.approved }
                    : {}),
                ...(body.filters.gender != null
                    ? { gender: body.filters.gender }
                    : {}),
                ...(body.filters.newApplicant != null
                    ? { newApplicant: !!body.filters.newApplicant }
                    : {}),
                // courses,
                // intakes,
                // approved,
                // gender,
                // newApplicant,
            },
            select: body.fields.length > 0 ? body.fields : undefined,
        });
        if (list.length === 0)
            throw new CustomException(
                'No applicants found with the given filters',
            );
        // assuming no keys were passed, then just give all keys
        const keys =
            body.fields.length > 0 ? body.fields : APPLICANT_RECORD_KEYS;
        // generate the blob
        return await this.printService.printToExcel(keys, list);
    }

    cleanApplicantData(data: Partial<ApplicantObj>) {
        if ('documents' in data) delete data.documents;
        if ('age' in data) delete data.age;
        return data;
    }

    async createApplicantRecord(
        applicant_id: string,
    ): Promise<ApplicantRecords | void> {
        // check if the applicant exists in the db
        const exists = await this.repo.findOneBy({ id: applicant_id });
        if (exists) return;
        // fetch applicant from service
        const applicant = await this.admissionExt.getApplicant(applicant_id);
        const cleaned = this.cleanApplicantData(applicant);
        // flatten the object
        const flattened = flattenApplicant(cleaned);
        // save to the db
        console.log(flattened);
        const created = this.repo.create(flattened);
        return await this.repo.save(created);
    }

    async updateApplicantRecord(
        applicant: Partial<ApplicantObj>,
    ): Promise<UpdateResult | void> {
        // check the applicant exists
        const exists = await this.repo.findOneBy({ id: applicant.id });
        if (!exists) {
            if (applicant.id) {
                // create instead
                await this.createApplicantRecord(applicant.id);
                return;
            }
            return;
        }
        const cleaned = this.cleanApplicantData(applicant);
        const flattened = flattenApplicant(cleaned);
        return await this.repo.update({ id: exists.id }, flattened);
    }
}
