import {Connection, EntityManager, IDatabaseDriver, RequestContext} from "@mikro-orm/core";
import {Applicants} from "../database/entities/Applicants.entity";
import {studentService} from "../external-services";
import {ReadyApplicantObj} from "../types";
import {AppError} from "../utils/bootstrappers";
import {db} from "../database/utils/db-bootstrap.util";
import {validateDTO} from "../utils/validateDTO";
import ReadyApplicantDto from "../types/DTOs/readyStudent.dto";
import {AdmissionErrors} from "../database/entities/admissionErrors.entity";


export class AdmissionService {
    protected get em() {
        const context = RequestContext.getEntityManager();
        // todo: Add a notification to the devs here
        if (!context) throw new AppError("Unable to process your request at this time. Please try again later.")
        return context;
    }

    canMigrate(ap: Applicants) {
        const profile =
            !!ap.firstName &&
            !!ap.lastName &&
            !!ap.phone &&
            !!ap.email &&
            !!ap.birthCertNumber &&
            !!ap.idNumber &&
            !!ap.gender &&
            !!ap.birthDay;
        const acHistory = !!ap.enrollments.intake && !!ap.enrollments.course;
    }

    /*
     * @description - Approves all applicants in the list
     */
    async approveApplication(applicantIds: string[]) {
        if (!this.em) throw new AppError("Unable to approve applicants at this time");
        if (applicantIds.length < 1) throw new AppError("Select at least one applicant!");
        // approve all of them
        const found = await this.em.find(Applicants, {
            $and: [{id: {$in: applicantIds}}, {submitted: true}]
        });
        for (const item of found) {
            // validate all required fields
            item.pending = true;
        }
        await this.em.persist(found).flush();
        return found;
    }

    async migrateApplicants() {
        try {
            console.log("\t🐃 Migrating...");
            // Find all approved applicants and migrate them to students
            // create a fork to run the migration in a separate transaction
            let em: EntityManager<IDatabaseDriver<Connection>> | undefined = this.em
                ? this.em.fork() : db.em.fork();
            if (!em) throw new AppError("\t⚠Unable to migrate applicants at this time");

            const pendingApplicants = await em.find(Applicants,
                {pending: true, submitted: true, migrated: false});

            if (pendingApplicants.length < 1) return console.log("\t🆓 No applicants to migrate.");
            // reshape the input
            const readyApplicants = [];
            for (const applicant of pendingApplicants) {
                try {
                    const validated = await validateDTO(ReadyApplicantDto, applicant.toObject())
                    const docList = Object.keys(validated.documents)
                        .filter((k) => k != "id" && typeof validated.documents[k as keyof typeof validated.documents] === "string")
                        .map((key) => ({
                            documentKey: key,
                            url: validated.documents[key as keyof typeof validated.documents],
                        }));
                    readyApplicants.push({
                        ...validated,
                        enrollments: [validated.enrollments],
                        // only take complete next of kins
                        nextOfKins: validated.nextOfKins.filter(
                            (kin) => !!kin.firstName && !!kin.lastName && !!kin.phone && !!kin.relationship,
                        ),
                        documents: docList
                    });
                    if (applicant.admissionErrors) applicant.admissionErrors.errors = []
                } catch (err) {
                    if (err instanceof AppError) {
                        if (!applicant.admissionErrors)
                            applicant.admissionErrors = em.create(AdmissionErrors, {
                                errors: err.validations || [],
                                applicant: applicant
                            })
                        em.assign(applicant.admissionErrors!, {
                            errors: err.validations || []
                        })
                    }
                }
                await em.persist(applicant).flush();
            }
            const result = await studentService.createMany(readyApplicants as unknown as ReadyApplicantObj[]);
            for (const ready of result.success) {
                await em.nativeUpdate(Applicants, {phone: ready.phone}, {migrated: true});
            }
            await em.flush();
            // await em.persistAndFlush(readyApplicants)
        } catch (err) {
            console.log("\tError migrating applicants: \n", err)
        }
    }
}
