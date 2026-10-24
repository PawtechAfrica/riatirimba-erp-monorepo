import express from "express";
import intakesRoutes from "./intakes.routes";
import admissionRoutes from "./admission.routes";
import sharedRoutes from "./shared.routes";
import applicantRoutes from "./applicant.routes";
import statRoutes from "./stat.routes";
import internalRoutes from "./internal.routes";


const v1Routes = express.Router();

v1Routes
    .use("/shared", sharedRoutes)
    .use("/applicants", applicantRoutes)
    .use("/admission", admissionRoutes)
    .use("/intakes", intakesRoutes)
    .use('/stats', statRoutes)
    .use('/internal', internalRoutes)

export default v1Routes;
