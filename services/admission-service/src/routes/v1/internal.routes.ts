import express from "express";
import {applicantController} from "../../controllers";


const internalRoutes = express.Router();

// const applicantRoutes = new ApplicantController(applicantService);

internalRoutes
    .get('/applicants/all', applicantController.getAllApplicants)

export default internalRoutes;