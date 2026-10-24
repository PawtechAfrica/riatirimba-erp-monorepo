/**
 * Every route to deal with admission
 */
// todo: Move applicant migration to admission service and controller

import { Router } from "express";
import { AdmissionController } from "../../controllers/admission.controller";
import admissionService from "../../services/admission.service";
import validateSchema from "../../middleware/schema.middleware";
import admissionSchema from "../../schema/admission.schema";

const admissionRoutes = Router();
const controller = new AdmissionController(admissionService);

admissionRoutes
    .get("/admission-letter/email/:student_id", controller.triggerAdmissionEmail)
    .get(
        "/admission-letter/download/:applicant_id/:intake_period",
        validateSchema(admissionSchema.downloadAdmissionLetterSchema),
        controller.downloadAdmissionLetter,
    );

export default admissionRoutes;
