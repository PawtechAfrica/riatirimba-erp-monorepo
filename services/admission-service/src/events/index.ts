import {EventEmitter} from "node:events";

export enum AppEvents {
    APPLICANT_ADMITTED = "applicant_admitted",
    MIGRATE_APPLICANTS = "migrate_applicants"
}


const eventBus = new EventEmitter()

export default eventBus;

