import {Router} from "express";
import {NextOfKinController} from "../../controllers/nextOfKin.controller";
import {nextOfKinService} from "../../services";


const nextOfKinRoutes = Router()
const handler = new NextOfKinController(nextOfKinService)
nextOfKinRoutes
    .post("/create/:student_id", handler.createNextOfKin)
    .put("/update", handler.updateNextOfKin)
    .delete("/:id", handler.deleteNextOfKin)

export default nextOfKinRoutes;

