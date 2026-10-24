import { FilterQuery, FindOptions } from "@mikro-orm/core";
import writeXlsxFile, { Row } from "write-excel-file";
import { AcademicHistory } from "../database/entities/AcademicHistory.entity";
import { Address } from "../database/entities/Address.entity";
import { ApplicantDocuments } from "../database/entities/ApplicantDocument.entity";
import { Applicants } from "../database/entities/Applicants.entity";
import { Enrollment } from "../database/entities/Enrollment.entity";
import { FormSteps } from "../types";
import { ApplicantSignupDTO, CreateApplicantDTO, UpdateApplicantProfileDTO } from "../types/DTOs/applicants.dto";
import { AppError } from "../utils/bootstrappers";
import { ApplicantExportKey, COLUMN_CONFIG } from "../utils/config_constants";
import { standardizeApplicantsForExcel } from "../utils/flattenApplicantForExcel";
import { getExcelType } from "../utils/functions";
import { validateDTO } from "../utils/validateDTO";
import { acHistoryService, addressService, documentService, enrollmentService, nextOfKinService } from "./index";
import { ModelServiceFw } from "./ModelServiceFw";
import { FetchApplicantsSchemaObj } from "../schemas/applicant.schema";
import { Intake } from "../database/entities/Intake.entity";

export class ApplicantService extends ModelServiceFw<Applicants> {
    entity = Applicants;
    // baseFields = ['firstName', 'lastName', 'email', 'phone', 'idType', 'idNumber', 'birthDay', 'gender'] satisfies (keyof Applicants)[]
    baseFields = [
        "firstName",
        "lastName",
        "email",
        "phone",
        "birthCertNumber",
        "birthDay",
        "gender",
    ] satisfies (keyof Applicants)[];

    async finalSubmission(submit: boolean, userId: string) {
        if (!this.em) throw new AppError("Unable to process request at this time! Please try again later!");
        if (!submit) throw new AppError("Please consent and review before submitting the form!");
        const applicant = await this.em.findOne(Applicants, userId, { fields: ["completionStatus", "submitted"] });
        if (!applicant) throw new AppError("Applicant account not found!");
        // ideally shouldn't ever happen - the user is using an unofficial client
        if (applicant.completionStatus < 100)
            throw new AppError("Please complete filling the form before submitting the form!");
        if (applicant.submitted) throw new AppError("Form already submitted!");
        applicant.submitted = submit;
        await this.em.persist(applicant).flush();
        return applicant;
    }

    /* Update the applicant in the different steps */
    async updateApplicantInSteps(userId: string, step: FormSteps, data: any, role?: string) {
        if (!this.repo || !this.em)
            throw new AppError("Unable to update applicant at this time. Please try again!", 500);
        // find the user reference
        const userRef = await this.repo.findOne(userId, { fields: ["id", "submitted"] });
        if (!userRef) throw new AppError("Account not found!");
        if ((userRef.submitted && !role) || role === "applicant")
            throw new AppError(
                "You already submitted your application! No further modification is allowed. If you believe this is a mistake contact IT support",
            );
        const steps = new Set([
            "profile",
            "address",
            "next-of-kin",
            "ac-history",
            "enrollment",
            "docs",
        ]) satisfies Set<FormSteps>;
        if (!steps.has(step as typeof steps extends Set<infer T> ? T : never)) throw new AppError("Invalid step");
        switch (step as typeof steps extends Set<infer T> ? T : never) {
            case "profile":
                console.log("Updating profile");
                return this.updateProfile(data, userRef.id);
            case "address":
                const address = await addressService.repo?.findOne({ applicant: userRef }, { fields: ["id"] });
                return addressService.updateAddress(data, address?.id, userRef.id);
            case "next-of-kin":
                return nextOfKinService.updateNextOfKins(data, userRef.id);
            case "ac-history":
                return acHistoryService.update(data);
            case "enrollment":
                return enrollmentService.update(data, userRef.id);
            default:
                return documentService.updateDocument(data, userRef.id);
        }
    }

    async updateProfile(data: any, userId: string) {
        const validated = await validateDTO(UpdateApplicantProfileDTO, data);
        const found = await this.repo?.findOne({ id: userId });
        if (!found) throw new AppError("Account not found!");
        this.em?.assign(found, validated);
        await this.em?.persist(found).flush();
        return found;
    }

    async applicantSignup({ kcpeIndexNumber, ...data }: ApplicantSignupDTO) {
        if (!this.em) throw new AppError("Sorry, something went wrong! Please try again later!", 500);
        return this.em.transactional(async (em) => {
            const newApplicant = new Applicants();

            const academicHistory = new AcademicHistory();
            academicHistory.kcpeIndexNumber = kcpeIndexNumber;
            academicHistory.applicant = newApplicant;

            const address = em.create(Address, { applicant: newApplicant });
            const enrollments = em.create(Enrollment, { applicant: newApplicant });
            const documents = em.create(ApplicantDocuments, { applicant: newApplicant });
            em.assign(newApplicant, {
                ...data,
                academicHistory,
                address,
                enrollments,
                documents,
            });
            await em.persist(newApplicant).flush();
            return newApplicant;
        });
    }

    async createApplicant(data: CreateApplicantDTO) {
        if (!this.em) throw new AppError("Sorry, something went wrong! Please try again later!", 500);
        return this.em.transactional(async (em) => {
            const { address, academicHistory, nextOfKins, ...rest } = data;
            const newApplicant = em.create(Applicants, { ...rest });
            newApplicant.academicHistory = em.create(AcademicHistory, { ...academicHistory, applicant: newApplicant });
            await em.persist(newApplicant).flush();
            return newApplicant;
        });
    }

