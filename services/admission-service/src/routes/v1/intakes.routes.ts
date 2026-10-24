import express from "express";
import handler from "../../services/intakes";
import {IntakeController} from "../../controllers";
import {intakeService} from "../../services";

const intakesRoutes = express.Router();

const controller = new IntakeController(intakeService)

intakesRoutes
    .post("/intake", handler.create.createIntake)
    .post("/batch-create", handler.create.batchCreate)
    .patch("/open/:id", handler.update.openOrCloseIntake)
    .patch("/close/:id", handler.update.openOrCloseIntake)
    .patch("/intake/:key", handler.create.update)
    .get("/intake/:key", handler.read.readByKey)
    // Todo: replace with /all path
    .get("/intakes", handler.read.readAll)
    .get("/all", controller.fetchIntakes);

export default intakesRoutes;
