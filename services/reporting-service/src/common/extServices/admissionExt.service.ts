import { ApplicantObj } from 'src/modules/admission/@types';
import { ExternalService } from '../../libs/utils/classes/ExternalService';
import { HttpService } from '@nestjs/axios';
// import dotenv from 'dotenv';
// dotenv.config();

export class AdmissionExtService extends ExternalService {
    constructor(api: HttpService) {
        super(api);
    }
    async getApplicant(applicant_id: string): Promise<ApplicantObj> {
        const result = await this.request(
            'get',
            `/admission/applicant/${applicant_id}`,
            {},
            `Problem fetching applicant with id ${applicant_id}`,
        );
        return result.data as ApplicantObj;
    }
    async getAllApplicants(): Promise<ApplicantObj[]> {
        // const result = await this.api.get('/admission/applicants');
        const result = await this.request<ApplicantObj[]>(
            'get',
            '/internal/applicants/all',
            {},
            'Something went wrong when fetching all applicants!',
        );
        return result.data;
    }
}