    async findAndCount(where: FilterQuery<Applicants>, extras?: FindOptions<Applicants>) {
        const result = await this.em?.findAndCount(Applicants, where, extras);
        if (!result) return [[], 0] as const;
        return result;
    }

    async findByPage(
        page = 1,
        size = 100,
        properties: FetchApplicantsSchemaObj["query"] = {},
    ): Promise<[Applicants[], number]> {
        const offset = (page - 1) * size;
        let { completed, course, department, intake, pending, submitted, gender, migrated, incomplete } = properties;

        let enrollment: Applicants["enrollments"] = {} as Applicants["enrollments"];
        if (course !== undefined) Object.assign(enrollment, { course: { $in: course } });
        if (intake !== undefined) Object.assign(enrollment, { intake: intake as unknown as Intake });

        const where: FilterQuery<Applicants> = {
            ...(Object.keys(enrollment).length > 0 ? { enrollments: enrollment } : {}),
            ...(completed !== undefined ? { completionStatus: { $gte: 100 } } : {}),
            ...(incomplete !== undefined ? { completionStatus: { $lt: 100 } } : {}),
            ...(pending !== undefined ? { $and: [{ pending: !pending }, { completionStatus: { $gte: 100 } }] } : {}),
            ...(submitted !== undefined ? { submitted } : {}),
            ...(gender !== undefined ? { gender } : {}),
            ...(migrated !== undefined ? { migrated } : {}),
        };
        return await this.repo.findAndCount(where, {
            offset: offset,
            limit: size,
        });
    }

    async hardDeleteApplicants(ids: string[]) {
        const applicants = await this.em?.find(
            Applicants,
            { id: { $in: ids } },
            {
                populate: ["nextOfKins", "enrollments", "address"],
                filters: { softDeleted: false },
            },
        );
        if (!applicants) return;
        await this.em?.remove(applicants).flush();
    }

    async softDeleteApplicants(ids: string[]) {
        const applicants = await this.em?.findAll(Applicants, {
            where: {
                $and: [{ id: { $in: ids } }, { deleted: false }],
            },
        });
        if (!applicants) throw new AppError("No applicants found!");
        applicants.forEach((applicant) => this.em?.assign(applicant, { deleted: true }));
        await this.em?.flush();
        return applicants.length;
    }

    async exportApplicantsToExcel(selected: string[]) {
        const list = await this.repo.find(selected.length > 0 ? { id: { $in: selected } } : {}, {
            populate: ["nextOfKins", "enrollments", "address", "academicHistory"],
        });
        return this.exportListToExcel(list);
    }

    async markErrorResolved(applicantId: string, index: number) {
        const found = await this.repo.findOne({ id: applicantId });
        if (!found) throw new AppError("Applicant not found!");
        found.admissionErrors.errors = found.admissionErrors.errors.filter((_, i) => i !== index);
        await this.em?.persist(found).flush();
        return found;
    }

    async globalSearch(searchTerm: string){
        if (!searchTerm || searchTerm.trim().length < 2) return []; // Require at least 2 chars

        const term = searchTerm.trim();
        const queryConditions: any[] = [];

        // ROUTE 1: Is it an email? (Extremely fast exact/prefix match)
        if (term.includes('@')) {
            queryConditions.push({ email: { $ilike: `${term}%` } });
        }
        // ROUTE 2: Is it a Phone Number, ID, or PIN? (Numbers and dashes only)
        else if (/^[\d\+\-]+$/.test(term)) {
            queryConditions.push(
                { phone: { $ilike: `%${term}%` } },
                { idNumber: term }, // Assuming IDs are usually typed fully
                { nationalId: term },
                { birthCertNumber: term },
                { pinNumber: term }
            );
        }
        // ROUTE 3: Is it a Name or Alphanumeric PIN? (Text search)
        else {
            // Break the search term into parts (e.g., "John Doe" -> ["John", "Doe"])
            const terms = term.split(' ').filter(t => t.length > 0);

            if (terms.length === 1) {
                // Single word: Could be first, middle, or last name
                queryConditions.push(
                    { firstName: { $ilike: `${terms[0]}%` } },
                    { lastName: { $ilike: `${terms[0]}%` } },
                    { middleName: { $ilike: `${terms[0]}%` } },
                    { pinNumber: { $ilike: `${terms[0]}%` } } // PINs sometimes have letters
                );
            } else {
                // Multiple words: Likely First Name + Last Name
                // This is a powerful UX trick. If they type "Jane Doe", we look for First: Jane AND Last: Doe
                queryConditions.push({
                    $and: [
                        { firstName: { $ilike: `${terms[0]}%` } },
                        { lastName: { $ilike: `${terms[1]}%` } }
                    ]
                });
            }
        }

        // Execute the query
        return await this.em.find(Applicants, {
            $or: queryConditions
        }, {
            limit: 20, // Keep this small for autocomplete dropdowns!
            orderBy: { createdAt: 'DESC' }
        });
    }

    async exportListToExcel(
        applicants: Applicants[],
        fields: readonly ApplicantExportKey[] = COLUMN_CONFIG.map((k) => k.key),
    ): Promise<Blob> {
        const flatRepo = standardizeApplicantsForExcel(applicants);
        const HEADER_ROW: Row = COLUMN_CONFIG.map((val) => ({ value: val.label, fontWeight: "bold" }));
        const DATA_ROWS: {
            type: StringConstructor | NumberConstructor | BooleanConstructor | DateConstructor;
            value: any;
        }[][] = flatRepo.map((applicant) => {
            return fields.map((key) => ({ type: getExcelType(applicant[key]), value: applicant[key] }));
        });
        const data = [HEADER_ROW, ...DATA_ROWS];
        // write to file
        return writeXlsxFile(data, {});
    }
}
