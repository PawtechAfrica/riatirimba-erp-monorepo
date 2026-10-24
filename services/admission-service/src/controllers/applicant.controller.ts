import {UniqueConstraintViolationException} from "@mikro-orm/postgresql";
import {Readable} from "node:stream";
import {Applicants} from "../database/entities/Applicants.entity";
import eventBus, {AppEvents} from "../events";
// import {rabbitClient} from "../messaging/rabbit";
import {admissionService, applicantService, nextOfKinService} from "../services";
import {ApplicantService} from "../services/applicant.service";
import {FormSteps, PaginatedResponse} from "../types";
import {ApplicantLoginDTO, ApplicantSignupDTO, CreateApplicantDTO} from "../types/DTOs/applicants.dto";
import {AppError, tryCatch} from "../utils/bootstrappers";
import {APPLICANT_FETCH_SIZE} from "../utils/config_constants";
import {validateDTO} from "../utils/validateDTO";
import {FetchApplicantsSchemaObj} from "../schemas/applicant.schema";

class ApplicantController {
    constructor(private service: ApplicantService) {
    }

    finalSubmission = tryCatch(async (req, res) => {
        const {id} = req.params;
        if (typeof id !== "string") throw new AppError("Broken request, please refresh and try again!");
        const {submit} = req.body;
        const applicant = await this.service.finalSubmission(!!submit, id);
        res.status(200).json({
            message:
                "Your submission has been received and will be reviewed. You can no longer modify the information you have provided!",
            data: applicant,
        });
    });

    getApplicantById = tryCatch(async (req, res) => {
        const {id} = req.params;
        if (!id) throw new AppError("Broken request, please refresh and try again!");
        const found = await this.service.repo?.findOne(
            {id},
            {populate: ["academicHistory", "address", "enrollments", "documents", "nextOfKins"]},
        );
        if (!found) throw new AppError("Applicant not found! Login again or try creating an account");
        res.status(200).send(found);
    });

    deleteApplicantNextOfKin = tryCatch(async (req, res) => {
        const {id} = req.params;
        if (!id || typeof id !== "string") throw new AppError("Broken request, please refresh and try again!");
        const result = await nextOfKinService.deleteNextOfKin(id);
        res.status(200).send({
            message: "Deleted successfully",
            data: result,
        });
    });

    updateApplicant = tryCatch(async (req, res) => {
        const {id, step} = req.params;
        if (!id || typeof id !== "string") throw new AppError("Broken request, please refresh and try again!");
        if (!req.body) throw new AppError("Broken request, please refresh and try again!");

        const result = await this.service.updateApplicantInSteps(id, step as FormSteps, req.body, req.user?.role);
        res.status(200)
            .send({
                message: "Updated successfully",
                data: result,
            })
            .end();
    });

    applicantSignup = tryCatch(async (req, res) => {
        try {
            if (!req.body) {
                res.status(400).json({error: "No data provided!"});
                return;
            }
            const validated = await validateDTO(ApplicantSignupDTO, req.body);
            const result = await this.service.applicantSignup(validated);
            res.status(200)
                .json({
                    message: "Account created successfully!",
                    data: result,
                })
                .end();
            // todo: replace with bull-mq
            // await rabbitClient.applicantCreated(result.id);
        } catch (err: unknown) {
            if (err instanceof UniqueConstraintViolationException)
                throw new AppError("An applicant with similar credentials exists! Try logging in.", 400);
            throw err;
        }
    });

    applicantLogin = tryCatch(async (req, res) => {
        if (!req.body) throw new AppError("Please provide email and either KCSE or KCPE Index number", 400);
        const {email, indexNumber} = await validateDTO(ApplicantLoginDTO, req.body);
        // find the user with this email and either KCSE or KCPE index number that matches indexNumber
        const found = await this.service.repo?.findOne(
            {
                $and: [
                    {email},
                    {
                        $or: [
                            {academicHistory: {kcseIndexNumber: indexNumber}},
                            {academicHistory: {kcpeIndexNumber: indexNumber}},
                        ],
                    },
                ],
            },
            {populate: ["nextOfKins", "academicHistory", "documents", "address"]},
        );
        if (!found) throw new AppError("Wrong email or index number! Check your input or try signing up instead!", 400);
        res.status(200).json({
            message: "Welcome back!",
            data: found.toObject(),
        });
    });

