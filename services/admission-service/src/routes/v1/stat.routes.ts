import {Router} from "express";
import {statService} from "../../services";
import {StatsController} from "../../controllers/stats.controller";


const statRoutes = Router()

const handler = new StatsController(statService)

statRoutes
    .get("/intake-stat/:intake_key", handler.getOneIntakeStat)

export default statRoutes;

