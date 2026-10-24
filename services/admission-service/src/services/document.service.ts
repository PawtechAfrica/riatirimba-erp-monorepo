import {ModelServiceFw} from "./ModelServiceFw";
import {ApplicantDocuments} from "../database/entities/ApplicantDocument.entity";
import {validateDTO} from "../utils/validateDTO";
import {CreateUpdateApplicantDocDTO} from "../types/DTOs/CreateUpdateApplicantDocDTO";
import {AppError} from "../utils/bootstrappers";
import {Applicants} from "../database/entities/Applicants.entity";
import {BasicEducationEnum} from "../types";


export class DocumentService extends ModelServiceFw<ApplicantDocuments> {
    entity = ApplicantDocuments;
    baseFields = ['birthCertificate', 'passportPhoto', 'kcpeCertificate'] satisfies (keyof ApplicantDocuments)[]

    async getExtraFields(args: ApplicantDocuments): Promise<(keyof ApplicantDocuments)[]> {
        let base: (keyof ApplicantDocuments)[] = []
        if (!this.em) return base
        // get applicant data
        // const applicant = await this.em.findOne(Applicants, args.applicant, {fields: ['idType', 'academicHistory.highestEducationLevel']})
        const applicant = await this.em.findOne(Applicants, args.applicant, {fields: ['birthCertNumber', 'academicHistory.highestEducationLevel']})
        if (!applicant) return base;
        // if (applicant.idType === IdTypeEnum.NATIONAL_ID)
        //     base.push('nationalId')
        if (applicant.birthCertNumber)
            base.push('nationalId')
        if (applicant.academicHistory.highestEducationLevel === BasicEducationEnum.HIGH_SCHOOL)
            base.push('kcseCertificate')
        if (applicant.academicHistory.highestEducationLevel === BasicEducationEnum.TERTIARY)
            base.push('kcseCertificate', 'tertiaryCertificate')
        return base
    }

    // todo: basically re-write all of this
    async updateDocument(data: any, userId: string) {
        if (!this.repo || !this.em)
            throw new AppError("Unable to update document at this time!");
        // validate
        // const validated = await validateDTO(CreateApplicantDocDTO, data)
        const validated = await validateDTO(CreateUpdateApplicantDocDTO, data)
        const created = this.repo.create({...validated, applicant: userId ?? ""})
        await this.em.persist(created).flush()
        return created
    }
}


