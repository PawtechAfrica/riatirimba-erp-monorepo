import express from "express";
import * as admission from "../../services/admission";
import {fileUpload} from "../../middleware/fileUpload";
import {verifyJWT} from "../../middleware/verifyJWT";
import {multerParse} from "../../utils/bootstrappers";
import {ApplicantDocuments} from "../../database/entities/ApplicantDocument.entity";
import {admissionService} from "../../services";
import {AdmissionController} from "../../controllers/admission.controller";
import {applicantController} from "../../controllers";

const admissionRoutes = express.Router();

const handler = new AdmissionController(admissionService);

admissionRoutes
    .get("/live-stats", verifyJWT("read_live_statistics"), admission.liveStatistics)
    .get("/statistics", admission.admissionStatistics)
    .get("/applicant/:id", admission.fetchApplicantById)
    .get("/filter", admission.admissionFilter)

    // .post("/applicant", admission.createApplicant)
    .post("/login", admission.applicantLogin)
    .post("/delete-file", admission.applicantDeleteFile)

    .post("/approve-applications", verifyJWT("approve_applicants"), handler.approveApplications)
    .post("/final-submission", admission.finalSubmission)

    .post("/delete-applicants", verifyJWT("delete_applicant"), admission.deleteApplicants)
    // /:id here refers to applicant id
    .post("/admin-patch-applicant/:step/:id", verifyJWT('update_applicant'), applicantController.updateApplicant)
    .patch("/applicant/:id",
        multerParse().fields([
            {name: "passportPhoto", maxCount: 1},
            {name: "nationalId", maxCount: 1},
            {name: "birthCertificate", maxCount: 1},
            {name: "tertiaryCertificate", maxCount: 1},
            {name: "kcseCertificate", maxCount: 1},
            {name: "kcpeCertificate", maxCount: 1},
        ] satisfies { name: keyof ApplicantDocuments; maxCount: number }[]),
        // todo: Save files immediately after getting b2-filename from file-service
        fileUpload(),
        admission.updateApplication,
    );

export default admissionRoutes;
