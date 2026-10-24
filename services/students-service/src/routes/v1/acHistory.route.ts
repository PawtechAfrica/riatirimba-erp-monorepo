import express from "express";
import {AcHistoryController} from "../../controllers/acHistory.controller";
import {academicHistoryService} from "../../services";


const acHistoryRoutes = express.Router()
const handler = new AcHistoryController(academicHistoryService)

acHistoryRoutes
    .patch("/update/:id", handler.updateAcademicHistory)

export default acHistoryRoutes;

