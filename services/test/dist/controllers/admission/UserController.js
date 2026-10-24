"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateApplication = exports.getApplicantById = exports.getAllApplicants = exports.applicantLogin = exports.createApplicant = void 0;
const bootstrappers_1 = require("../../utils/bootstrappers");
const index_1 = require("../../index");
const Applicant_entity_1 = require("../../database/entities/Applicant.entity");
const NextOfKin_entity_1 = require("../../database/entities/NextOfKin.entity");
const saveFileToDisk_1 = require("../../utils/saveFileToDisk");
const Intake_entity_1 = require("../../database/entities/Intake.entity");
exports.createApplicant = (0, bootstrappers_1.tryCatch)(async (req, res, next) => {
    const { firstName, lastName, phone, email, kcseIndexNumber, nextOfKin, documents } = req.body;
    // check there is an open intake
    const openIntake = await index_1.api.em.findOne(Intake_entity_1.Intake, { status: Intake_entity_1.IntakeStatus.OPEN });
    if (!openIntake)
        throw new bootstrappers_1.AppError("Oops, we currently don't have an intake, look out for the upcoming intake");
    const missingReqField = !firstName || !lastName || !phone || !email || !kcseIndexNumber;
    if (missingReqField)
        throw new bootstrappers_1.AppError("First name, last name, phone, email and  KCSE IndexNumber are required!");
    const newApplicant = new Applicant_entity_1.Applicant(firstName, lastName, email, phone, kcseIndexNumber);
    newApplicant.intake = openIntake;
    // create next of kin
    if (nextOfKin && Object.values(nextOfKin).length === 5) {
        const { firstName, lastName, email, phone, relationship } = nextOfKin;
        newApplicant.nextOfKin = new NextOfKin_entity_1.NextOfKin(firstName, lastName, email, phone, relationship);
    }
    newApplicant.documents = {};
    // handle documents
    if (documents) {
        for (const key of Object.keys(documents)) {
            const fileIn64 = documents[key];
            if (fileIn64)
                documents[key] = await (0, saveFileToDisk_1.convertBase64ToFile)(fileIn64);
        }
    }
    // save
    await index_1.api.em.persistAndFlush(newApplicant);
    res.status(200).json({
        message: `Applicant created successfully.`,
        data: newApplicant,
    });
});
exports.applicantLogin = (0, bootstrappers_1.tryCatch)(async (req, res) => {
    const { email, kcseIndexNumber } = req.body;
    if (!email || !kcseIndexNumber)
        throw new bootstrappers_1.AppError("All fields are required!");
    const found = await index_1.api.em.findOne(Applicant_entity_1.Applicant, {
        $and: [{ email }, { kcseIndexNumber }]
    }, { populate: ["documents", "nextOfKin"] });
    if (!found)
        throw new bootstrappers_1.AppError("Invalid index number or email");
    res.status(200).json({
        message: "Welcome back",
        data: found
    });
});
exports.getAllApplicants = (0, bootstrappers_1.tryCatch)(async (_req, res) => {
    const applicants = await index_1.api.em.findAll(Applicant_entity_1.Applicant, { populate: ['nextOfKin', 'documents'] });
    res.status(200).json(applicants);
});
exports.getApplicantById = (0, bootstrappers_1.tryCatch)(async (req, res) => {
    const id = req.params['id'];
    if (!id)
        throw new bootstrappers_1.AppError("No ID provided!");
    const found = await index_1.api.em.findOne(Applicant_entity_1.Applicant, { id });
    if (!found)
        throw new bootstrappers_1.AppError("Applicant not found!");
    res.status(200).json(found);
});
exports.updateApplication = (0, bootstrappers_1.tryCatch)(async (req, res) => {
    const id = req.params['id'];
    if (!id)
        throw new bootstrappers_1.AppError("No ID provided!");
    const found = await index_1.api.em.findOne(Applicant_entity_1.Applicant, { id });
    if (!found)
        throw new bootstrappers_1.AppError("Applicant with this ID not found!");
    const clientData = req.body; // as Partial<ApplicantData>
    console.log("Client data: ", clientData);
    index_1.api.em.assign(found, clientData);
    await index_1.api.em.persistAndFlush(found);
    res.status(200).json({
        message: "Application updated",
        data: found
    });
});
//# sourceMappingURL=UserController.js.map