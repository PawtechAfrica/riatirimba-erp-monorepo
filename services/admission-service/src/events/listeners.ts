import eventBus, {AppEvents} from "./index";
import {admissionService} from "../services";
import {Application} from "express";


export default function bootstrapListeners() {
    console.log(`👂 STARTING CRON LISTENERS`);
    eventBus.on(AppEvents.APPLICANT_ADMITTED, admissionService.migrateApplicants)
}


