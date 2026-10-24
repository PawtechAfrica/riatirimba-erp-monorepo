import express from "express";
import { applicantController } from "../../controllers";
import { verifyJWT } from "../../middleware/verifyJWT";
import { validateRequest } from "../../middleware/validateRequest";
import applicantSchema from "../../schemas/applicant.schema";

const applicantRoutes = express.Router();

applicantRoutes
    .get("/fetch/:id", applicantController.getApplicantById)
    .get(
        "/all",
        verifyJWT("fetch_all_applicants"),
        validateRequest(applicantSchema.fetchApplicantsSchema),
        applicantController.getAllByPage,
    )
    .get("/export-to-excel", applicantController.exportToExcel)
    .get("/search", applicantController.globalSearch)

    .post("/signup", applicantController.applicantSignup)
    .post("/login", applicantController.applicantLogin)
    .post("/new", applicantController.createApplicant)

    .post("/update/:step/:id", applicantController.updateApplicant)
    .post("/resolve-error", applicantController.markErrorResolved)
    .post("/submit/:id", applicantController.finalSubmission)

    .post("/delete", applicantController.softDelete)
    .post("/hard-delete", applicantController.hardDelete)

    .delete("/next-of-kin/:id", applicantController.deleteApplicantNextOfKin);

export default applicantRoutes;