    createApplicant = tryCatch(async (req, res) => {
        try {
            if (!req.body) {
                res.status(400).json({error: "No data provided!"});
                return;
            }
            const validated = await validateDTO(CreateApplicantDTO, req.body);
            const result = await this.service.createApplicant(validated);
            res.status(200)
                .json({
                    message: "Account created successfully!",
                    data: result,
                })
                .end();
            // send student to queue
            // todo: replace with bull-mq
            // await rabbitClient.applicantCreated(result.id);
        } catch (err: unknown) {
            if (err instanceof UniqueConstraintViolationException)
                throw new AppError("An applicant with similar credentials exists! Try logging in.", 400);
            throw err;
        }
    });

    getAllApplicants = tryCatch(async (_req, res) => {
        const list = await this.service.repo.findAll({});
        res.status(200).json(list);
    });

    getAllByPage = tryCatch(async (req, res) => {
        eventBus.emit(AppEvents.MIGRATE_APPLICANTS);

        await admissionService.migrateApplicants();
        let {page, ...rest} = req.query as FetchApplicantsSchemaObj["query"];
        const thisPage = page && !Number.isNaN(+page) ? Number(page) : 1;
        const [list, count] = await this.service.findByPage(thisPage, APPLICANT_FETCH_SIZE, rest);

        const response = {
            page: thisPage,
            pageSize: APPLICANT_FETCH_SIZE,
            lastPageIs: Math.ceil(count / APPLICANT_FETCH_SIZE),
            data: list as Applicants[],
        } satisfies PaginatedResponse<Applicants>;

        res.status(200).json(response).end();
    });

    softDelete = tryCatch(async (req, res) => {
        const ids = req.body;
        if (!Array.isArray(ids) || ids.find((id) => typeof id !== "string"))
            throw new AppError("Invalid data provided!");
        const results = await this.service.softDeleteApplicants(ids);
        res.status(200).json({
            message: `Successfully deleted ${results}/${ids.length} applicants`,
            data: ids,
        });
    });

    hardDelete = tryCatch(async (req, res) => {
        const ids = req.body;
        if (!Array.isArray(ids) || ids.find((id) => typeof id !== "string"))
            throw new AppError("Invalid data provided!");
        await this.service.hardDeleteApplicants(ids);
        res.status(200).json({
            message: `Successfully deleted ${ids.length} applicants`,
        });
    });

    exportToExcel = tryCatch(async (_req, res) => {
        const blob = await this.service.exportApplicantsToExcel([]);
        res.setHeader("Content-Type", blob.type || "application/octet-stream");
        res.setHeader("Content-Disposition", `attachment; filename="applicants-${new Date()}.xlsx"`);

        // Convert Blob → stream → response
        Readable.from(blob.stream()).pipe(res);
    });

    markErrorResolved = tryCatch(async (req, res) => {
        const {applicantId, index} = req.body;
        if (!applicantId || typeof index !== "number") throw new AppError("Invalid data provided!");
        const result = await this.service.markErrorResolved(applicantId, index);
        res.status(200).json({
            message: "Successfully marked error resolved",
            data: result,
        });
    });

    globalSearch = tryCatch(async (req, res) => {
        const {search} = req.query;
        if (typeof search === 'object') return res.status(200).json({message: "Invalid search", data: []})
        if (!search) return res.status(200).json({message: "Empty search", data: []})
        if (search.toString().length < 3) return res.status(200).json({message: "Too short", data: []})

        const results = await this.service.globalSearch(search)

        return res.status(200).json({
            message: "Success",
            data: results
        })
    })
}

export const applicantController = new ApplicantController(applicantService);
