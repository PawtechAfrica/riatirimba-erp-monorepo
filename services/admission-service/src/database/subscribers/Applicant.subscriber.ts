// applicant.subscriber.ts
import {EventArgs, EventSubscriber} from "@mikro-orm/core";
import {Applicants} from "../entities/Applicants.entity";
import {Address} from "../entities/Address.entity";
import {NextOfKin} from "../entities/NextOfKin.entity";
import {AcademicHistory} from "../entities/AcademicHistory.entity";
import {Enrollment} from "../entities/Enrollment.entity";
import {ApplicantDocuments} from "../entities/ApplicantDocument.entity";
import {BasicEducationEnum} from "../../types";

type AllApplicantModelsType = Applicants | Address | NextOfKin | AcademicHistory | Enrollment | ApplicantDocuments

export class ApplicantSubscriber implements EventSubscriber<AllApplicantModelsType> {
    getSubscribedEntities() {
        return [Applicants, Address, NextOfKin, AcademicHistory, Enrollment, ApplicantDocuments];
    }

    // todo: Enhance error handling
    private async calculateCompletion(ev: EventArgs<AllApplicantModelsType>) {
        try {
            const applicant = ev.entity instanceof Applicants ? ev.entity : await ev.em.findOne(Applicants, ev.entity.applicant)
            if (!applicant)
                return
            if (ev.changeSet?.originalEntity &&
                ev.changeSet.payload?.completionStatus !== undefined) {
                return;
            }

            // Make sure all relations are populated
            await ev.em.populate(applicant, [
                'address',
                'academicHistory',
                'enrollments',
                'documents',
                'nextOfKins',
            ]);

            let completedCount = 0;
            let totalRequiredCount = 0;

            const isVal = (val: any): boolean => {
                if (val === null || val === undefined) return false;
                if (typeof val === 'string') return val.trim().length > 0;
                if (typeof val === 'number') return !Number.isNaN(val);
                return true;
            };

            // 1. Applicants
            const applicantFields = ['firstName', 'lastName', 'email', 'birthCertNumber', 'gender', 'birthDay'] as const;
            totalRequiredCount += applicantFields.length;
            for (const field of applicantFields) {
                if (isVal(applicant[field])) {
                    completedCount++;
                }
            }

            // NextOfKins has at least one NextOfKin requirement (counted in Applicants model check)
            const nextOfKins = applicant.nextOfKins ? applicant.nextOfKins.getItems() : [];
            totalRequiredCount += 1;
            if (nextOfKins.length > 0) {
                completedCount++;
            }

            // 2. NextOfKin model: firstName, lastName, email or phone, relationship
            // This is required since we must have at least one NextOfKin
            totalRequiredCount += 4;
            if (nextOfKins.length > 0) {
                const kin = nextOfKins[0];
                if (isVal(kin.firstName)) completedCount++;
                if (isVal(kin.lastName)) completedCount++;
                if (isVal(kin.relationship)) completedCount++;
                if (isVal(kin.email) || isVal(kin.phone)) completedCount++;
            }

            // 3. ApplicantDocuments: kcpeCertificate, birthCertificate, passportPhoto
            totalRequiredCount += 3;
            if (applicant.documents) {
                if (isVal(applicant.documents.kcpeCertificate)) completedCount++;
                if (isVal(applicant.documents.birthCertificate)) completedCount++;
                if (isVal(applicant.documents.passportPhoto)) completedCount++;
            }

            // 4. AcademicHistory
            totalRequiredCount += 1; // highestEducationLevel is always required
            const highestEducationLevel = applicant.academicHistory?.highestEducationLevel;
            if (isVal(highestEducationLevel)) {
                completedCount++;
            }

            if (highestEducationLevel === BasicEducationEnum.PRIMARY_SCHOOL) {
                totalRequiredCount += 2;
                if (isVal(applicant.academicHistory?.kcpeIndexNumber)) completedCount++;
                if (isVal(applicant.academicHistory?.primarySchool)) completedCount++;
            } else if (highestEducationLevel === BasicEducationEnum.HIGH_SCHOOL) {
                totalRequiredCount += 3;
                if (isVal(applicant.academicHistory?.primarySchool)) completedCount++;
                if (isVal(applicant.academicHistory?.kcpeIndexNumber)) completedCount++;
                if (isVal(applicant.academicHistory?.highSchool)) completedCount++;
            } else if (highestEducationLevel === BasicEducationEnum.TERTIARY) {
                totalRequiredCount += 7;
                if (isVal(applicant.academicHistory?.primarySchool)) completedCount++;
                if (isVal(applicant.academicHistory?.kcpeIndexNumber)) completedCount++;
                if (isVal(applicant.academicHistory?.highSchool)) completedCount++;
                if (isVal(applicant.academicHistory?.kcseIndexNumber)) completedCount++;
                if (isVal(applicant.academicHistory?.kcseGrade)) completedCount++;
                if (isVal(applicant.academicHistory?.tertiarySchool)) completedCount++;
                if (isVal(applicant.academicHistory?.tertiaryLevel)) completedCount++;
            }

            // 5. Enrollment: All fields completed (only user-input fields)
            const isNew = applicant.enrollments?.newApplicant !== false;
            if (isNew) {
                totalRequiredCount += 5;
                if (applicant.enrollments) {
                    if (isVal(applicant.enrollments.course)) completedCount++;
                    if (applicant.enrollments.intake !== null && applicant.enrollments.intake !== undefined) completedCount++;
                    if (applicant.enrollments.newApplicant !== null && applicant.enrollments.newApplicant !== undefined) completedCount++;
                    if (isVal(applicant.enrollments.studentType)) completedCount++;
                    if (isVal(applicant.enrollments.examiningBody)) completedCount++;
                }
            } else {
                totalRequiredCount += 7;
                if (applicant.enrollments) {
                    if (isVal(applicant.enrollments.course)) completedCount++;
                    if (applicant.enrollments.intake !== null && applicant.enrollments.intake !== undefined) completedCount++;
                    if (applicant.enrollments.newApplicant !== null && applicant.enrollments.newApplicant !== undefined) completedCount++;
                    if (isVal(applicant.enrollments.studentType)) completedCount++;
                    if (isVal(applicant.enrollments.examiningBody)) completedCount++;
                    if (isVal(applicant.enrollments.admissionNumber)) completedCount++;
                    if (isVal(applicant.enrollments.yearOfStudy)) completedCount++;
                }
            }

            // 6. Address: all fields
            totalRequiredCount += 6;
            if (applicant.address) {
                if (isVal(applicant.address.county)) completedCount++;
                if (isVal(applicant.address.location)) completedCount++;
                if (isVal(applicant.address.subLocation)) completedCount++;
                if (isVal(applicant.address.village)) completedCount++;
                if (isVal(applicant.address.poBox)) completedCount++;
                if (isVal(applicant.address.zipCode)) completedCount++;
            }

            const ratio = completedCount / totalRequiredCount;
            applicant.completionStatus = Math.floor((Number.isNaN(+ratio) ? 0 : ratio) * 100);
            await ev.em.transactional(async (em) => {
                await em.persist(applicant).flush();
            });
        } catch (err) {
            console.log(err);
        }
    }

    async afterCreate(ev: EventArgs<AllApplicantModelsType>) {
        await this.calculateCompletion(ev)
            .catch((err) => {
                console.log("HANDLE ME: ", err);
            });
    }

    async afterUpdate(ev: EventArgs<AllApplicantModelsType>) {
        await this.calculateCompletion(ev)
            .catch((err) => {
                console.log("HANDLE ME: ", err);
            });
    }

    async afterUpsert(ev: EventArgs<AllApplicantModelsType>) {
        await this.calculateCompletion(ev)
            .catch((err) => {
                console.log("HANDLE ME: ", err);
            });
    }

    async afterDelete(ev: EventArgs<AllApplicantModelsType>) {
        if (ev.entity instanceof Applicants) {
            return;
        }
        await this.calculateCompletion(ev)
            .catch((err) => {
                console.log("HANDLE ME: ", err);
            });
    }
}
